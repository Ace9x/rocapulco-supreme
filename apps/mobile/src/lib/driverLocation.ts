import * as Location from "expo-location";
import { useEffect } from "react";
import { supabase } from "./supabase";

// Pushes the driver's GPS to public.drivers (lat/lng) every 15s while online.
// Foreground-only; background tracking will be added later with a dedicated
// task and a proper UX prompt.
export function useDriverLocationBroadcast(opts: { driverId: string | null; online: boolean }) {
  const { driverId, online } = opts;
  useEffect(() => {
    if (!driverId || !online) return;
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const start = async () => {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted" || cancelled) return;

      const push = async () => {
        try {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (cancelled) return;
          await supabase
            .from("drivers")
            .update({ lat: pos.coords.latitude, lng: pos.coords.longitude })
            .eq("id", driverId);
        } catch {
          // Transient failures are ignored; next tick tries again.
        }
      };
      push();
      timer = setInterval(push, 15000);
    };
    start();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [driverId, online]);
}
