import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

interface EntitlementGateProps {
  children: ReactNode;
  appId: string;
  fallback?: string;
}

/**
 * Redirect rule: if the signed-in user lacks an active entitlement for
 * `appId`, send them to the fallback (default: the product detail page so
 * they can buy or start a trial). Admins always have access.
 */
export function EntitlementGate({ children, appId, fallback }: EntitlementGateProps) {
  const { user, isAdmin, isLoading } = useAuthContext();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setAllowed(false);
      return;
    }
    if (isAdmin) {
      setAllowed(true);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("app_entitlements")
        .select("id")
        .eq("user_id", user.id)
        .eq("app_id", appId)
        .eq("status", "active")
        .limit(1);
      if (cancelled) return;
      setAllowed((data ?? []).length > 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isAdmin, appId]);

  if (isLoading || allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!allowed) return <Navigate to={fallback ?? `/apps/${appId}`} replace />;
  return <>{children}</>;
}