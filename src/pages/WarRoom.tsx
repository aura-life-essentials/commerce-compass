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
import { useAggregatedRevenue } from "@/hooks/useRevenueMetrics";
import { useCeoBrain } from "@/hooks/useCeoBrain";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Bot,
  Activity,
  Shield,
  Cpu,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const WarRoom = () => {
  const { data: agentLogs, isLoading: agentsLoading } = useAgentLogs(undefined, 200);
  const { data: revenueData } = useAggregatedRevenue();
  const { decisions, agentBrains } = useCeoBrain();

  const totalRevenue = revenueData?.reduce((sum, r) => sum + r.revenue, 0) || 0;
  const totalOrders = revenueData?.reduce((sum, r) => sum + r.orders, 0) || 0;

  const activeAgents = agentBrains?.filter((a) => a.is_active)?.length || 0;
  const recentDecisions = decisions?.filter((d) => !d.executed)?.length || 0;

  const recentLogs = agentLogs?.slice(0, 20) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px]" />
        <div className="absolute left-0 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/30 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">War Room</h1>
                <p className="text-muted-foreground">Unified command center for compounding Web2 + Web3 sales systems</p>
              </div>
              <Badge variant="outline" className="ml-auto border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
                <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
                {activeAgents} Agents Online
              </Badge>
            </div>
          </motion.div>

          <div className="mb-8">
            <VoiceControlPanel />
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Revenue Generated"
              value={`$${(totalRevenue / 1000).toFixed(1)}k`}
              change="Live"
              changeType="positive"
              icon={DollarSign}
              subtitle="Across connected monetization flows"
            />
            <MetricCard
              title="Orders Processed"
              value={totalOrders.toString()}
              change="Streaming"
              changeType="positive"
              icon={Target}
              subtitle="Tracked in the command layer"
            />
            <MetricCard
              title="Active Bot Brains"
              value={activeAgents.toString()}
              change="Autonomous"
              changeType="positive"
              icon={Cpu}
              subtitle="Always optimizing"
            />
            <MetricCard
              title="Pending Decisions"
              value={recentDecisions.toString()}
              change={recentDecisions > 5 ? "High load" : "Stable"}
              changeType={recentDecisions > 5 ? "negative" : "positive"}
              icon={AlertTriangle}
              subtitle="Queued strategic actions"
            />
          </div>

          <div className="mb-8">
            <RevenueControlPlane />
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
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

          <div className="glass mb-8 rounded-xl p-6">
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
                    className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
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
