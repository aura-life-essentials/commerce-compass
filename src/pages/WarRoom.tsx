import { Header } from "@/components/dashboard/Header";
import { OmegaSwarm } from "@/components/dashboard/OmegaSwarm";
import { ProfitReaper } from "@/components/dashboard/ProfitReaper";
import { AgentMonitor } from "@/components/dashboard/AgentMonitor";
import { AutonomousEngine } from "@/components/dashboard/AutonomousEngine";
import { CEODashboard } from "@/components/dashboard/CEODashboard";
import { SwarmTeams } from "@/components/dashboard/SwarmTeams";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useAgentLogs } from "@/hooks/useAgentLogs";
import { useAggregatedRevenue } from "@/hooks/useRevenueMetrics";
import { useCeoBrain } from "@/hooks/useCeoBrain";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Zap, Bot, TrendingUp, Activity, Shield, Cpu, 
  DollarSign, Target, AlertTriangle, CheckCircle2 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const WarRoom = () => {
  const { data: agentLogs, isLoading: agentsLoading } = useAgentLogs(undefined, 200);
  const { data: revenueData } = useAggregatedRevenue();
  const { decisions, metrics, agentBrains } = useCeoBrain();

  const totalRevenue = revenueData?.reduce((sum, r) => sum + r.revenue, 0) || 0;
  const totalOrders = revenueData?.reduce((sum, r) => sum + r.orders, 0) || 0;

  const activeAgents = agentBrains?.filter(a => a.is_active)?.length || 0;
  const recentDecisions = decisions?.filter(d => !d.executed)?.length || 0;

  const recentLogs = agentLogs?.slice(0, 20) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* War room ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-6 py-8">
          {/* War Room Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">War Room</h1>
                <p className="text-muted-foreground">Bot Swarm Command Center • Real-time Agent Operations</p>
              </div>
              <Badge variant="outline" className="ml-auto border-green-500 text-green-400 px-4 py-1.5 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse inline-block" />
                {activeAgents} Agents Online
              </Badge>
            </div>
          </motion.div>

          {/* Key Battle Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              title="Revenue Generated"
              value={`$${(totalRevenue / 1000).toFixed(1)}k`}
              change="+12.5%"
              changeType="positive"
              icon={DollarSign}
              subtitle="By autonomous agents"
            />
            <MetricCard
              title="Orders Processed"
              value={totalOrders.toString()}
              change="+24"
              changeType="positive"
              icon={Target}
              subtitle="Auto-fulfilled"
            />
            <MetricCard
              title="Active Bot Brains"
              value={activeAgents.toString()}
              change="Online"
              changeType="positive"
              icon={Cpu}
              subtitle="Processing 24/7"
            />
            <MetricCard
              title="Pending Decisions"
              value={recentDecisions.toString()}
              change={recentDecisions > 5 ? "Attention" : "Normal"}
              changeType={recentDecisions > 5 ? "negative" : "positive"}
              icon={AlertTriangle}
              subtitle="Awaiting execution"
            />
          </div>

          {/* Swarm Visualization Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <OmegaSwarm />
            <ProfitReaper />
          </div>

          {/* CEO Brain Decisions */}
          <div className="mb-8">
            <CEODashboard />
          </div>

          {/* Autonomous Engine */}
          <div className="mb-8">
            <AutonomousEngine />
          </div>

          {/* Real-time Agent Monitor */}
          <div className="mb-8">
            <AgentMonitor />
          </div>

          {/* Live Agent Activity Feed */}
          <div className="glass rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Live Activity Feed</h3>
              <Badge variant="outline" className="ml-auto border-primary/30 text-primary">
                Streaming
              </Badge>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {agentsLoading ? (
                Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)
              ) : recentLogs.length > 0 ? (
                recentLogs.map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      log.status === 'completed' ? 'bg-green-500' :
                      log.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                      log.status === 'error' ? 'bg-red-500' : 'bg-muted-foreground'
                    }`} />
                    <Bot className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-primary">{log.agent_name}</span>
                    <span className="text-sm text-muted-foreground flex-1">{log.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                    {log.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No agent activity yet. Deploy agents from the CEO Dashboard.</p>
              )}
            </div>
          </div>
        </main>

        <footer className="border-t border-border mt-12">
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
