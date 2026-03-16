import { Header } from "@/components/dashboard/Header";
import { OmegaSwarm } from "@/components/dashboard/OmegaSwarm";
import { ProfitReaper } from "@/components/dashboard/ProfitReaper";
import { AgentMonitor } from "@/components/dashboard/AgentMonitor";
import { AutonomousEngine } from "@/components/dashboard/AutonomousEngine";
import { CEODashboard } from "@/components/dashboard/CEODashboard";
import { SwarmTeams } from "@/components/dashboard/SwarmTeams";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { VoiceControlPanel } from "@/components/dashboard/VoiceControlPanel";
import { RevenueControlPlane } from "@/components/dashboard/RevenueControlPlane";
import { useAgentLogs } from "@/hooks/useAgentLogs";
import { useSalesControlPlane } from "@/hooks/useSalesControlPlane";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Cpu,
  DollarSign,
  Shield,
  Target,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const WarRoom = () => {
  const { data: agentLogs, isLoading: agentsLoading } = useAgentLogs(undefined, 200);
  const { data: summary } = useSalesControlPlane();

  const totalRevenue = summary?.totals.revenue || 0;
  const totalOrders = summary?.totals.orders || 0;
  const activeAgents = summary?.totals.activeAgents || 0;
  const recentDecisions = summary?.totals.pendingDecisions || 0;
  const recentLogs = agentLogs?.slice(0, 20) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="absolute right-0 top-0 h-[520px] w-[520px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[460px] w-[460px] rounded-full bg-accent/25 blur-[140px]" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="rounded-[1.75rem] border border-border/60 bg-card/40 p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
                    <Shield className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-3 border-primary/30 bg-primary/10 text-primary">
                      Unified monetization core
                    </Badge>
                    <h1 className="text-3xl font-bold tracking-tight">War Room</h1>
                    <p className="mt-2 max-w-3xl text-muted-foreground">
                      Super-polished command center for live backend orchestration, compounding sales systems, and autonomous revenue execution.
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
                  <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
                  {activeAgents} Agents Online
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  title="Revenue Generated"
                  value={`$${(totalRevenue / 1000).toFixed(1)}k`}
                  change="Backend live"
                  changeType="positive"
                  icon={DollarSign}
                  subtitle="Unified commerce telemetry"
                />
                <MetricCard
                  title="Orders Processed"
                  value={totalOrders.toString()}
                  change="Streaming"
                  changeType="positive"
                  icon={Target}
                  subtitle="Cross-system order flow"
                />
                <MetricCard
                  title="Active Bot Brains"
                  value={activeAgents.toString()}
                  change="Autonomous"
                  changeType="positive"
                  icon={Cpu}
                  subtitle="Live execution agents"
                />
                <MetricCard
                  title="Pending Decisions"
                  value={recentDecisions.toString()}
                  change={recentDecisions > 5 ? "High load" : "Stable"}
                  changeType={recentDecisions > 5 ? "negative" : "positive"}
                  icon={AlertTriangle}
                  subtitle="Strategic queue depth"
                />
              </div>
            </div>
          </motion.div>

          <div className="mb-8">
            <VoiceControlPanel />
          </div>

          <div className="mb-8">
            <RevenueControlPlane />
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <OmegaSwarm />
            <ProfitReaper />
          </div>

          <div className="mb-8">
            <SwarmTeams />
          </div>

          <div className="mb-8">
            <CEODashboard />
          </div>

          <div className="mb-8">
            <AutonomousEngine />
          </div>

          <div className="mb-8">
            <AgentMonitor />
          </div>

          <div className="glass mb-8 rounded-[1.5rem] border-border/60 p-6 shadow-[var(--shadow-lg)]">
            <div className="mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Live Activity Feed</h3>
              <Badge variant="outline" className="ml-auto border-primary/30 text-primary">
                Streaming
              </Badge>
            </div>
            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {agentsLoading ? (
                Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)
              ) : recentLogs.length > 0 ? (
                recentLogs.map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-secondary/20 p-3 transition-colors hover:bg-secondary/35"
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        log.status === "completed"
                          ? "bg-primary"
                          : log.status === "processing"
                            ? "bg-warning animate-pulse"
                            : log.status === "error"
                              ? "bg-destructive"
                              : "bg-muted-foreground"
                      }`}
                    />
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-primary">{log.agent_name}</span>
                    <span className="flex-1 text-sm text-muted-foreground">{log.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                    {log.status === "completed" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </motion.div>
                ))
              ) : (
                <p className="py-8 text-center text-muted-foreground">No agent activity yet. Deploy agents from the CEO Dashboard.</p>
              )}
            </div>
          </div>
        </main>

        <footer className="mt-12 border-t border-border">
          <div className="container mx-auto px-6 py-6">
            <p className="text-center text-sm text-muted-foreground">
              War Room • Bot Swarm Operations • Autonomous Commerce Engine
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default WarRoom;
