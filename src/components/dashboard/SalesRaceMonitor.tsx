import { Trophy, Zap, DollarSign, Bot, Activity, Target, Crown, TimerReset } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useLaunchSalesRace, useLatestSalesRace, useRealtimeSalesRaceEvents, useSalesRaceAgents } from "@/hooks/useSalesRace";
import { toast } from "sonner";

interface SalesRaceMonitorProps {
  compact?: boolean;
  commandText?: string;
}

export const SalesRaceMonitor = ({ compact = false, commandText }: SalesRaceMonitorProps) => {
  const { data: race, isLoading: raceLoading } = useLatestSalesRace();
  const { data: agents, isLoading: agentsLoading } = useSalesRaceAgents(race?.id, compact ? 12 : 100);
  const events = useRealtimeSalesRaceEvents(race?.id);
  const launchRace = useLaunchSalesRace();

  const handleLaunch = () => {
    const command =
      commandText ||
      "Start a 100 agent sales race. Make them compete to sell $1000 the fastest across all products, apps, stores, and monetization surfaces with true monitoring.";

    launchRace.mutate(command, {
      onSuccess: () => toast.success("100-agent sales race launched"),
      onError: (error: any) => toast.error(error.message || "Failed to launch sales race"),
    });
  };

  const topThree = agents?.slice(0, 3) || [];
  const displayedAgents = compact ? agents?.slice(0, 8) || [] : agents || [];
  const raceProgress = race ? Math.min(100, (Number(race.winning_revenue || 0) / Number(race.target_amount || 1000)) * 100) : 0;

  return (
    <Card className="glass overflow-hidden border-border/60">
      <CardHeader className="border-b border-border/50 bg-card/40">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Trophy className="h-5 w-5 text-primary" />
              Global Sell Race Monitor
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              100-agent sprint to the first ${race?.target_amount || 1000} with live monetization telemetry.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {race && (
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                {race.status.toUpperCase()}
              </Badge>
            )}
            <Button onClick={handleLaunch} disabled={launchRace.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Zap className="mr-2 h-4 w-4" />
              {launchRace.isPending ? "Launching..." : "Launch 100-Agent Race"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {raceLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : race ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" /> Total Revenue
                </p>
                <p className="text-3xl font-bold">${Number(race.total_revenue || 0).toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <Target className="h-3.5 w-3.5" /> Race Goal
                </p>
                <p className="text-3xl font-bold">${Number(race.target_amount || 0).toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <Bot className="h-3.5 w-3.5" /> Active Lanes
                </p>
                <p className="text-3xl font-bold">{agents?.length || 0}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-secondary/40 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" /> Orders Attributed
                </p>
                <p className="text-3xl font-bold">{race.total_orders || 0}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Leader progress</p>
                  <p className="text-xs text-muted-foreground">
                    {race.winning_agent_name || "No leader yet"}
                    {race.started_at ? ` • started ${formatDistanceToNow(new Date(race.started_at), { addSuffix: true })}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">${Number(race.winning_revenue || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">fastest current seller</p>
                </div>
              </div>
              <Progress value={raceProgress} className="h-3" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Leaderboard</h4>
                  <Badge variant="secondary">{displayedAgents.length} visible</Badge>
                </div>
                {agentsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: compact ? 4 : 8 }).map((_, index) => (
                      <Skeleton key={index} className="h-16 rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <ScrollArea className={cn("pr-3", compact ? "h-[360px]" : "h-[520px]")}>
                    <div className="space-y-3">
                      {displayedAgents.map((agent, index) => {
                        const progress = Math.min(100, (Number(agent.revenue_generated || 0) / Number(agent.target_amount || 1000)) * 100);
                        return (
                          <div key={agent.id} className="rounded-xl border border-border/60 bg-card/50 p-4">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold",
                                  index === 0 ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-secondary/60 text-foreground"
                                )}>
                                  {index === 0 ? <Crown className="h-4 w-4" /> : `#${agent.rank_position || index + 1}`}
                                </div>
                                <div>
                                  <p className="font-medium">{agent.agent_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {agent.agent_role || agent.agent_type || "seller"} • {agent.status}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold">${Number(agent.revenue_generated || 0).toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">{agent.orders_count || 0} orders</p>
                              </div>
                            </div>
                            <Progress value={progress} className="mb-3 h-2.5" />
                            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                              <div>Conv. {Number(agent.conversion_rate || 0).toFixed(1)}%</div>
                              <div>AOV ${Number(agent.avg_order_value || 0).toFixed(0)}</div>
                              <div>{agent.campaigns_launched || 0} campaigns</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border/60 bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <TimerReset className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Top 3</h4>
                  </div>
                  <div className="space-y-3">
                    {topThree.map((agent, index) => (
                      <div key={agent.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
                        <div>
                          <p className="font-medium">#{index + 1} {agent.agent_name}</p>
                          <p className="text-xs text-muted-foreground">${Number(agent.revenue_generated || 0).toLocaleString()} revenue</p>
                        </div>
                        {index === 0 && <Crown className="h-4 w-4 text-primary" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Live events</h4>
                  </div>
                  <ScrollArea className={cn(compact ? "h-[220px]" : "h-[320px]")}>
                    <div className="space-y-2 pr-3">
                      {events.map((event) => (
                        <div key={event.id} className="rounded-lg border border-border/50 bg-secondary/30 p-3">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{event.event_label}</p>
                            <Badge variant="outline" className="text-[10px] uppercase">{event.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</p>
                          {(event.revenue_delta > 0 || event.order_delta > 0) && (
                            <p className="mt-1 text-xs text-primary">
                              +${Number(event.revenue_delta || 0).toLocaleString()} • +{event.order_delta || 0} orders
                            </p>
                          )}
                        </div>
                      ))}
                      {!events.length && <p className="text-sm text-muted-foreground">No live events yet.</p>}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Trophy className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-semibold">No active sales race yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Launch the 100-agent competition and this panel will stream real actions and results.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
