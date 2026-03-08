import { useState } from 'react';
import { motion } from 'framer-motion';
import { useContentFactory, PipelineItem } from '@/hooks/useContentFactory';
import { useViralEngine } from '@/hooks/useViralEngine';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Factory, Play, Video, Zap, Search, ArrowLeft, RefreshCw,
  FileText, Sparkles, CheckCircle, AlertCircle, Clock, Loader2,
  Rocket, Youtube, Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stageProgress: Record<string, number> = {
  starting: 5,
  research: 10,
  scripting: 25,
  scripted: 40,
  video_generating: 50,
  video_pending: 60,
  video_ready: 80,
  ready_to_post: 90,
  posted: 100,
};

const stageLabel: Record<string, string> = {
  starting: 'Initializing...',
  research: 'Researching...',
  scripting: 'Writing Script...',
  scripted: 'Script Ready',
  video_generating: 'Generating Video...',
  video_pending: 'Video Rendering...',
  video_ready: 'Video Ready',
  ready_to_post: 'Ready to Post',
  posted: 'Published!',
};

const statusIcon = (status: string) => {
  if (status === 'error') return <AlertCircle className="w-4 h-4 text-red-400" />;
  if (status === 'ready_to_post' || status === 'posted') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (status === 'processing') return <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />;
  return <Clock className="w-4 h-4 text-muted-foreground" />;
};

function PipelineCard({ item, onPollVideo }: { item: PipelineItem; onPollVideo: (id: string) => void }) {
  const progress = stageProgress[item.stage] || 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-4 bg-card border-border hover:border-primary/30 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {statusIcon(item.status)}
            <h3 className="font-semibold text-foreground text-sm">{item.product_name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Youtube className="w-3 h-3 mr-1" /> Shorts
            </Badge>
            <Badge variant={item.status === 'error' ? 'destructive' : 'secondary'} className="text-xs">
              {item.source}
            </Badge>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{stageLabel[item.stage] || item.stage}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {item.error_message && (
          <p className="text-xs text-red-400 mb-2 truncate">{item.error_message}</p>
        )}

        {item.script && (
          <details className="mb-2">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              <FileText className="w-3 h-3 inline mr-1" /> View Script
            </summary>
            <pre className="text-xs text-muted-foreground mt-1 p-2 bg-muted/50 rounded max-h-32 overflow-auto whitespace-pre-wrap">
              {item.script}
            </pre>
          </details>
        )}

        {item.video_url && (
          <a href={item.video_url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1 mb-2">
            <Video className="w-3 h-3" /> Watch Video
          </a>
        )}

        <div className="flex gap-2 mt-2">
          {item.stage === 'video_pending' && (
            <Button size="sm" variant="outline" onClick={() => onPollVideo(item.id)} className="text-xs h-7">
              <RefreshCw className="w-3 h-3 mr-1" /> Check Video
            </Button>
          )}
          {item.video_url && !item.post_url && (
            <Button size="sm" variant="default" className="text-xs h-7" disabled>
              <Youtube className="w-3 h-3 mr-1" /> Post (API Key Needed)
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          {new Date(item.created_at).toLocaleString()}
        </p>
      </Card>
    </motion.div>
  );
}

export default function ContentFactory() {
  const navigate = useNavigate();
  const { pipeline, isLoading, isProcessing, startSingle, startBatch, pollVideo, refetch } = useContentFactory();
  const { products, isResearching, research } = useViralEngine();
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());

  const handleResearchAndCreate = async () => {
    const found = await research();
    if (found && found.length > 0) {
      const top5 = found.slice(0, 5).map((p: any) => ({ ...p, source: 'viral_research' }));
      await startBatch(top5);
    }
  };

  const toggleProduct = (i: number) => {
    setSelectedProducts(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleCreateFromSelected = async () => {
    const selected = Array.from(selectedProducts).map(i => ({ ...products[i], source: 'viral_research' }));
    if (selected.length) await startBatch(selected);
    setSelectedProducts(new Set());
  };

  const processingCount = pipeline.filter(i => i.status === 'processing').length;
  const readyCount = pipeline.filter(i => i.status === 'ready_to_post').length;
  const errorCount = pipeline.filter(i => i.status === 'error').length;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Factory className="w-6 h-6 text-primary" />
              Content Factory
            </h1>
            <p className="text-sm text-muted-foreground">Automated content pipeline → YouTube Shorts</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="p-3 bg-card border-border">
          <p className="text-xs text-muted-foreground">Total Content</p>
          <p className="text-2xl font-bold text-foreground">{pipeline.length}</p>
        </Card>
        <Card className="p-3 bg-card border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin text-amber-400" /> Processing
          </p>
          <p className="text-2xl font-bold text-amber-400">{processingCount}</p>
        </Card>
        <Card className="p-3 bg-card border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> Ready
          </p>
          <p className="text-2xl font-bold text-emerald-400">{readyCount}</p>
        </Card>
        <Card className="p-3 bg-card border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-red-400" /> Errors
          </p>
          <p className="text-2xl font-bold text-red-400">{errorCount}</p>
        </Card>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="pipeline">
            <Rocket className="w-4 h-4 mr-1" /> Pipeline
          </TabsTrigger>
          <TabsTrigger value="create">
            <Sparkles className="w-4 h-4 mr-1" /> Create Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          <ScrollArea className="h-[calc(100vh-320px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : pipeline.length === 0 ? (
              <Card className="p-12 bg-card border-border text-center">
                <Factory className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No content yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start the factory to auto-create viral content for YouTube Shorts
                </p>
                <Button onClick={handleResearchAndCreate} disabled={isResearching || isProcessing}>
                  {isResearching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                  Auto-Research & Create
                </Button>
              </Card>
            ) : (
              <div className="grid gap-3">
                {pipeline.map(item => (
                  <PipelineCard key={item.id} item={item} onPollVideo={pollVideo} />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="create">
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="p-4 bg-card border-border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" /> Auto-Research & Create
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Find top 5 viral products and auto-generate scripts + videos
                </p>
                <Button onClick={handleResearchAndCreate} disabled={isResearching || isProcessing} className="w-full">
                  {(isResearching || isProcessing) ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Launch Full Pipeline
                </Button>
              </Card>

              <Card className="p-4 bg-card border-border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" /> From Shopify Store
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Create content for your existing Shopify products
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => startSingle({
                    name: "Shopify Product Bundle",
                    category: "E-commerce",
                    sell_price: 29.99,
                    why_viral: "Best-selling store product with high reviews",
                    target_demo: "Online shoppers 18-35",
                    source: "shopify",
                  })}
                  disabled={isProcessing}
                >
                  <Play className="w-4 h-4 mr-2" /> Create Store Content
                </Button>
              </Card>
            </div>

            {/* Research Results */}
            {products.length > 0 && (
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Viral Products Found ({products.length})
                  </h3>
                  {selectedProducts.size > 0 && (
                    <Button size="sm" onClick={handleCreateFromSelected} disabled={isProcessing}>
                      <Video className="w-4 h-4 mr-1" />
                      Create {selectedProducts.size} Videos
                    </Button>
                  )}
                </div>
                <div className="grid gap-2 max-h-80 overflow-auto">
                  {products.map((p, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded border cursor-pointer transition-all ${
                        selectedProducts.has(i)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/30'
                      }`}
                      onClick={() => toggleProduct(i)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">${p.sell_price}</Badge>
                          <Badge variant="secondary" className="text-xs">{p.viral_score}/100</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{p.category} • {p.competition} competition</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
