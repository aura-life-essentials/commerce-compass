import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  useOrganicCampaigns,
  useCampaignStats,
  useCreateOrganicCampaign,
} from "@/hooks/useOrganicCampaigns";
import {
  Globe,
  Rocket,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Zap,
  Play,
  BarChart3,
  Share2,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const platformIcons: Record<string, React.ReactNode> = {
  tiktok: <span className="text-lg">📱</span>,
  instagram: <span className="text-lg">📷</span>,
  youtube: <span className="text-lg">🎬</span>,
  twitter: <span className="text-lg">🐦</span>,
  linkedin: <span className="text-lg">💼</span>,
  facebook: <span className="text-lg">👥</span>,
};

const marketFlags: Record<string, string> = {
  US: "🇺🇸",
  UK: "🇬🇧",
  CA: "🇨🇦",
  AU: "🇦🇺",
  DE: "🇩🇪",
  FR: "🇫🇷",
  JP: "🇯🇵",
  BR: "🇧🇷",
  IN: "🇮🇳",
  MX: "🇲🇽",
  ES: "🇪🇸",
  IT: "🇮🇹",
  NL: "🇳🇱",
  SE: "🇸🇪",
  global: "🌍",
};

export function MarketingEngine() {
  const [isLaunching, setIsLaunching] = useState(false);
  const { data: campaigns } = useOrganicCampaigns();
  const { data: stats } = useCampaignStats();
  const createCampaign = useCreateOrganicCampaign();

  const launchGlobalBlast = async () => {
    setIsLaunching(true);
    try {
      // Call the autonomous marketing edge function
      const { data, error } = await supabase.functions.invoke("content-generator", {
        body: {
          action: "global_blast",
          markets: ["US", "UK", "CA", "AU", "DE", "FR", "JP", "BR", "IN"],
          platforms: ["tiktok", "instagram", "youtube", "twitter", "linkedin"],
          allProducts: true,
        },
      });

      if (error) throw error;

      // Create campaign record
      await createCampaign.mutateAsync({
        campaign_name: `Global Blast - ${new Date().toLocaleDateString()}`,
        campaign_type: "organic_blast",
        target_markets: ["US", "UK", "CA", "AU", "DE", "FR", "JP", "BR", "IN"],
        target_platforms: ["tiktok", "instagram", "youtube", "twitter", "linkedin"],
        status: "active",
        assigned_agent: "Omega Swarm",
      });

      toast.success("🚀 Global marketing blast launched! Agents deploying worldwide...");
    } catch (error) {
      console.error("Failed to launch blast:", error);
      toast.error("Failed to launch campaign");
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="w-6 h-6 text-orange-500" />
            Organic Marketing Engine
          </h2>
          <p className="text-muted-foreground">
            Autonomous worldwide content distribution and engagement
          </p>
        </div>
        <Button
          onClick={launchGlobalBlast}
          disabled={isLaunching}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          {isLaunching ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-pulse" />
              Launching...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              Launch Global Blast
            </>
          )}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <Target className="w-4 h-4" />
              <span className="text-sm">Campaigns</span>
            </div>
            <p className="text-2xl font-bold">{stats?.totalCampaigns || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Total Reach</span>
            </div>
            <p className="text-2xl font-bold">
              {((stats?.totalReach || 0) / 1000).toFixed(1)}K
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-pink-400 mb-2">
              <Heart className="w-4 h-4" />
              <span className="text-sm">Engagement</span>
            </div>
            <p className="text-2xl font-bold">
              {((stats?.totalEngagement || 0) / 1000).toFixed(1)}K
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Posts</span>
            </div>
            <p className="text-2xl font-bold">{stats?.postsPublished || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Leads</span>
            </div>
            <p className="text-2xl font-bold">{stats?.totalLeads || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Revenue</span>
            </div>
            <p className="text-2xl font-bold">
              ${(stats?.totalRevenue || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Global Market Coverage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            Global Market Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(marketFlags).map(([code, flag]) => (
              <div
                key={code}
                className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg"
              >
                <span className="text-xl">{flag}</span>
                <span className="text-sm font-medium">{code}</span>
                <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400">
                  Active
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-500" />
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns?.filter((c) => c.status === "active").slice(0, 5).map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-4 bg-muted/50 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{campaign.campaign_name}</h4>
                    <Badge className="bg-green-500/20 text-green-400">
                      {campaign.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {campaign.target_platforms?.map((platform) => (
                      <span key={platform}>
                        {platformIcons[platform] || "📱"}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-blue-400">
                      <Eye className="w-3 h-3" />
                      {campaign.total_reach.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-pink-400">
                      <Heart className="w-3 h-3" />
                      {campaign.total_engagement.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-green-400">
                      <Users className="w-3 h-3" />
                      {campaign.leads_generated}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>
                        {campaign.posts_published}/{campaign.posts_scheduled} posts
                      </span>
                    </div>
                    <Progress
                      value={
                        campaign.posts_scheduled > 0
                          ? (campaign.posts_published / campaign.posts_scheduled) * 100
                          : 0
                      }
                    />
                  </div>
                </div>
              ))}

              {(!campaigns || campaigns.filter((c) => c.status === "active").length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Rocket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No active campaigns</p>
                  <p className="text-sm">Launch a global blast to start</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Platform Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "TikTok", reach: 45000, engagement: 8500, color: "from-pink-500 to-purple-500" },
                { name: "Instagram", reach: 32000, engagement: 5200, color: "from-orange-500 to-pink-500" },
                { name: "YouTube", reach: 28000, engagement: 3800, color: "from-red-500 to-orange-500" },
                { name: "LinkedIn", reach: 15000, engagement: 2100, color: "from-blue-500 to-cyan-500" },
                { name: "Twitter", reach: 12000, engagement: 1800, color: "from-blue-400 to-blue-600" },
              ].map((platform) => (
                <div key={platform.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{platform.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {(platform.reach / 1000).toFixed(1)}K reach
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${platform.color}`}
                      style={{ width: `${(platform.reach / 50000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
