import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { Profile } from "@rocapulco/shared";
import { supabase } from "./supabase";

export function useProfile(session: Session | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) setError(err.message);
        setProfile((data as Profile | null) ?? null);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  return { profile, loading, error, setProfile };
}
