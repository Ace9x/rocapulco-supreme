import { formatFare, type Driver, type Ride } from "@rocapulco/shared";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDriverLocationBroadcast } from "@/lib/driverLocation";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

export default function DriverHome() {
  const { session } = useSession();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDriver = useCallback(async () => {
    if (!session?.user) return;
    const { data, error: err } = await supabase
      .from("drivers")
      .select("*")
      .eq("profile_id", session.user.id)
      .maybeSingle();
    if (err) setError(err.message);
    else setDriver((data as Driver | null) ?? null);
    setLoading(false);
  }, [session?.user?.id]);

  const loadRides = useCallback(async (driverId: string) => {
    const { data } = await supabase
      .from("rides")
      .select("*")
      .eq("driver_id", driverId)
      .in("status", ["dispatched", "en_route", "arrived", "on_trip"])
      .order("created_at", { ascending: false });
    setRides((data ?? []) as Ride[]);
  }, []);

  useEffect(() => {
    loadDriver();
  }, [loadDriver]);

  useEffect(() => {
    if (!driver) return;
    loadRides(driver.id);
    const channel = supabase
      .channel(`driver-rides:${driver.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rides", filter: `driver_id=eq.${driver.id}` },
        () => loadRides(driver.id),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [driver?.id, loadRides]);

  useDriverLocationBroadcast({ driverId: driver?.id ?? null, online: driver?.status === "online" });

  const toggleOnline = async (value: boolean) => {
    if (!driver) return;
    setError(null);
    const next = value ? "online" : "offline";
    const { data, error: err } = await supabase
      .from("drivers")
      .update({ status: next })
      .eq("id", driver.id)
      .select("*")
      .single();
    if (err) setError(err.message);
    else if (data) setDriver(data as Driver);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, styles.center]}>
        <ActivityIndicator color={theme.gold} />
      </SafeAreaView>
    );
  }

  if (!driver) {
    return (
      <SafeAreaView style={[styles.root, styles.center]}>
        <Text style={styles.waiting}>No driver record linked to this account.</Text>
        <Text style={[styles.waiting, { marginTop: 8 }]}>
          Dispatcher needs to link your driver row to this profile.
        </Text>
        <Pressable onPress={signOut}>
          <Text style={[styles.signOut, { marginTop: 24 }]}>Sign out</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>ROCAPULCO</Text>
        <Pressable onPress={signOut}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.name}>{driver.name}</Text>
        <Text style={styles.meta}>{driver.vehicle} · {driver.plate}</Text>

        <View style={styles.onlineRow}>
          <Text style={styles.onlineLabel}>{driver.status === "online" ? "Online" : "Offline"}</Text>
          <Switch
            value={driver.status !== "offline"}
            onValueChange={toggleOnline}
            trackColor={{ true: theme.gold, false: theme.border }}
            thumbColor={theme.text}
          />
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.sectionTitle}>Assigned rides</Text>
      <ScrollView>
        {rides.length === 0 ? (
          <Text style={styles.waiting}>No assigned rides.</Text>
        ) : (
          rides.map((r) => (
            <Pressable
              key={r.id}
              style={styles.rideCard}
              onPress={() => router.push({ pathname: "/(driver)/ride", params: { id: r.id } })}
            >
              <Text style={styles.rideStatus}>{r.status.toUpperCase()}</Text>
              <Text style={styles.rideAddr}>{r.pickup_address}</Text>
              <Text style={styles.rideArrow}>↓</Text>
              <Text style={styles.rideAddr}>{r.dropoff_address}</Text>
              {r.fare_cents != null ? <Text style={styles.rideFare}>{formatFare(r.fare_cents)}</Text> : null}
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bgDark, padding: 24 },
  center: { alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  brand: { color: theme.gold, fontSize: 22, fontWeight: "900", letterSpacing: 3 },
  signOut: { color: theme.textDim },
  card: { backgroundColor: theme.bgCard, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.border },
  name: { color: theme.text, fontSize: 20, fontWeight: "700" },
  meta: { color: theme.textDim, marginTop: 4 },
  onlineRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  onlineLabel: { color: theme.text, fontSize: 16, fontWeight: "700" },
  error: { color: theme.red, marginTop: 12 },
  sectionTitle: { color: theme.textDim, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginTop: 24, marginBottom: 8 },
  waiting: { color: theme.textDim, textAlign: "center", marginTop: 24 },
  rideCard: { backgroundColor: theme.bgCard, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: theme.border, marginBottom: 12 },
  rideStatus: { color: theme.gold, fontSize: 11, letterSpacing: 2, marginBottom: 8 },
  rideAddr: { color: theme.text, fontSize: 15 },
  rideArrow: { color: theme.textDim, marginVertical: 4 },
  rideFare: { color: theme.goldLight, marginTop: 8, fontWeight: "700" },
});
