import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, ArrowLeft, Globe, Zap, Target, FileText, ExternalLink,
  Gem, Crown, Shield, TrendingUp, Users, Coins, CheckCircle2,
  Play, Loader2, ChevronRight, Sparkles, BarChart3, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useWeb3Launch } from '@/hooks/useWeb3Launch';

const PLATFORM_ICONS: Record<string, string> = {
  opensea: '🌊', rarible: '🎨', coinbase_nft: '🔵', zora: '⚡',
  mirror: '📝', seedlist: '🌱', dao_maker: '🏛️', galxe: '🪐',
  guild_xyz: '🏰', snapshot: '📊',
};

const TYPE_COLORS: Record<string, string> = {
  nft_marketplace: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  creator_platform: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  publishing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  launchpad: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  community: 'bg-green-500/20 text-green-400 border-green-500/30',
  governance: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

export default function Web3LaunchCenter() {
  const { execute, isLoading, platforms, launchResult } = useWeb3Launch();
  const [activeTab, setActiveTab] = useState('platforms');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [pitchDeck, setPitchDeck] = useState<any>(null);
  const [allListings, setAllListings] = useState<any[] | null>(null);

  useEffect(() => {
    execute('research');
  }, []);

  const handleGeneratePitch = async () => {
    const result = await execute('generate_pitch');
    if (result?.pitch) setPitchDeck(result.pitch);
  };

  const handleGenerateAllListings = async () => {
    const result = await execute('generate_listing');
    if (result?.listings) setAllListings(result.listings);
  };

  const handleLaunchAll = async () => {
    const result = await execute('launch_all');
    if (result?.success) {
      setPitchDeck(result.pitch);
      setAllListings(result.listings);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-background to-cyan-900/10" />
      </div>

      {/* Header */}
      <header className="relative border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Rocket className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <span className="font-bold text-lg">Web3 Launch Center</span>
                  <p className="text-xs text-muted-foreground">Multi-Platform Deployment Engine</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Engine Ready
              </Badge>
              <Badge variant="outline">{platforms.length} Platforms</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-6 space-y-6">
        {/* Command Bar */}
        <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Launch Commands
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate listings, pitch decks, and deploy across all Web3 platforms
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => execute('research')} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Research
                </Button>
                <Button variant="outline" onClick={handleGenerateAllListings} disabled={isLoading}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Listings
                </Button>
                <Button variant="outline" onClick={handleGeneratePitch} disabled={isLoading}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Pitch Deck
                </Button>
                <Button
                  onClick={handleLaunchAll}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
                  🚀 Launch All Platforms
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Summary */}
        {launchResult?.research_summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {Object.entries(launchResult.research_summary).map(([key, value]) => (
              <Card key={key} className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">{key.replace('_', ' ')}</div>
                  <p className="text-xs leading-relaxed">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="platforms">Platforms ({platforms.length})</TabsTrigger>
            <TabsTrigger value="listings">Listings {allListings ? `(${allListings.length})` : ''}</TabsTrigger>
            <TabsTrigger value="pitch">Pitch Deck</TabsTrigger>
            <TabsTrigger value="next_steps">Next Steps</TabsTrigger>
          </TabsList>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map((platform, idx) => (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="hover:border-purple-500/50 transition-all cursor-pointer group"
                    onClick={() => setSelectedPlatform(selectedPlatform === platform.id ? null : platform.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{PLATFORM_ICONS[platform.id] || '🔗'}</span>
                          <div>
                            <CardTitle className="text-base">{platform.name}</CardTitle>
                            <Badge variant="outline" className={`text-[10px] mt-1 ${TYPE_COLORS[platform.type] || ''}`}>
                              {platform.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedPlatform === platform.id ? 'rotate-90' : ''}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-muted-foreground">{platform.best_for}</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-[10px]">{platform.chain}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{platform.fees}</Badge>
                      </div>

                      <AnimatePresence>
                        {selectedPlatform === platform.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 border-t border-border mt-3 space-y-2">
                              <div>
                                <span className="text-xs font-semibold">Strategy:</span>
                                <p className="text-xs text-muted-foreground mt-1">{platform.strategy}</p>
                              </div>
                              <div>
                                <span className="text-xs font-semibold">Requirements:</span>
                                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                                  {platform.requirements.map((req, i) => (
                                    <li key={i} className="flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                                      {req}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <a href={platform.url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="w-full mt-2">
                                  <ExternalLink className="w-3 h-3 mr-2" />
                                  Visit {platform.name}
                                </Button>
                              </a>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            {allListings ? (
              <div className="space-y-4">
                {allListings.map((item, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{PLATFORM_ICONS[item.platform_id] || '🔗'}</span>
                          <div>
                            <CardTitle className="text-base">{item.platform?.name}</CardTitle>
                            <CardDescription>{item.platform?.listing_format} format</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-48 whitespace-pre-wrap">
                          {JSON.stringify(item.listing, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Click "Generate Listings" or "Launch All" to create platform-specific content</p>
              </Card>
            )}
          </TabsContent>

          {/* Pitch Deck Tab */}
          <TabsContent value="pitch" className="space-y-4">
            {pitchDeck ? (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">{pitchDeck.title}</h3>
                {pitchDeck.slides.map((slide: any, idx: number) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
                    <Card className={idx === pitchDeck.slides.length - 1 ? 'border-purple-500/50 bg-purple-500/5' : ''}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{idx + 1}/{pitchDeck.slides.length}</Badge>
                          <CardTitle className="text-base">{slide.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm">{slide.content}</p>
                        {slide.stats && (
                          <div className="flex gap-2 flex-wrap">
                            {slide.stats.map((stat: string, i: number) => (
                              <Badge key={i} className="bg-green-500/20 text-green-400 border-green-500/30">{stat}</Badge>
                            ))}
                          </div>
                        )}
                        {slide.projections && (
                          <div className="flex gap-4">
                            {Object.entries(slide.projections).map(([year, amount]) => (
                              <div key={year} className="text-center">
                                <div className="text-lg font-bold text-green-400">{amount as string}</div>
                                <div className="text-xs text-muted-foreground">{year}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {slide.phases && (
                          <div className="space-y-1">
                            {slide.phases.map((phase: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                {phase}
                              </div>
                            ))}
                          </div>
                        )}
                        {slide.tiers && (
                          <div className="grid grid-cols-3 gap-3">
                            {slide.tiers.map((tier: any, i: number) => (
                              <Card key={i} className="bg-muted/50">
                                <CardContent className="pt-4 text-center">
                                  <div className="text-lg font-bold">{tier.amount}</div>
                                  <div className="text-xs text-muted-foreground mt-1">{tier.reward}</div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="py-12 text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Click "Pitch Deck" to generate investor presentation</p>
              </Card>
            )}
          </TabsContent>

          {/* Next Steps Tab */}
          <TabsContent value="next_steps" className="space-y-4">
            {launchResult?.next_steps ? (
              <div className="space-y-3">
                {launchResult.next_steps.map((step: string, idx: number) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                    <Card className="hover:border-primary/50 transition-all">
                      <CardContent className="pt-4 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                          {idx + 1}
                        </div>
                        <p className="text-sm flex-1">{step.replace(/^\d+\.\s*/, '')}</p>
                        <Button variant="ghost" size="sm">
                          <Play className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="py-12 text-center">
                <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Launch all platforms first to see actionable next steps</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
