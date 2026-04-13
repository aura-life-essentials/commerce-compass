import { useAgentLogs } from "@/hooks/useAgentLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const AGENT_DEFINITIONS = [
  { name: "Lead Qualifier", role: "lead_qualification", description: "Scores and qualifies inbound leads" },
  { name: "Nurture Agent", role: "nurture_sequences", description: "Sends personalized follow-up sequences" },
  { name: "Closer Agent", role: "sales_closing", description: "Handles objections and closing" },
  { name: "Onboarding Agent", role: "customer_onboarding", description: "Creates welcome sequences post-purchase" },
  { name: "Orchestrator", role: "task_routing", description: "Routes tasks to the right agent" },
];

export function AgentStatusPanel() {
  const { data: logs, isLoading } = useAgentLogs(undefined, 200);

  const agentStats = AGENT_DEFINITIONS.map((def) => {
    const agentLogs = logs?.filter((l) => l.agent_name === def.name) || [];
    const completed = agentLogs.filter((l) => l.status === "completed").length;
    const errors = agentLogs.filter((l) => l.status === "error").length;
    const lastLog = agentLogs[0];
    const isActive = lastLog && Date.now() - new Date(lastLog.created_at).getTime() < 300000;

    return {
      ...def,
      completed,
      errors,
      lastActive: lastLog?.created_at,
      status: isActive ? "active" : lastLog ? "idle" : "no_activity",
    };
  });

  if (isLoading) {
    return (
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" /> Agent Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" /> Agent Status
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {agentStats.filter((a) => a.status === "active").length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {agentStats.map((agent) => (
          <div
            key={agent.name}
            className="flex items-center gap-4 rounded-lg border border-border/50 bg-muted/20 p-3"
          >
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                  agent.status === "active"
                    ? "bg-green-500"
                    : agent.status === "idle"
                    ? "bg-yellow-500"
                    : "bg-muted-foreground/30"
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm">{agent.name}</p>
              <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {agent.completed > 0 && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {agent.completed}
                </span>
              )}
              {agent.errors > 0 && (
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-destructive" />
                  {agent.errors}
                </span>
              )}
              {agent.lastActive ? (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(agent.lastActive), { addSuffix: true })}
                </span>
              ) : (
                <span className="text-muted-foreground/50">No activity yet</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
