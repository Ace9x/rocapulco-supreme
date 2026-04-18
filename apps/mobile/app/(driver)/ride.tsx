import { formatFare, type Ride, type RideStatus } from "@rocapulco/shared";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

// Valid forward transitions a driver can make on their own ride. Canceling a
// ride is intentionally not in here — that goes through dispatch.
const NEXT_STATUS: Partial<Record<RideStatus, RideStatus>> = {
  dispatched: "en_route",
  en_route: "arrived",
  arrived: "on_trip",
  on_trip: "completed",
};

const BUTTON_LABEL: Partial<Record<RideStatus, string>> = {
  dispatched: "Start driving",
  en_route: "I've arrived",
  arrived: "Start trip",
  on_trip: "Complete trip",
};

export default function DriverRide() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [ride, setRide] = useState<Ride | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;

    supabase.from("rides").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (active && data) setRide(data as Ride);
    });

    const channel = supabase
      .channel(`driver-ride:${id}`)
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

  const advance = async () => {
    if (!ride) return;
    const next = NEXT_STATUS[ride.status];
    if (!next) return;
    setUpdating(true);
    setError(null);
    const { error: err } = await supabase.from("rides").update({ status: next }).eq("id", ride.id);
    setUpdating(false);
    if (err) setError(err.message);
    if (next === "completed") router.replace("/(driver)/home");
  };

  const openInMaps = () => {
    if (!ride) return;
    const target = ride.status === "on_trip" ? ride.dropoff_address : ride.pickup_address;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target)}`;
    Linking.openURL(url);
  };

  if (!ride) {
    return (
      <SafeAreaView style={[styles.root, styles.center]}>
        <ActivityIndicator color={theme.gold} />
      </SafeAreaView>
    );
  }

  const nextLabel = BUTTON_LABEL[ride.status];

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.status}>{ride.status.replace("_", " ").toUpperCase()}</Text>
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

        <Pressable style={styles.navButton} onPress={openInMaps}>
          <Text style={styles.navButtonText}>Open in Google Maps</Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {nextLabel ? (
          <Pressable style={styles.button} onPress={advance} disabled={updating}>
            {updating ? <ActivityIndicator color={theme.bgDark} /> : <Text style={styles.buttonText}>{nextLabel}</Text>}
          </Pressable>
        ) : (
          <Pressable style={styles.button} onPress={() => router.replace("/(driver)/home")}>
            <Text style={styles.buttonText}>Back to home</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bgDark, padding: 24 },
  center: { alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: theme.bgCard, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: theme.border },
  status: { color: theme.gold, fontSize: 14, letterSpacing: 2 },
  fare: { color: theme.text, fontSize: 40, fontWeight: "800", marginTop: 8 },
  row: { marginTop: 20 },
  rowLabel: { color: theme.textDim, fontSize: 12, textTransform: "uppercase" },
  rowValue: { color: theme.text, fontSize: 16, marginTop: 2 },
  navButton: {
    marginTop: 20,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.gold,
    alignItems: "center",
  },
  navButtonText: { color: theme.gold, fontWeight: "700" },
  error: { color: theme.red, marginTop: 12 },
  button: { backgroundColor: theme.gold, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 20 },
  buttonText: { color: theme.bgDark, fontSize: 16, fontWeight: "700" },
});
