import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

export default function NameScreen() {
  const { session } = useSession();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter your name.");
      return;
    }
    if (!session?.user) {
      setError("Session expired — sign in again.");
      return;
    }
    setSaving(true);
    setError(null);
    // Profile row is auto-created by the auth.users trigger; update the name on it.
    const { error: err } = await supabase
      .from("profiles")
      .update({ full_name: trimmed })
      .eq("id", session.user.id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.inner}>
        <Text style={styles.title}>Your name</Text>
        <Text style={styles.subtitle}>Drivers will see this when they pick you up.</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={theme.textDim}
          autoComplete="name"
          textContentType="name"
          autoCapitalize="words"
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color={theme.bgDark} /> : <Text style={styles.buttonText}>Continue</Text>}
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
    fontSize: 18,
  },
  error: { color: theme.red, marginTop: 12 },
  button: { backgroundColor: theme.gold, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 24 },
  buttonText: { color: theme.bgDark, fontSize: 16, fontWeight: "700" },
});
