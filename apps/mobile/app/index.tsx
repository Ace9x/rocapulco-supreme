import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "@/lib/session";
import { theme } from "@/lib/theme";

export default function Index() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bgDark, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={theme.gold} />
      </View>
    );
  }

  return session ? <Redirect href="/(rider)/home" /> : <Redirect href="/(auth)/phone" />;
}
