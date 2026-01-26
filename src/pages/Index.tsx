import { Header } from "@/components/dashboard/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
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
// CEODashboard temporarily disabled for debugging
import { useStores, useCreateStore } from "@/hooks/useStores";
import { useAgentLogs, useCreateAgentLog } from "@/hooks/useAgentLogs";
import { useAggregatedRevenue, useCreateRevenueMetric } from "@/hooks/useRevenueMetrics";
import { useCreateGovernanceEvent } from "@/hooks/useGovernance";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp,
  Layers,
  Bot,
  RefreshCw,
  Database,
  Zap,
  Target
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

// Default demo data for seeding
const demoStores = [
  { name: "Luxe Fashion", domain: "luxe.myshopify.com", currency: "USD", locale: "en-US", status: "connected" as const },
  { name: "Tech Gadgets", domain: "techgadgets.store", currency: "USD", locale: "en-US", status: "connected" as const },
  { name: "Home Essentials", domain: "homeess.co", currency: "USD", locale: "en-US", status: "connected" as const },
  { name: "Wellness Hub", domain: "wellness.shop", currency: "USD", locale: "en-US", status: "connected" as const },
];

const demoAgents = [
  { agent_name: "Strategy Alpha", agent_role: "Market Analysis", action: "Analyzed competitor pricing" },
  { agent_name: "Content Weaver", agent_role: "Content Creation", action: "Generated product descriptions" },
  { agent_name: "SEO Sentinel", agent_role: "Search Optimization", action: "Optimized meta tags" },
  { agent_name: "CX Guardian", agent_role: "Customer Experience", action: "Reviewed support tickets" },
  { agent_name: "Profit Reaper", agent_role: "Profit Optimization", action: "Applied 67% margins to products" },
  { agent_name: "Omega Syncer", agent_role: "Store Synchronization", action: "Synced CJ Dropshipping catalog" },
];

const Index = () => {
  const { data: stores, isLoading: storesLoading } = useStores();
  const { data: revenueData, isLoading: revenueLoading } = useAggregatedRevenue();
  const { data: agentLogs, isLoading: agentsLoading } = useAgentLogs(undefined, 100);
  
  const createStore = useCreateStore();
  const createAgentLog = useCreateAgentLog();
  const createRevenueMetric = useCreateRevenueMetric();
  const createGovernanceEvent = useCreateGovernanceEvent();

  const hasData = stores && stores.length > 0;

  // Aggregate agent stats from logs
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
    ? Object.values(agentStats).map(a => ({
        ...a,
        status: (Date.now() - new Date(a.lastActive).getTime() < 300000 ? "active" : "idle") as "active" | "idle" | "processing",
        lastActive: formatDistanceToNow(new Date(a.lastActive), { addSuffix: false }),
      }))
    : [];

  // Calculate metrics from real data
  const totalRevenue = revenueData?.reduce((sum, r) => sum + r.revenue, 0) || 0;
  const totalOrders = revenueData?.reduce((sum, r) => sum + r.orders, 0) || 0;
  const avgProfit = totalRevenue * 0.67; // 67% profit margin

  const seedDemoData = async () => {
    try {
      toast.loading("Initializing autonomous sales system...");
      
      // Create demo stores
      const createdStores = [];
      for (const store of demoStores) {
        const result = await createStore.mutateAsync(store);
        createdStores.push(result);
      }
      
      // Create agent logs for each store
      for (const store of createdStores) {
        for (const agent of demoAgents) {
          await createAgentLog.mutateAsync({
            store_id: store.id,
            ...agent,
            status: "completed",
            duration_ms: Math.floor(Math.random() * 5000) + 1000,
          });
        }
        
        // Create revenue metrics for last 30 days
        for (let i = 30; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dailyRevenue = Math.floor(Math.random() * 5000) + 1000;
          await createRevenueMetric.mutateAsync({
            store_id: store.id,
            date: date.toISOString().split("T")[0],
            revenue: dailyRevenue,
            orders_count: Math.floor(Math.random() * 50) + 10,
            organic_traffic: Math.floor(Math.random() * 1000) + 200,
            conversion_rate: Math.random() * 0.05 + 0.02,
          });
        }
      }
      
      // Create governance events
      await createGovernanceEvent.mutateAsync({
        event_type: "compliance_check",
        category: "compliance",
        severity: "info",
        description: "GDPR compliance verified for all stores",
        resolved: true,
      });
      
      await createGovernanceEvent.mutateAsync({
        event_type: "profit_margin_audit",
        category: "finance",
        severity: "info",
        description: "67% profit margin verified across all products",
        resolved: true,
      });
      
      await createGovernanceEvent.mutateAsync({
        event_type: "security_audit",
        category: "security",
        severity: "info",
        description: "Store isolation verified - no cross-contamination",
        resolved: true,
      });
      
      toast.dismiss();
      toast.success("Autonomous sales system initialized!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to initialize system");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient glow effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-6 py-8">
          {/* Hero Banner */}
          <HeroBanner onSeedData={seedDemoData} hasData={hasData} />

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {storesLoading ? (
              Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))
            ) : (
              <>
                <MetricCard
                  title="Total Revenue"
                  value={`$${(totalRevenue / 1000).toFixed(1)}k`}
                  change="+12.5%"
                  changeType="positive"
                  icon={DollarSign}
                  subtitle={`Across ${stores?.length || 0} stores`}
                />
                <MetricCard
                  title="Estimated Profit"
                  value={`$${(avgProfit / 1000).toFixed(1)}k`}
                  change="67% margin"
                  changeType="positive"
                  icon={Target}
                  subtitle="Auto-calculated"
                />
                <MetricCard
                  title="Total Orders"
                  value={totalOrders.toString()}
                  change="+24"
                  changeType="positive"
                  icon={ShoppingBag}
                  subtitle="This period"
                />
                <MetricCard
                  title="Active Agents"
                  value={agents.filter(a => a.status === "active").length.toString()}
                  change="Online"
                  changeType="positive"
                  icon={Zap}
                  subtitle="Processing 24/7"
                />
              </>
            )}
          </div>

          {/* Profit Reaper & Omega Swarm Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ProfitReaper />
            <OmegaSwarm />
          </div>

          {/* Revenue Chart & Autonomous Sales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            <div>
              <GrowthFlywheel />
            </div>
          </div>

          {/* Autonomous AI Engine */}
          <div className="mb-8">
            <AutonomousEngine />
          </div>

          {/* Autonomous Sales Panel */}
          <div className="mb-8">
            <AutonomousSalesPanel />
          </div>

          {/* Stores and Agents Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Connected Stores */}
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
                  Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))
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
                  <p className="text-center text-muted-foreground py-8">
                    No stores connected yet
                  </p>
                )}
              </div>
            </div>

            {/* AI Agents */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Bot className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">AI Executive Teams</h3>
                <span className="ml-auto text-sm text-primary">
                  {agents.filter(a => a.status === "active").length} active
                </span>
              </div>
              <div className="space-y-3">
                {agentsLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))
                ) : agents.length ? (
                  agents.map((agent) => (
                    <AgentCard key={agent.name} {...agent} />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No agent activity yet
                  </p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  All agents operate within ethical constraints • No deceptive practices
                </p>
              </div>
            </div>
          </div>

          {/* Governance Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GovernancePanel />
            
            {/* Quick Actions */}
            <div className="lg:col-span-2 glass rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Command Center</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Sync CJ Products", desc: "Import catalog", action: () => toast.info("Syncing CJ Dropshipping...") },
                  { label: "Deploy Reaper", desc: "Activate profit engine", action: () => toast.info("Profit Reaper deploying...") },
                  { label: "Omega Swarm", desc: "Scale agents", action: () => toast.info("Omega Swarm scaling...") },
                  { label: "Audit Margins", desc: "Verify 67% profit", action: () => toast.info("Auditing profit margins...") },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={action.action}
                    className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary border border-transparent hover:border-primary/20 transition-all text-left group"
                  >
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-12">
          <div className="container mx-auto px-6 py-6">
            <p className="text-center text-sm text-muted-foreground">
              CEO Brain • Profit Reaper + Omega Swarm • Autonomous Commerce Engine • 67% Profit Margins
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
