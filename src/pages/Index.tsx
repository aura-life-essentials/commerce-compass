import { Header } from "@/components/dashboard/Header";
import { RealMetrics } from "@/components/dashboard/RealMetrics";
import { RealTimeFeed } from "@/components/dashboard/RealTimeFeed";
import { StoreCard } from "@/components/dashboard/StoreCard";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { GrowthFlywheel } from "@/components/dashboard/GrowthFlywheel";
import { GovernancePanel } from "@/components/dashboard/GovernancePanel";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { ProfitReaper } from "@/components/dashboard/ProfitReaper";
import { OmegaSwarm } from "@/components/dashboard/OmegaSwarm";
import { AutonomousSalesPanel } from "@/components/dashboard/AutonomousSalesPanel";
import { AutonomousEngine } from "@/components/dashboard/AutonomousEngine";
import { CEODashboard } from "@/components/dashboard/CEODashboard";
import { CRMDashboard } from "@/components/dashboard/CRMDashboard";
import { AgentMonitor } from "@/components/dashboard/AgentMonitor";
import { MarketingEngine } from "@/components/dashboard/MarketingEngine";
import { Web3Dashboard } from "@/components/dashboard/Web3Dashboard";
import { MetaverseHub } from "@/components/metaverse/MetaverseHub";
import { SalesRaceMonitor } from "@/components/dashboard/SalesRaceMonitor";
import { useStores } from "@/hooks/useStores";
import { useAgentLogs } from "@/hooks/useAgentLogs";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, Bot } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const Index = () => {
  const { data: stores, isLoading: storesLoading } = useStores();
  const { data: agentLogs, isLoading: agentsLoading } = useAgentLogs(undefined, 100);

  const hasData = stores && stores.length > 0;

  const agentStats = agentLogs?.reduce((acc, log) => {
    const key = log.agent_name;
    if (!acc[key]) {
      acc[key] = {
        name: log.agent_name,
        role: log.agent_role,
        tasksCompleted: 0,
        lastActive: log.created_at,
        status: "idle" as "active" | "idle" | "processing",
      };
    }
    if (log.status === "completed") acc[key].tasksCompleted++;
    if (log.status === "processing") acc[key].status = "processing";
    if (new Date(log.created_at) > new Date(acc[key].lastActive)) {
      acc[key].lastActive = log.created_at;
    }
    return acc;
  }, {} as Record<string, { name: string; role: string; tasksCompleted: number; lastActive: string; status: "active" | "idle" | "processing" }>) || {};

  const agents = Object.values(agentStats).length > 0
    ? Object.values(agentStats).map((a) => ({
        ...a,
        status: (Date.now() - new Date(a.lastActive).getTime() < 300000 ? "active" : "idle") as "active" | "idle" | "processing",
        lastActive: formatDistanceToNow(new Date(a.lastActive), { addSuffix: false }),
      }))
    : [];

  const seedDemoData = async () => {
    toast.info("Use the CEO Brain to generate real AI decisions, or trigger agent commands from the Autonomous Engine.");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-6 py-8">
          <HeroBanner onSeedData={seedDemoData} hasData={hasData} />

          <div className="mb-8">
            <SalesRaceMonitor />
          </div>

          <div className="mb-8">
            <RealMetrics />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ProfitReaper />
            <OmegaSwarm />
          </div>

          <div className="mb-8">
            <RealTimeFeed />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            <div>
              <GrowthFlywheel />
            </div>
          </div>

          <div className="mb-8">
            <CEODashboard />
          </div>

          <div className="mb-8">
            <AutonomousEngine />
          </div>

          <div className="mb-8">
            <AutonomousSalesPanel />
          </div>

          <div className="mb-8">
            <CRMDashboard />
          </div>

          <div className="mb-8">
            <AgentMonitor />
          </div>

          <div className="mb-8">
            <MarketingEngine />
          </div>

          <div className="mb-8">
            <Web3Dashboard />
          </div>

          <div className="mb-8">
            <MetaverseHub />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Connected Stores</h3>
                <span className="ml-auto text-sm text-muted-foreground">
                  {stores?.length || 0} active
                </span>
              </div>
              <div className="space-y-4">
                {storesLoading ? (
                  Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
                ) : stores?.length ? (
                  stores.map((store) => (
                    <StoreCard
                      key={store.id}
                      id={store.id}
                      name={store.name}
                      domain={store.domain}
                      status={store.status as "connected" | "disconnected" | "syncing"}
                      lastSynced={store.last_synced_at}
                    />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No stores connected yet</p>
                )}
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Bot className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Agent Activity Log</h3>
                <span className="ml-auto text-sm text-primary">
                  {agents.filter((a) => a.status === "active").length} recently active
                </span>
              </div>
              <div className="space-y-3">
                {agentsLoading ? (
                  Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)
                ) : agents.length ? (
                  agents.map((agent) => <AgentCard key={agent.name} {...agent} />)
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No agent activity yet — trigger the CEO Brain to generate real logs
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GovernancePanel />
            <div className="lg:col-span-2 glass rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Command Center</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Sync Aura Products", desc: "Import catalog", action: () => toast.info("Syncing Aura Dropshipping...") },
                  { label: "Deploy Reaper", desc: "Activate profit engine", action: () => toast.info("Profit Reaper deploying...") },
                  { label: "Omega Swarm", desc: "Scale agents", action: () => toast.info("Omega Swarm scaling...") },
                  { label: "Audit Margins", desc: "Verify monetization", action: () => toast.info("Auditing monetization surfaces...") },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={action.action}
                    className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary border border-transparent hover:border-primary/20 transition-all text-left group"
                  >
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-border mt-12">
          <div className="container mx-auto px-6 py-6">
            <p className="text-center text-sm text-muted-foreground">
              CEO Brain • Global sales race monitoring • Live backend telemetry
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
