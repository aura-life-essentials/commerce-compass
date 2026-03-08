import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useViralEngine, ViralProduct } from '@/hooks/useViralEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Flame, TrendingUp, DollarSign, Video, Zap, Search,
  ArrowLeft, Target, Hash, Users, Play, FileText, Sparkles,
  BarChart3, Shield, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const competitionColor = (c: string) => {
  if (c === 'low') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (c === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
};

const platformIcon = (p: string) => {
  const lower = p.toLowerCase();
  if (lower.includes('tiktok')) return '🎵';
  if (lower.includes('instagram')) return '📸';
  if (lower.includes('youtube')) return '▶️';
  return '🌐';
};

function ProductCard({ product, onGenerateScript, isGenerating }: { 
  product: ViralProduct; 
  onGenerateScript: () => void;
  isGenerating: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-5 bg-card border-border hover:border-primary/40 transition-all group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={competitionColor(product.competition)}>
              {product.competition} comp
            </Badge>
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-primary">{product.viral_score}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
            <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Sell</p>
            <p className="text-sm font-bold text-foreground">${product.sell_price}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
            <BarChart3 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Margin</p>
            <p className="text-sm font-bold text-emerald-400">{product.profit_margin}%</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
            <Target className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Cost</p>
            <p className="text-sm font-bold text-foreground">${product.cost_price || '??'}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.why_viral}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {product.platforms?.map((p, i) => (
            <span key={i} className="text-xs bg-secondary px-2 py-0.5 rounded-full">
              {platformIcon(p)} {p}
            </span>
          ))}
        </div>

        {product.hooks?.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Viral Hooks
            </p>
            <div className="flex flex-wrap gap-1">
              {product.hooks.slice(0, 3).map((h, i) => (
                <Badge key={i} variant="secondary" className="text-xs font-normal">
                  {h.length > 40 ? h.substring(0, 40) + '...' : h}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {product.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.hashtags.slice(0, 5).map((tag, i) => (
              <span key={i} className="text-xs text-primary/70">
                #{tag.replace('#', '')}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onGenerateScript}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <><Sparkles className="w-3.5 h-3.5 mr-1 animate-spin" /> Generating...</>
            ) : (
              <><FileText className="w-3.5 h-3.5 mr-1" /> Generate Script</>
            )}
          </Button>
          <Button size="sm" variant="outline">
            <Video className="w-3.5 h-3.5" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function ScriptPanel({ generations }: { generations: any[] }) {
  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <FileText className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Generate a script from a viral product to see it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {generations.map((gen, i) => (
        <Card key={i} className="p-4 bg-card border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-foreground">{gen.product.name}</h4>
            <Badge variant={gen.status === 'done' ? 'default' : 'secondary'}>
              {gen.status === 'scripting' ? '✍️ Writing...' : gen.status === 'done' ? '✅ Ready' : gen.status === 'generating' ? '🎬 Rendering...' : '❌ Error'}
            </Badge>
          </div>
          {gen.script && (
            <ScrollArea className="h-64">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {gen.script}
              </pre>
            </ScrollArea>
          )}
          {gen.error && (
            <p className="text-sm text-destructive">{gen.error}</p>
          )}
        </Card>
      ))}
    </div>
  );
}

export default function ViralEngine() {
  const navigate = useNavigate();
  const {
    products,
    rawResearch,
    citations,
    isResearching,
    research,
    generateScript,
    videoGenerations,
  } = useViralEngine();
  const [activeTab, setActiveTab] = useState('products');

  const handleResearch = () => {
    research();
  };

  const handleGenerateScript = (product: ViralProduct) => {
    generateScript(product);
    setActiveTab('scripts');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
                <Flame className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Viral Growth Engine</h1>
                <p className="text-xs text-muted-foreground">Research → Script → Generate → Post</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {products.length > 0 && (
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  <span className="font-bold text-foreground">{products.length}</span> products found
                </span>
                <span className="text-muted-foreground">
                  <span className="font-bold text-emerald-400">
                    {products.filter(p => p.competition === 'low').length}
                  </span> low competition
                </span>
              </div>
            )}
            <Button
              onClick={handleResearch}
              disabled={isResearching}
              className="gap-2"
            >
              {isResearching ? (
                <><Search className="w-4 h-4 animate-pulse" /> Scanning the web...</>
              ) : (
                <><Zap className="w-4 h-4" /> {products.length > 0 ? 'Rescan' : 'Find Viral Products'}</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isResearching && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
              <Search className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Scanning the Internet...</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Analyzing TikTok, Instagram, and YouTube for the most viral products with high margins and low competition
            </p>
            <div className="max-w-xs mx-auto">
              <Progress value={33} className="h-1.5" />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {['Beauty', 'Health', 'Tech', 'Home', 'Office'].map(n => (
                <Badge key={n} variant="secondary" className="animate-pulse">
                  Scanning {n}...
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Empty State */}
      {!isResearching && products.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-12 h-12 text-primary/50" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Find Your Next Winning Product</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Our AI scrapes TikTok, Instagram & YouTube to find the most viral products with the highest margins and lowest competition — then generates ready-to-post video content.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                { icon: Search, label: 'Scrape viral trends' },
                { icon: BarChart3, label: 'Analyze margins' },
                { icon: Shield, label: 'Score competition' },
                { icon: Video, label: 'Generate videos' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-4 py-2.5">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">{label}</span>
                </div>
              ))}
            </div>
            <Button size="lg" onClick={handleResearch} className="gap-2">
              <Flame className="w-5 h-5" /> Launch Viral Research
            </Button>
          </motion.div>
        </div>
      )}

      {/* Results */}
      {!isResearching && products.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="products" className="gap-1.5">
                <Flame className="w-3.5 h-3.5" /> Products ({products.length})
              </TabsTrigger>
              <TabsTrigger value="scripts" className="gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Scripts ({videoGenerations.length})
              </TabsTrigger>
              <TabsTrigger value="research" className="gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Raw Research
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {products.map((product, i) => (
                    <ProductCard
                      key={product.name + i}
                      product={product}
                      onGenerateScript={() => handleGenerateScript(product)}
                      isGenerating={
                        videoGenerations.some(g => g.product.name === product.name && g.status === 'scripting')
                      }
                    />
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="scripts">
              <ScriptPanel generations={videoGenerations} />
            </TabsContent>

            <TabsContent value="research">
              <Card className="p-6 bg-card border-border">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" /> Raw Research Data
                </h3>
                {citations.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Sources:</p>
                    <div className="flex flex-wrap gap-1">
                      {citations.map((c, i) => (
                        <a
                          key={i}
                          href={c}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          [{i + 1}]
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <ScrollArea className="h-96">
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                    {rawResearch}
                  </pre>
                </ScrollArea>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
