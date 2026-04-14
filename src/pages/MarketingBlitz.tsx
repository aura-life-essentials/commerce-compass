import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useOrganicCampaigns, useCampaignStats } from "@/hooks/useOrganicCampaigns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Rocket, Zap, Copy, Check, Clock, Target, TrendingUp,
  ArrowLeft, Loader2, Sparkles, Eye, MessageSquare,
  Instagram, Twitter, Facebook, Video, RefreshCw, BarChart3
} from "lucide-react";

const platformIcons: Record<string, React.ReactNode> = {
  tiktok: <Video className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  twitter: <Twitter className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
};

const platformColors: Record<string, string> = {
  tiktok: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  instagram: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  twitter: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  facebook: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const MarketingBlitz = () => {
  const navigate = useNavigate();
  const shopifyProducts: any[] = [];
  const { data: campaigns, isLoading: campaignsLoading, refetch: refetchCampaigns } = useOrganicCampaigns();
  const { data: stats } = useCampaignStats();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatingStatus, setGeneratingStatus] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleBlitzAll = async () => {
    if (!shopifyProducts?.length) {
      toast.error("No products found");
      return;
    }

    setIsGenerating(true);
    setProgress(10);
    setGeneratingStatus("Preparing local-first AI workflows...");

    const products = shopifyProducts.slice(0, 5).map((p) => ({
      title: p.node.title,
      description: p.node.description,
      price: p.node.priceRange.minVariantPrice.amount,
      handle: p.node.handle,
    }));

    try {
      setProgress(35);
      setGeneratingStatus("Generating cross-platform campaigns...");

      const { data, error } = await supabase.functions.invoke("marketing-blitz", {
        body: { action: "blitz_all", products, mode: "local" },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setProgress(100);
      setGeneratingStatus("Campaigns ready");
      refetchCampaigns();

      const total = data?.total || 0;
      toast.success(`Generated ${total} local AI content pieces`);
    } catch (e) {
      console.error(e);
      toast.error("Blitz generation failed");
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGeneratingStatus("");
        setProgress(0);
      }, 300);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const readyCampaigns = campaigns?.filter((c) => c.status === "ready") || [];
  const contentPieces = readyCampaigns.flatMap((c) =>
    (c.generated_content || []).map((gc: any) => ({
      ...gc,
      campaignName: c.campaign_name,
      campaignId: c.id,
      strategy: c.content_strategy,
    }))
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Marketing Blitz 🚀
              </h1>
              <p className="text-muted-foreground mt-1">
                Local-first AI engine generating real campaign assets for every product × platform
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleBlitzAll}
              disabled={isGenerating || productsLoading}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Rocket className="w-5 h-5" />
              )}
              {isGenerating ? "Generating..." : "Launch Blitz"}
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.totalCampaigns || 0}</p>
                  <p className="text-xs text-muted-foreground">Content Pieces</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Eye className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.totalReach?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground">Est. Reach</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Target className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.totalLeads || 0}</p>
                  <p className="text-xs text-muted-foreground">Leads Generated</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">${stats?.totalRevenue?.toFixed(0) || 0}</p>
                  <p className="text-xs text-muted-foreground">Revenue Attributed</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Generation Progress */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="p-6 mb-8 bg-card border-primary/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="font-semibold text-foreground">Generating Marketing Content</span>
                    <Badge variant="secondary">{progress}%</Badge>
                  </div>
                  <Progress value={progress} className="mb-2" />
                  <p className="text-sm text-muted-foreground">{generatingStatus}</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content Grid */}
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All ({contentPieces.length})</TabsTrigger>
                <TabsTrigger value="tiktok">TikTok</TabsTrigger>
                <TabsTrigger value="instagram">Instagram</TabsTrigger>
                <TabsTrigger value="twitter">X / Twitter</TabsTrigger>
                <TabsTrigger value="facebook">Facebook</TabsTrigger>
              </TabsList>
              <Button variant="outline" size="sm" onClick={() => refetchCampaigns()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {["all", "tiktok", "instagram", "twitter", "facebook"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                {campaignsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="p-6 bg-card animate-pulse h-64" />
                    ))}
                  </div>
                ) : contentPieces.filter((c) => tab === "all" || c.platform === tab).length === 0 ? (
                  <Card className="p-12 bg-card border-dashed border-2 border-border">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No content yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Hit "Launch Blitz" to generate marketing content for all products
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contentPieces
                      .filter((c) => tab === "all" || c.platform === tab)
                      .map((piece: any, idx: number) => (
                        <motion.div
                          key={piece.id || idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className="p-5 bg-card border-border hover:border-primary/30 transition-all group">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge className={`${platformColors[piece.platform]} border`}>
                                  {platformIcons[piece.platform]}
                                  <span className="ml-1 capitalize">{piece.platform}</span>
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {piece.type}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleCopy(
                                  `${piece.hook || ""}\n\n${piece.content || ""}\n\n${(piece.hashtags || []).map((h: string) => `#${h}`).join(" ")}`,
                                  piece.id
                                )}
                              >
                                {copiedId === piece.id ? (
                                  <Check className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>

                            <h3 className="font-semibold text-sm text-foreground mb-2 line-clamp-1">
                              {piece.campaignName}
                            </h3>

                            {piece.hook && (
                              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-3">
                                <p className="text-xs font-medium text-primary mb-1">🎣 HOOK</p>
                                <p className="text-sm text-foreground font-medium">{piece.hook}</p>
                              </div>
                            )}

                            <ScrollArea className="h-32 mb-3">
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                {piece.content}
                              </p>
                            </ScrollArea>

                            {piece.hashtags?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {piece.hashtags.slice(0, 6).map((tag: string, i: number) => (
                                  <span key={i} className="text-xs text-primary/70">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {piece.cta && (
                              <div className="bg-accent/10 rounded-lg p-2 mb-3">
                                <p className="text-xs text-accent-foreground">
                                  <strong>CTA:</strong> {piece.cta}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {piece.posting_time || "Any time"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {piece.target_audience || "General"}
                              </span>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* 5-Day Plan Card */}
          <Card className="mt-8 p-6 bg-card border-border">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              $5,000 in 5 Days — The Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { day: 1, goal: "Content Arsenal", tasks: "Generate all content, fix product images, optimize store page", target: "$0" },
                { day: 2, goal: "Platform Flood", tasks: "Post to TikTok, IG Reels, X threads. 10+ posts per platform", target: "$200" },
                { day: 3, goal: "Engagement Push", tasks: "Comment strategy, reply to every DM, share in groups/communities", target: "$800" },
                { day: 4, goal: "Retarget & Scale", tasks: "Double down on top performers, email drip to captured leads", target: "$1,500" },
                { day: 5, goal: "Close Hard", tasks: "Flash sale, urgency posts, final push email blast", target: "$2,500" },
              ].map((day) => (
                <div key={day.day} className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                      {day.day}
                    </span>
                    <span className="font-semibold text-foreground text-sm">{day.goal}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{day.tasks}</p>
                  <Badge variant="secondary" className="text-xs">{day.target}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default MarketingBlitz;
