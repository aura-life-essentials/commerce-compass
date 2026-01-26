import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Shield,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-command-center.jpg";

interface HeroBannerProps {
  onSeedData?: () => void;
  hasData?: boolean;
}

export const HeroBanner = ({ onSeedData, hasData }: HeroBannerProps) => {
  return (
    <div className="relative rounded-2xl overflow-hidden mb-8">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Command Center" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 md:p-12">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Autonomous Commerce Engine</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-gradient">CEO Brain</span>
            <br />
            <span className="text-foreground">Revenue Engine</span>
          </h1>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-6 max-w-lg">
            Unified commerce orchestration powered by AI agents. 
            Profit Reaper + Omega Swarm working 24/7 to maximize your revenue.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xl font-bold">67%</p>
                <p className="text-xs text-muted-foreground">Profit Margin</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xl font-bold">6+</p>
                <p className="text-xs text-muted-foreground">AI Agents</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold">100%</p>
                <p className="text-xs text-muted-foreground">Ethical</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3">
            {!hasData && onSeedData && (
              <Button onClick={onSeedData} size="lg" className="gap-2">
                <Zap className="w-4 h-4" />
                Initialize System
              </Button>
            )}
            <Button variant="outline" size="lg" className="gap-2">
              View Analytics
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">System Online</span>
        </div>
      </div>
    </div>
  );
};
