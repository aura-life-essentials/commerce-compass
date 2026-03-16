import { Header } from "@/components/dashboard/Header";
import { SwarmTeams } from "@/components/dashboard/SwarmTeams";
import { AgentMonitor } from "@/components/dashboard/AgentMonitor";
import { OmegaSwarm } from "@/components/dashboard/OmegaSwarm";
import { SalesRaceMonitor } from "@/components/dashboard/SalesRaceMonitor";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";

const BotSwarm = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Bot Swarm</h1>
                <p className="text-muted-foreground">200-Agent Autonomous Fleet • Full Swarm Overview</p>
              </div>
              <Badge variant="outline" className="ml-auto border-primary/40 text-primary px-4 py-1.5 text-sm">
                <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse inline-block" />
                Swarm Active
              </Badge>
            </div>
          </motion.div>

          <div className="mb-8">
            <SalesRaceMonitor />
          </div>

          <div className="mb-8">
            <OmegaSwarm />
          </div>

          <div className="mb-8">
            <SwarmTeams />
          </div>

          <div className="mb-8">
            <AgentMonitor />
          </div>
        </main>

        <footer className="border-t border-border mt-12">
          <div className="container mx-auto px-6 py-6">
            <p className="text-center text-sm text-muted-foreground">
              Bot Swarm • 200-Agent Fleet Command • Live sell-race telemetry
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BotSwarm;
