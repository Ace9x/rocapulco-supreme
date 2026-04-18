import { formatFare, type Driver, type Ride } from "@rocapulco/shared";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

export function Dashboard({ session }: { session: Session }) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [role, setRole] = useState<"rider" | "driver" | "dispatcher" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Role gate. Assigns would silently fail under RLS if the logged-in user
  // isn't a dispatcher; surface that immediately.
  useEffect(() => {
    supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setRole((data?.role as typeof role) ?? null);
      });
  }, [session.user.id]);

  useEffect(() => {
    const loadRides = async () => {
      const { data, error: err } = await supabase
        .from("rides")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (err) setError(err.message);
      else setRides((data ?? []) as Ride[]);
    };
    const loadDrivers = async () => {
      const { data } = await supabase.from("drivers").select("*").order("name");
      setDrivers((data ?? []) as Driver[]);
    };
    loadRides();
    loadDrivers();

    // Realtime: update a single row in state instead of refetching everything.
    const ridesChannel = supabase
      .channel("dispatch:rides")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "rides" }, (payload) => {
        setRides((prev) => [payload.new as Ride, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rides" }, (payload) => {
        setRides((prev) => prev.map((r) => (r.id === (payload.new as Ride).id ? (payload.new as Ride) : r)));
      })
      .subscribe();
    const driversChannel = supabase
      .channel("dispatch:drivers")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "drivers" }, (payload) => {
        setDrivers((prev) => prev.map((d) => (d.id === (payload.new as Driver).id ? (payload.new as Driver) : d)));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ridesChannel);
      supabase.removeChannel(driversChannel);
    };
  }, []);

  const assign = async (rideId: string, driverId: string, fareCents: number | null) => {
    setError(null);
    const update: Partial<Ride> = { driver_id: driverId, status: "dispatched" };
    if (fareCents != null) update.fare_cents = fareCents;
    const { error: err } = await supabase.from("rides").update(update).eq("id", rideId);
    if (err) setError(err.message);
  };

  const complete = async (rideId: string) => {
    const { error: err } = await supabase.from("rides").update({ status: "completed" }).eq("id", rideId);
    if (err) setError(err.message);
  };

  const cancel = async (rideId: string) => {
    const { error: err } = await supabase.from("rides").update({ status: "canceled" }).eq("id", rideId);
    if (err) setError(err.message);
  };

  const signOut = () => supabase.auth.signOut();

  const pending = useMemo(() => rides.filter((r) => r.status === "pending"), [rides]);
  const active = useMemo(
    () => rides.filter((r) => r.status !== "pending" && r.status !== "completed" && r.status !== "canceled"),
    [rides],
  );

  const identity = session.user.phone ?? session.user.email ?? session.user.id;

  return (
    <div className="layout">
      <div className="header">
        <div className="brand">ROCAPULCO · DISPATCH</div>
        <div>
          <span className="muted" style={{ marginRight: 16 }}>{identity}</span>
          <button onClick={signOut} style={{ background: "transparent", color: "var(--text-dim)" }}>Sign out</button>
        </div>
      </div>

      {role && role !== "dispatcher" ? (
        <div className="error">
          This account is signed in as <b>{role}</b>. Assignments will be denied.
          Promote this account in Supabase: <code>update profiles set role='dispatcher' where id='{session.user.id}';</code>
        </div>
      ) : null}
      {error ? <div className="error">{error}</div> : null}

      <Section title={`Pending (${pending.length})`}>
        {pending.length === 0 ? (
          <div className="muted" style={{ padding: 16 }}>No pending rides.</div>
        ) : (
          pending.map((r) => (
            <PendingRow key={r.id} ride={r} drivers={drivers} onAssign={assign} onCancel={cancel} />
          ))
        )}
      </Section>

      <div style={{ height: 24 }} />

      <Section title={`Active (${active.length})`}>
        {active.length === 0 ? (
          <div className="muted" style={{ padding: 16 }}>No active rides.</div>
        ) : (
          active.map((r) => (
            <ActiveRow key={r.id} ride={r} drivers={drivers} onComplete={complete} onCancel={cancel} />
          ))
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h2 style={{ margin: "0 0 12px 0", fontSize: 16 }}>{title}</h2>
      {children}
    </div>
  );
}

function PendingRow({
  ride,
  drivers,
  onAssign,
  onCancel,
}: {
  ride: Ride;
  drivers: Driver[];
  onAssign: (rideId: string, driverId: string, fareCents: number | null) => void;
  onCancel: (rideId: string) => void;
}) {
  const [selected, setSelected] = useState("");
  const [fareDollars, setFareDollars] = useState(
    ride.fare_cents != null ? (ride.fare_cents / 100).toFixed(2) : "",
  );
  const online = drivers.filter((d) => d.status === "online");

  const parsedFare = parseFareDollars(fareDollars);
  const canAssign = !!selected && parsedFare != null && parsedFare > 0;

  return (
    <div className="ride-row" style={{ gridTemplateColumns: "1fr 1fr 110px 180px auto auto", gap: 10 }}>
      <div>
        <div style={{ fontSize: 12 }} className="muted">Pickup</div>
        <div>{ride.pickup_address}</div>
      </div>
      <div>
        <div style={{ fontSize: 12 }} className="muted">Dropoff</div>
        <div>{ride.dropoff_address}</div>
      </div>
      <input
        value={fareDollars}
        onChange={(e) => setFareDollars(e.target.value)}
        placeholder="Fare $"
        inputMode="decimal"
      />
      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        <option value="">Driver…</option>
        {online.map((d) => (
          <option key={d.id} value={d.id}>{d.name} · {d.vehicle}</option>
        ))}
      </select>
      <button disabled={!canAssign} onClick={() => onAssign(ride.id, selected, parsedFare! * 100)}>Assign</button>
      <button
        onClick={() => onCancel(ride.id)}
        style={{ background: "transparent", color: "var(--text-dim)", border: "1px solid var(--border)" }}
      >
        Cancel
      </button>
    </div>
  );
}

function ActiveRow({
  ride,
  drivers,
  onComplete,
  onCancel,
}: {
  ride: Ride;
  drivers: Driver[];
  onComplete: (rideId: string) => void;
  onCancel: (rideId: string) => void;
}) {
  const driver = drivers.find((d) => d.id === ride.driver_id);
  return (
    <div className="ride-row" style={{ gridTemplateColumns: "1fr 1fr auto auto auto", gap: 10 }}>
      <div>
        <div style={{ fontSize: 12 }} className="muted">{ride.pickup_address}</div>
        <div>→ {ride.dropoff_address}</div>
        {ride.fare_cents != null ? (
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{formatFare(ride.fare_cents)}</div>
        ) : null}
      </div>
      <div>
        <div style={{ fontSize: 12 }} className="muted">Driver</div>
        <div>{driver?.name ?? "—"}</div>
      </div>
      <span className={`status-pill status-${ride.status}`}>{ride.status}</span>
      <button onClick={() => onComplete(ride.id)}>Complete</button>
      <button
        onClick={() => onCancel(ride.id)}
        style={{ background: "transparent", color: "var(--text-dim)", border: "1px solid var(--border)" }}
      >
        Cancel
      </button>
    </div>
  );
}

function parseFareDollars(raw: string): number | null {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
