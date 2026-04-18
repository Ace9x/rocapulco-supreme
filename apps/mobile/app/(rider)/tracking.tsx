import { formatFare, type Driver, type Ride } from "@rocapulco/shared";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

export default function TrackingScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [ride, setRide] = useState<Ride | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;

    supabase
      .from("rides")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) setRide(data as Ride);
      });

    const channel = supabase
      .channel(`ride:${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rides", filter: `id=eq.${id}` },
        (payload) => {
          if (active) setRide(payload.new as Ride);
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Driver info + live location. Re-subscribes when the assigned driver changes.
  useEffect(() => {
    if (!ride?.driver_id) {
      setDriver(null);
      return;
    }
    const driverId = ride.driver_id;
    let active = true;

    supabase
      .from("drivers")
      .select("*")
      .eq("id", driverId)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) setDriver(data as Driver);
      });

    const channel = supabase
      .channel(`driver:${driverId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "drivers", filter: `id=eq.${driverId}` },
        (payload) => {
          if (active) setDriver(payload.new as Driver);
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [ride?.driver_id]);

  if (!ride) {
    return (
      <SafeAreaView style={[styles.root, styles.center]}>
        <ActivityIndicator color={theme.gold} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.status}>{labelFor(ride.status)}</Text>
        <Text style={styles.fare}>
          {ride.fare_cents != null ? formatFare(ride.fare_cents) : "Fare pending"}
        </Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Pickup</Text>
          <Text style={styles.rowValue}>{ride.pickup_address}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Dropoff</Text>
          <Text style={styles.rowValue}>{ride.dropoff_address}</Text>
        </View>

        {driver ? (
          <View style={styles.driver}>
            <Text style={styles.driverTitle}>Your driver</Text>
            <Text style={styles.driverName}>{driver.name}</Text>
            <Text style={styles.driverMeta}>{driver.vehicle} · {driver.plate}</Text>
            <Text style={styles.driverMeta}>★ {driver.rating.toFixed(1)}</Text>
            {driver.lat != null && driver.lng != null ? (
              <Text style={styles.coords}>
                At {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
              </Text>
            ) : null}
          </View>
        ) : (
          <Text style={styles.waiting}>Finding your driver…</Text>
        )}

        {ride.status === "completed" || ride.status === "canceled" ? (
          <Pressable style={styles.button} onPress={() => router.replace("/(rider)/home")}>
            <Text style={styles.buttonText}>Back to home</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function labelFor(status: Ride["status"]): string {
  switch (status) {
    case "pending": return "Requesting…";
    case "dispatched": return "Driver on the way";
    case "en_route": return "Driver en route";
    case "arrived": return "Driver arrived";
    case "on_trip": return "On trip";
    case "completed": return "Completed";
    case "canceled": return "Canceled";
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bgDark, padding: 24 },
  center: { alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: theme.bgCard, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: theme.border },
  status: { color: theme.gold, fontSize: 14, textTransform: "uppercase", letterSpacing: 2 },
  fare: { color: theme.text, fontSize: 40, fontWeight: "800", marginTop: 8 },
  row: { marginTop: 20 },
  rowLabel: { color: theme.textDim, fontSize: 12, textTransform: "uppercase" },
  rowValue: { color: theme.text, fontSize: 16, marginTop: 2 },
  driver: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: theme.border },
  driverTitle: { color: theme.textDim, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  driverName: { color: theme.gold, fontSize: 22, fontWeight: "700", marginTop: 6 },
  driverMeta: { color: theme.text, marginTop: 2 },
  coords: { color: theme.textDim, marginTop: 6, fontSize: 12 },
  waiting: { color: theme.textDim, marginTop: 24, textAlign: "center" },
  button: { backgroundColor: theme.gold, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 24 },
  buttonText: { color: theme.bgDark, fontSize: 16, fontWeight: "700" },
});
