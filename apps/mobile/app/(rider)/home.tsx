import { formatFare, quoteFare } from "@rocapulco/shared";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

export default function HomeScreen() {
  const { session } = useSession();
  const [pickup, setPickup] = useState("1614 Mott Ave, Far Rockaway");
  const [dropoff, setDropoff] = useState("");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No distance API yet — assume 5 miles / 15 minutes for metered quotes.
  // JFK/LGA still resolve to flat rates via the dropoff string.
  const quote = useMemo(
    () => (dropoff ? quoteFare({ dropoffAddress: dropoff, miles: 5, minutes: 15 }) : null),
    [dropoff],
  );

  const book = async () => {
    if (!session?.user || !pickup || !dropoff || !quote) {
      setError("Fill pickup and dropoff.");
      return;
    }
    setBooking(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("rides")
      .insert({
        rider_id: session.user.id,
        pickup_address: pickup,
        dropoff_address: dropoff,
        fare_cents: quote.fare_cents,
        payment_method: "card",
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

  const signOut = () => supabase.auth.signOut();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>ROCAPULCO</Text>
        <Pressable onPress={signOut}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Pickup</Text>
        <TextInput value={pickup} onChangeText={setPickup} style={styles.input} placeholderTextColor={theme.textDim} />

        <Text style={[styles.label, { marginTop: 16 }]}>Dropoff</Text>
        <TextInput
          value={dropoff}
          onChangeText={setDropoff}
          placeholder="JFK Terminal 4"
          placeholderTextColor={theme.textDim}
          style={styles.input}
        />

        {quote ? (
          <View style={styles.quote}>
            <Text style={styles.quoteLabel}>Fare</Text>
            <Text style={styles.quoteValue}>{formatFare(quote.fare_cents)}</Text>
            {quote.flat_rate_key ? <Text style={styles.flat}>flat rate · {quote.flat_rate_key.toUpperCase()}</Text> : null}
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={book} disabled={booking || !quote}>
          {booking ? <ActivityIndicator color={theme.bgDark} /> : <Text style={styles.buttonText}>Request ride</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bgDark, padding: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  brand: { color: theme.gold, fontSize: 22, fontWeight: "900", letterSpacing: 3 },
  signOut: { color: theme.textDim },
  card: { backgroundColor: theme.bgCard, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.border },
  label: { color: theme.textDim, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
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
  quoteLabel: { color: theme.textDim, fontSize: 12, textTransform: "uppercase" },
  quoteValue: { color: theme.gold, fontSize: 32, fontWeight: "800", marginTop: 4 },
  flat: { color: theme.goldLight, marginTop: 4, fontSize: 12 },
  error: { color: theme.red, marginTop: 12 },
  button: { backgroundColor: theme.gold, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 20 },
  buttonText: { color: theme.bgDark, fontSize: 16, fontWeight: "700" },
});
