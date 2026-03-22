import { Sparkles, FileText, Users, Search, Share2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export const GrowthFlywheel = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["growth-flywheel-real"],
    queryFn: async () => {
      const [contentRes, campaignsRes, leadsRes] = await Promise.all([
        supabase.from("content_pipeline").select("id", { count: "exact", head: true }),
        supabase.from("organic_campaigns").select("total_reach, total_engagement, posts_published"),
        supabase.from("lead_contacts").select("id", { count: "exact", head: true }),
      ]);

      const totalReach = campaignsRes.data?.reduce((sum, c) => sum + (c.total_reach || 0), 0) || 0;
      const totalPosts = campaignsRes.data?.reduce((sum, c) => sum + (c.posts_published || 0), 0) || 0;

      return {
        contentItems: contentRes.count || 0,
        totalReach,
        totalPosts,
        leads: leadsRes.count || 0,
      };
    },
    refetchInterval: 30000,
  });

  const segments = [
    { icon: FileText, label: "Content Pipeline", value: stats?.contentItems?.toString() || "0", color: "from-emerald-500 to-emerald-600" },
    { icon: Share2, label: "Total Reach", value: stats?.totalReach ? `${(stats.totalReach / 1000).toFixed(1)}k` : "0", color: "from-cyan-500 to-cyan-600" },
    { icon: Users, label: "Leads", value: stats?.leads?.toString() || "0", color: "from-blue-500 to-blue-600" },
    { icon: Search, label: "Posts Published", value: stats?.totalPosts?.toString() || "0", color: "from-violet-500 to-violet-600" },
  ];

  const hasData = Object.values(stats || {}).some(v => typeof v === 'number' && v > 0);

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Organic Growth Flywheel</h3>
        <Badge variant="outline" className="ml-auto text-xs">
          {hasData ? "LIVE DATA" : "NO DATA YET"}
        </Badge>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-300 group cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${segment.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <segment.icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-medium text-sm mb-1">{segment.label}</h4>
              <p className="text-lg font-semibold text-gradient">
                {isLoading ? "..." : segment.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {!hasData && (
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-400">
            No organic growth data yet. Metrics will populate when campaigns run and content is published.
          </p>
        </div>
      )}
    </div>
  );
};
