import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useProfile } from "@/lib/profile";
import { useSession } from "@/lib/session";
import { theme } from "@/lib/theme";

export default function Index() {
  const { session, loading: sessionLoading } = useSession();
  const { profile, loading: profileLoading } = useProfile(session);

  if (sessionLoading || (session && profileLoading)) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bgDark, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={theme.gold} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/phone" />;
  if (!profile || !profile.full_name) return <Redirect href="/(auth)/name" />;
  if (profile.role === "driver") return <Redirect href="/(driver)/home" />;
  return <Redirect href="/(rider)/home" />;
}
