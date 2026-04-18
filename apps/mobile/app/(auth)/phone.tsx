import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

export default function PhoneScreen() {
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    const normalized = normalize(phone);
    if (!normalized) {
      setError("Enter a valid US phone number.");
      return;
    }
    setSending(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({ phone: normalized });
    setSending(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push({ pathname: "/(auth)/verify", params: { phone: normalized } });
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.inner}>
        <Text style={styles.brand}>ROCAPULCO</Text>
        <Text style={styles.tagline}>Premium rides, Far Rockaway</Text>

        <Text style={styles.label}>Phone number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="10-digit number"
          placeholderTextColor={theme.textDim}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={send} disabled={sending}>
          {sending ? <ActivityIndicator color={theme.bgDark} /> : <Text style={styles.buttonText}>Send code</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// Accepts 10-digit US numbers and returns them in E.164. Returns null for anything else —
// Supabase phone auth rejects non-E.164 silently otherwise.
function normalize(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bgDark },
  inner: { flex: 1, padding: 24, justifyContent: "center" },
  brand: { color: theme.gold, fontSize: 36, fontWeight: "900", letterSpacing: 4, textAlign: "center" },
  tagline: { color: theme.textDim, textAlign: "center", marginBottom: 48, marginTop: 4 },
  label: { color: theme.text, fontSize: 14, marginBottom: 8 },
  input: {
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 16,
    color: theme.text,
    fontSize: 18,
  },
  error: { color: theme.red, marginTop: 12 },
  button: {
    backgroundColor: theme.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: { color: theme.bgDark, fontSize: 16, fontWeight: "700" },
});
