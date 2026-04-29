import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { LAUNCH_CHANNELS } from "@/lib/launchChannels";

export interface ConsentRow {
  channel: string;
  enabled: boolean;
}

export function useLaunchConsents() {
  const { user } = useAuthContext();
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("launch_consents")
      .select("channel, enabled")
      .eq("user_id", user.id);
    const map: Record<string, boolean> = {};
    LAUNCH_CHANNELS.forEach((c) => (map[c.key] = false));
    (data ?? []).forEach((r: any) => (map[r.channel] = !!r.enabled));
    setConsents(map);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const setConsent = useCallback(
    async (channel: string, enabled: boolean) => {
      if (!user) return;
      setConsents((c) => ({ ...c, [channel]: enabled }));
      const { error } = await supabase
        .from("launch_consents")
        .upsert(
          { user_id: user.id, channel, enabled },
          { onConflict: "user_id,channel" },
        );
      if (error) {
        // revert
        setConsents((c) => ({ ...c, [channel]: !enabled }));
        throw error;
      }
    },
    [user],
  );

  const enabledChannels = Object.entries(consents)
    .filter(([, v]) => v)
    .map(([k]) => k);

  return { consents, enabledChannels, setConsent, loading, reload: load };
}