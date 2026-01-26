import { Header } from "@/components/dashboard/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { StoreCard } from "@/components/dashboard/StoreCard";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { GrowthFlywheel } from "@/components/dashboard/GrowthFlywheel";
import { GovernancePanel } from "@/components/dashboard/GovernancePanel";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp,
  Layers,
  Bot
} from "lucide-react";

const stores = [
  { name: "Luxe Fashion", domain: "luxe.myshopify.com", revenue: "$24.5k", products: 156, status: "active" as const, growth: "+12%" },
  { name: "Tech Gadgets", domain: "techgadgets.store", revenue: "$18.2k", products: 89, status: "active" as const, growth: "+8%" },
  { name: "Home Essentials", domain: "homeess.co", revenue: "$31.7k", products: 234, status: "active" as const, growth: "+15%" },
  { name: "Wellness Hub", domain: "wellness.shop", revenue: "$9.8k", products: 67, status: "idle" as const, growth: "+3%" },
];

const agents = [
  { name: "Strategy Alpha", role: "Market Analysis", status: "active" as const, tasksCompleted: 47, lastActive: "2m ago" },
  { name: "Content Weaver", role: "Content Creation", status: "processing" as const, tasksCompleted: 124, lastActive: "now" },
  { name: "SEO Sentinel", role: "Search Optimization", status: "active" as const, tasksCompleted: 89, lastActive: "5m ago" },
  { name: "CX Guardian", role: "Customer Experience", status: "idle" as const, tasksCompleted: 203, lastActive: "1h ago" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Ambient glow effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-6 py-8">
          {/* Hero Section */}
          <div className="mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Good evening, <span className="text-gradient">Commander</span>
            </h2>
            <p className="text-muted-foreground">
              Your commerce empire is performing well. Here's your unified intelligence report.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              title="Total Revenue"
              value="$84.2k"
              change="+12.5%"
              changeType="positive"
              icon={DollarSign}
              subtitle="Across 4 stores"
            />
            <MetricCard
              title="Active Products"
              value="546"
              change="+24"
              changeType="positive"
              icon={ShoppingBag}
              subtitle="In catalog"
            />
            <MetricCard
              title="Customer Base"
              value="12.4k"
              change="+340"
              changeType="positive"
              icon={Users}
              subtitle="Total customers"
            />
            <MetricCard
              title="Conversion Rate"
              value="3.2%"
              change="+0.4%"
              changeType="positive"
              icon={TrendingUp}
              subtitle="Industry avg: 2.1%"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart - spans 2 columns */}
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>

            {/* Growth Flywheel */}
            <div>
              <GrowthFlywheel />
            </div>
          </div>

          {/* Stores and Agents Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Connected Stores */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Connected Stores</h3>
                <span className="ml-auto text-sm text-muted-foreground">{stores.length} active</span>
              </div>
              <div className="space-y-4">
                {stores.map((store) => (
                  <StoreCard key={store.domain} {...store} />
                ))}
              </div>
            </div>

            {/* AI Agents */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Bot className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">AI Executive Teams</h3>
                <span className="ml-auto text-sm text-emerald-400">4 active</span>
              </div>
              <div className="space-y-3">
                {agents.map((agent) => (
                  <AgentCard key={agent.name} {...agent} />
                ))}
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
                  { label: "Sync Stores", desc: "Refresh all data" },
                  { label: "Deploy Agents", desc: "Activate team" },
                  { label: "View Analytics", desc: "Deep insights" },
                  { label: "Audit Log", desc: "Review actions" },
                ].map((action) => (
                  <button
                    key={action.label}
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
              CEO Brain • Unified Commerce Intelligence • Trust-First, Growth-Driven
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
