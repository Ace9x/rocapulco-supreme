import { Redirect, Stack } from "expo-router";
import { useSession } from "@/lib/session";

export default function RiderLayout() {
  const { session, loading } = useSession();
  if (loading) return null;
  if (!session) return <Redirect href="/(auth)/phone" />;
  return <Stack />;
}
