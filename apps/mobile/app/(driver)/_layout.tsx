import { Redirect, Stack } from "expo-router";
import { useProfile } from "@/lib/profile";
import { useSession } from "@/lib/session";

export default function DriverLayout() {
  const { session, loading: sessionLoading } = useSession();
  const { profile, loading: profileLoading } = useProfile(session);

  if (sessionLoading || (session && profileLoading)) return null;
  if (!session) return <Redirect href="/(auth)/phone" />;
  if (!profile?.full_name) return <Redirect href="/(auth)/name" />;
  if (profile.role !== "driver") return <Redirect href="/(rider)/home" />;

  return <Stack />;
}
