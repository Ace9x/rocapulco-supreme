import { formatFare, type Driver, type Ride } from "@rocapulco/shared";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function Dashboard({ session }: { session: Session }) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRides = async () => {
      const { data, error: err } = await supabase
        .from("rides")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (err) setError(err.message);
      else setRides((data ?? []) as Ride[]);
    };
    const loadDrivers = async () => {
      const { data } = await supabase.from("drivers").select("*").order("name");
      setDrivers((data ?? []) as Driver[]);
    };
    loadRides();
    loadDrivers();

    const ridesChannel = supabase
      .channel("dispatch:rides")
      .on("postgres_changes", { event: "*", schema: "public", table: "rides" }, loadRides)
      .subscribe();
    const driversChannel = supabase
      .channel("dispatch:drivers")
      .on("postgres_changes", { event: "*", schema: "public", table: "drivers" }, loadDrivers)
      .subscribe();

    return () => {
      supabase.removeChannel(ridesChannel);
      supabase.removeChannel(driversChannel);
    };
  }, []);

  const assign = async (rideId: string, driverId: string) => {
    setError(null);
    const { error: err } = await supabase
      .from("rides")
      .update({ driver_id: driverId, status: "dispatched" })
      .eq("id", rideId);
    if (err) setError(err.message);
  };

  const complete = async (rideId: string) => {
    const { error: err } = await supabase.from("rides").update({ status: "completed" }).eq("id", rideId);
    if (err) setError(err.message);
  };

  const signOut = () => supabase.auth.signOut();

  const pending = rides.filter((r) => r.status === "pending");
  const active = rides.filter(
    (r) => r.status !== "pending" && r.status !== "completed" && r.status !== "canceled",
  );

  return (
    <div className="layout">
      <div className="header">
        <div className="brand">ROCAPULCO · DISPATCH</div>
        <div>
          <span className="muted" style={{ marginRight: 16 }}>{session.user.email}</span>
          <button onClick={signOut} style={{ background: "transparent", color: "var(--text-dim)" }}>Sign out</button>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}

      <Section title={`Pending (${pending.length})`}>
        {pending.length === 0 ? (
          <div className="muted" style={{ padding: 16 }}>No pending rides.</div>
        ) : (
          pending.map((r) => (
            <RideRow key={r.id} ride={r} drivers={drivers} onAssign={assign} />
          ))
        )}
      </Section>

      <div style={{ height: 24 }} />

      <Section title={`Active (${active.length})`}>
        {active.length === 0 ? (
          <div className="muted" style={{ padding: 16 }}>No active rides.</div>
        ) : (
          active.map((r) => (
            <ActiveRow key={r.id} ride={r} drivers={drivers} onComplete={complete} />
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

function RideRow({
  ride,
  drivers,
  onAssign,
}: {
  ride: Ride;
  drivers: Driver[];
  onAssign: (rideId: string, driverId: string) => void;
}) {
  const [selected, setSelected] = useState("");
  const online = drivers.filter((d) => d.status === "online");

  return (
    <div className="ride-row">
      <div>
        <div style={{ fontSize: 12 }} className="muted">Pickup</div>
        <div>{ride.pickup_address}</div>
      </div>
      <div>
        <div style={{ fontSize: 12 }} className="muted">Dropoff</div>
        <div>{ride.dropoff_address}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{formatFare(ride.fare_cents)}</div>
      </div>
      <select value={selected} onChange={(e) => setSelected(e.target.value)} style={{ width: 200 }}>
        <option value="">Select driver…</option>
        {online.map((d) => (
          <option key={d.id} value={d.id}>{d.name} · {d.vehicle}</option>
        ))}
      </select>
      <button disabled={!selected} onClick={() => onAssign(ride.id, selected)}>Assign</button>
    </div>
  );
}

function ActiveRow({
  ride,
  drivers,
  onComplete,
}: {
  ride: Ride;
  drivers: Driver[];
  onComplete: (rideId: string) => void;
}) {
  const driver = drivers.find((d) => d.id === ride.driver_id);
  return (
    <div className="ride-row">
      <div>
        <div style={{ fontSize: 12 }} className="muted">Pickup → Dropoff</div>
        <div>{ride.pickup_address} → {ride.dropoff_address}</div>
      </div>
      <div>
        <div style={{ fontSize: 12 }} className="muted">Driver</div>
        <div>{driver?.name ?? "—"}</div>
      </div>
      <span className={`status-pill status-${ride.status}`}>{ride.status}</span>
      <button onClick={() => onComplete(ride.id)}>Complete</button>
    </div>
  );
}
