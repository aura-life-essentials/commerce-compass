import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ScrollText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface AuditRow {
  id: string;
  agent_name: string;
  action_type: string;
  channel: string | null;
  summary: string;
  status: string;
  created_at: string;
}

export function AiActionAuditLog({ limit = 50 }: { limit?: number }) {
  const { user } = useAuthContext();
  const [rows, setRows] = useState<AuditRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("ai_action_audit")
        .select("id, agent_name, action_type, channel, summary, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (!cancelled) setRows((data as AuditRow[]) ?? []);
    };
    load();
    const t = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [user, limit]);

  return (
    <Card className="oro-card border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ScrollText className="w-4 h-4 text-primary" /> AI action audit
          <Badge variant="outline" className="text-xs">live</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Every meaningful action your AI agents take. Updates every 8s.
        </p>
      </CardHeader>
      <CardContent>
        {rows === null ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No agent activity yet.</p>
        ) : (
          <ul className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
            {rows.map((r) => (
              <li key={r.id} className="rounded-md border border-border/40 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{r.agent_name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="text-muted-foreground text-xs mt-0.5">
                  <Badge variant="secondary" className="mr-1.5 text-[10px]">
                    {r.action_type}
                  </Badge>
                  {r.channel && (
                    <Badge variant="outline" className="mr-1.5 text-[10px]">
                      {r.channel}
                    </Badge>
                  )}
                  <span>{r.summary}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}