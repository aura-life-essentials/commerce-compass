import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Activity, Brain, CheckCircle2, Clock, AlertTriangle, Zap, DollarSign, Globe, Video, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface AgentLog {
  id: string;
  agent_name: string;
  agent_role: string;
  action: string;
  status: string;
  created_at: string;
  duration_ms: number | null;
  error_message: string | null;
}

interface AIDecision {
  id: string;
  decision_type: string;
  reasoning: string | null;
  confidence_score: number | null;
  executed: boolean;
  created_at: string;
  output_action: any;
}

export const RealTimeFeed = () => {
  const [liveEvents, setLiveEvents] = useState<(AgentLog | AIDecision)[]>([]);

  const { data: recentLogs } = useQuery({
    queryKey: ["real-agent-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as AgentLog[];
    },
    refetchInterval: 10000,
  });

  const { data: recentDecisions } = useQuery({
    queryKey: ["real-ai-decisions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as AIDecision[];
    },
    refetchInterval: 10000,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("live-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "agent_logs" }, (payload) => {
        setLiveEvents(prev => [payload.new as AgentLog, ...prev].slice(0, 50));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ai_decisions" }, (payload) => {
        setLiveEvents(prev => [payload.new as AIDecision, ...prev].slice(0, 50));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Merge real-time events with historical data
  const allEvents = [
    ...liveEvents,
    ...(recentLogs || []),
    ...(recentDecisions || []),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 30);

  // De-duplicate by id
  const seen = new Set<string>();
  const uniqueEvents = allEvents.filter(e => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  const isLog = (e: any): e is AgentLog => 'agent_name' in e && 'action' in e;
  const isDecision = (e: any): e is AIDecision => 'decision_type' in e && 'reasoning' in e;

  const getStatusIcon = (event: AgentLog | AIDecision) => {
    if (isLog(event)) {
      if (event.status === 'completed') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      if (event.status === 'error') return <AlertTriangle className="w-4 h-4 text-red-400" />;
      return <Clock className="w-4 h-4 text-amber-400" />;
    }
    if (isDecision(event)) {
      return event.executed 
        ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        : <Brain className="w-4 h-4 text-cyan-400" />;
    }
    return <Activity className="w-4 h-4 text-muted-foreground" />;
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, typeof Brain> = {
      profit_reaper: DollarSign,
      omega_swarm: Zap,
      viral_hunter: Video,
      content_creator: Video,
      traffic_generator: TrendingUp,
      global_expander: Globe,
    };
    return icons[role] || Brain;
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Live Activity Feed</h3>
            <p className="text-sm text-muted-foreground">Real events from your database — no fake data</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
          LIVE
        </Badge>
      </div>

      {uniqueEvents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No activity yet</p>
          <p className="text-sm">Trigger the CEO Brain or run an agent to see real events here</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {uniqueEvents.map((event) => (
            <div
              key={event.id}
              className={cn(
                "p-3 rounded-lg border transition-all",
                "bg-secondary/30 hover:bg-secondary/50",
                isLog(event) && event.status === 'error' && "border-red-500/30",
                isLog(event) && event.status === 'completed' && "border-emerald-500/10",
                isDecision(event) && "border-cyan-500/10"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getStatusIcon(event)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isLog(event) && (
                      <>
                        <span className="font-medium text-sm">{event.agent_name}</span>
                        <Badge variant="outline" className="text-xs">{event.agent_role}</Badge>
                      </>
                    )}
                    {isDecision(event) && (
                      <>
                        <span className="font-medium text-sm">AI Decision</span>
                        <Badge variant="outline" className="text-xs text-cyan-400 border-cyan-500/30">
                          {event.decision_type}
                        </Badge>
                        {event.confidence_score && (
                          <span className="text-xs text-muted-foreground">
                            {(event.confidence_score * 100).toFixed(0)}% confidence
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {isLog(event) ? event.action : event.reasoning || event.output_action?.action || event.decision_type}
                  </p>
                  {isLog(event) && event.error_message && (
                    <p className="text-xs text-red-400 mt-1">{event.error_message}</p>
                  )}
                  {isLog(event) && event.duration_ms && (
                    <span className="text-xs text-muted-foreground">⏱ {event.duration_ms}ms</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
