import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async () => {
    if (!phone) {
      setError("Phone number missing — start over.");
      return;
    }
    if (code.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setChecking(true);
    setError(null);
    const { error: err } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
    setChecking(false);
    if (err) {
      setError(err.message);
      return;
    }
    // Route tree owned by app/index.tsx — go there so it can decide rider/driver/name-capture.
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.inner}>
        <Text style={styles.title}>Enter code</Text>
        <Text style={styles.subtitle}>Sent to {phone ?? "your phone"}</Text>

        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          placeholderTextColor={theme.textDim}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={verify} disabled={checking}>
          {checking ? <ActivityIndicator color={theme.bgDark} /> : <Text style={styles.buttonText}>Verify</Text>}
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Use a different number</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bgDark },
  inner: { flex: 1, padding: 24, justifyContent: "center" },
  title: { color: theme.text, fontSize: 28, fontWeight: "700" },
  subtitle: { color: theme.textDim, marginTop: 4, marginBottom: 32 },
  input: {
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 16,
    color: theme.text,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: "center",
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
  link: { color: theme.gold, textAlign: "center", marginTop: 24 },
});
