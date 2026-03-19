import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Users, Zap, ShoppingCart, Globe, Video, ArrowRight, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { APP_PRODUCTS, type AppProduct } from '@/lib/appProducts';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StoreFooter } from '@/components/store/StoreFooter';

const iconMap: Record<string, React.ElementType> = {
  Brain, Users, Zap, ShoppingCart, Globe, Video,
};

const categories = [
  { id: 'all', label: 'All Apps' },
  { id: 'ai-agents', label: 'AI Agents' },
  { id: 'e-commerce', label: 'E-Commerce' },
  { id: 'web3', label: 'Web3' },
  { id: 'media', label: 'Media' },
];

function AppProductCard({ product, onSubscribe, loading }: { product: AppProduct; onSubscribe: (p: AppProduct) => void; loading: boolean }) {
  const Icon = iconMap[product.icon] || Brain;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col border-border/60 bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 overflow-hidden group">
        <div className={`h-2 bg-gradient-to-r ${product.color}`} />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">${product.price}</p>
              <p className="text-xs text-muted-foreground">/month</p>
            </div>
          </div>
          <CardTitle className="text-xl mt-3">{product.name}</CardTitle>
          <CardDescription className="text-sm">{product.tagline}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <p className="text-sm text-muted-foreground mb-4">{product.description}</p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.highlights.map((h) => (
              <Badge key={h} variant="secondary" className="text-xs">{h}</Badge>
            ))}
          </div>

          <ul className="space-y-2 mb-6 flex-1">
            {product.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <Button
            className={`w-full bg-gradient-to-r ${product.color} hover:opacity-90 text-white`}
            onClick={() => onSubscribe(product)}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Subscribe Now'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AppStore() {
  const navigate = useNavigate();
  const { session } = useAuthContext();
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);

  const filtered = filter === 'all' ? APP_PRODUCTS : APP_PRODUCTS.filter(p => p.category === filter);

  const handleSubscribe = async (product: AppProduct) => {
    if (!session?.access_token) {
      toast({ title: 'Sign in required', description: 'Please sign in to subscribe.', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (!product.priceId) {
      toast({ title: 'Coming Soon', description: 'This product is being set up. Please check back shortly.' });
      return;
    }

    setLoadingProduct(product.id);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { priceId: product.priceId, tierId: product.id },
      });

      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err: any) {
      toast({ title: 'Checkout Error', description: err.message || 'Failed to start checkout.', variant: 'destructive' });
    } finally {
      setLoadingProduct(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="relative container mx-auto px-6 pt-12 pb-8">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => navigate('/')}>← Back</Button>
            <Button variant="outline" onClick={() => navigate('/auth')}>Sign In</Button>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/30">
              <Star className="w-3 h-3 mr-1" /> Revenue OS App Store
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              AI-Powered Business Tools
            </h1>
            <p className="text-lg text-muted-foreground">
              Subscribe to individual tools, or combine them into bundles and suites. Each app runs autonomously to generate revenue, create content, and scale your operations.
            </p>
          </motion.div>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={filter === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="container mx-auto px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <AppProductCard
              key={product.id}
              product={product}
              onSubscribe={handleSubscribe}
              loading={loadingProduct === product.id}
            />
          ))}
        </div>

        {/* Trust section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div>
              <p className="text-2xl font-bold">6</p>
              <p className="text-xs text-muted-foreground">AI-Powered Apps</p>
            </div>
            <div>
              <p className="text-2xl font-bold">200+</p>
              <p className="text-xs text-muted-foreground">AI Agents</p>
            </div>
            <div>
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-xs text-muted-foreground">Autonomous Ops</p>
            </div>
            <div>
              <p className="text-2xl font-bold">$360</p>
              <p className="text-xs text-muted-foreground">Starting Price</p>
            </div>
          </div>
        </motion.div>
      </main>

      <StoreFooter />
    </div>
  );
}
