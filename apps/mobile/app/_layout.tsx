import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider } from "@/lib/session";
import { theme } from "@/lib/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.bgDark },
            headerTintColor: theme.gold,
            headerTitleStyle: { color: theme.text },
            contentStyle: { backgroundColor: theme.bgDark },
          }}
        />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
