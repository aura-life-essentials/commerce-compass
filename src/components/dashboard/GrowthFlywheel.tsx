import { Sparkles, FileText, Users, Search, Share2 } from "lucide-react";

const segments = [
  { icon: FileText, label: "Content Engine", value: "24 posts", color: "from-emerald-500 to-emerald-600" },
  { icon: Share2, label: "Social Surface", value: "1.2k reach", color: "from-cyan-500 to-cyan-600" },
  { icon: Users, label: "Community", value: "340 members", color: "from-blue-500 to-blue-600" },
  { icon: Search, label: "SEO Assets", value: "89 pages", color: "from-violet-500 to-violet-600" },
];

export const GrowthFlywheel = () => {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Organic Growth Flywheel</h3>
      </div>

      <div className="relative">
        {/* Central hub */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center animate-pulse-slow">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Flywheel segments */}
        <div className="grid grid-cols-2 gap-4">
          {segments.map((segment, index) => (
            <div
              key={segment.label}
              className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-300 group cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${segment.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <segment.icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-medium text-sm mb-1">{segment.label}</h4>
              <p className="text-lg font-semibold text-gradient">{segment.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Flywheel Momentum</span>
          <span className="font-semibold text-emerald-400">+23% this week</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 animate-pulse-slow" />
        </div>
      </div>
    </div>
  );
};
