import { formatFare, quoteFare } from "@rocapulco/shared";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

type PickupCoords = { lat: number; lng: number } | null;

export default function HomeScreen() {
  const { session } = useSession();
  const [pickup, setPickup] = useState("");
  const [pickupCoords, setPickupCoords] = useState<PickupCoords>(null);
  const [dropoff, setDropoff] = useState("");
  const [locating, setLocating] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flat-rate destinations (JFK, LGA) get a fare quote immediately.
  // Metered rides don't get a client-side estimate — dispatcher confirms the fare
  // when assigning a driver. This avoids shipping a fake distance assumption.
  const quote = useMemo(
    () => {
      if (!dropoff.trim()) return null;
      const q = quoteFare({ dropoffAddress: dropoff, miles: 0, minutes: 0 });
      return q.flat_rate_key ? q : null;
    },
    [dropoff],
  );

  const useMyLocation = async () => {
    setError(null);
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        setError("Location permission denied.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const reverse = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const addr = formatReverseGeocode(reverse[0]);
      setPickupCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setPickup(addr || `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not get location.");
    } finally {
      setLocating(false);
    }
  };

  const book = async () => {
    if (!session?.user) {
      setError("Session expired — sign in again.");
      return;
    }
    if (!pickup.trim() || !dropoff.trim()) {
      setError("Fill pickup and dropoff.");
      return;
    }
    setBooking(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("rides")
      .insert({
        rider_id: session.user.id,
        pickup_address: pickup.trim(),
        pickup_lat: pickupCoords?.lat ?? null,
        pickup_lng: pickupCoords?.lng ?? null,
        dropoff_address: dropoff.trim(),
        fare_cents: quote?.fare_cents ?? null,
        payment_method: "cash",
      })
      .select("id")
      .single();
    setBooking(false);
    if (err || !data) {
      setError(err?.message ?? "Could not create ride.");
      return;
    }
    router.push({ pathname: "/(rider)/tracking", params: { id: data.id } });
  };

  const signOut = async () => {
    const { error: err } = await supabase.auth.signOut();
    if (err) setError(err.message);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>ROCAPULCO</Text>
        <Pressable onPress={signOut}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.pickupHeader}>
          <Text style={styles.label}>Pickup</Text>
          <Pressable onPress={useMyLocation} disabled={locating}>
            <Text style={styles.gpsButton}>
              {locating ? "Locating…" : "Use my location"}
            </Text>
          </Pressable>
        </View>
        <TextInput
          value={pickup}
          onChangeText={(v) => {
            setPickup(v);
            setPickupCoords(null);
          }}
          placeholder="Address"
          placeholderTextColor={theme.textDim}
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Dropoff</Text>
        <TextInput
          value={dropoff}
          onChangeText={setDropoff}
          placeholder="JFK Terminal 4, LaGuardia, …"
          placeholderTextColor={theme.textDim}
          style={styles.input}
        />

        {quote ? (
          <View style={styles.quote}>
            <Text style={styles.quoteLabel}>Flat rate · {quote.flat_rate_key?.toUpperCase()}</Text>
            <Text style={styles.quoteValue}>{formatFare(quote.fare_cents)}</Text>
          </View>
        ) : dropoff.trim() ? (
          <View style={styles.meteredNote}>
            <Text style={styles.meteredText}>Metered fare — dispatcher confirms before pickup.</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={book} disabled={booking || !pickup.trim() || !dropoff.trim()}>
          {booking ? <ActivityIndicator color={theme.bgDark} /> : <Text style={styles.buttonText}>Request ride</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function formatReverseGeocode(r: Location.LocationGeocodedAddress | undefined): string {
  if (!r) return "";
  const parts = [
    [r.streetNumber, r.street].filter(Boolean).join(" "),
    r.city,
    r.region,
  ].filter((s) => s && s.length > 0);
  return parts.join(", ");
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bgDark, padding: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  brand: { color: theme.gold, fontSize: 22, fontWeight: "900", letterSpacing: 3 },
  signOut: { color: theme.textDim },
  card: { backgroundColor: theme.bgCard, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.border },
  pickupHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { color: theme.textDim, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  gpsButton: { color: theme.gold, fontSize: 12 },
  input: {
    backgroundColor: theme.bgDark,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    padding: 14,
    color: theme.text,
    fontSize: 16,
    marginTop: 6,
  },
  quote: {
    marginTop: 20,
    padding: 16,
    backgroundColor: theme.bgDark,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.gold,
  },
  quoteLabel: { color: theme.goldLight, fontSize: 12, letterSpacing: 1 },
  quoteValue: { color: theme.gold, fontSize: 32, fontWeight: "800", marginTop: 4 },
  meteredNote: {
    marginTop: 20,
    padding: 14,
    backgroundColor: theme.bgDark,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  meteredText: { color: theme.textDim, fontSize: 13 },
  error: { color: theme.red, marginTop: 12 },
  button: { backgroundColor: theme.gold, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 20 },
  buttonText: { color: theme.bgDark, fontSize: 16, fontWeight: "700" },
});
