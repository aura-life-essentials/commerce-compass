import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface Entitlement {
  app_id: string;
  status: string;
  expires_at: string | null;
  stripe_subscription_id: string | null;
}

/**
 * Returns the set of app_ids the current user can access right now.
 * Powered by the app_entitlements table (granted by Stripe webhook /
 * grant-app-entitlements self-heal).
 */
export function useEntitlements() {
  const { user } = useAuthContext();
  const [entitledApps, setEntitledApps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setEntitledApps(new Set()); setLoading(false); return; }
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from('app_entitlements')
        .select('app_id, status, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active');
      if (cancelled) return;
      const now = Date.now();
      const set = new Set(
        (data || [])
          .filter((r: any) => !r.expires_at || new Date(r.expires_at).getTime() > now)
          .map((r: any) => r.app_id as string),
      );
      setEntitledApps(set);
      setLoading(false);
    };
    load();

    // Live updates when webhook grants new access
    const ch = supabase
      .channel(`entitlements:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_entitlements', filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [user]);

  const hasAccess = (appId: string) => entitledApps.has(appId);
  return { entitledApps, hasAccess, loading };
}