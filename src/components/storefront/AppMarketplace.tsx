import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ExternalLink, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_PRODUCTS, AppProduct } from '@/lib/appProducts';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { formatPricePerMonth } from '@/lib/formatCurrency';

export function AppMarketplace() {
  const { user, session } = useAuthContext();
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleBuy = async (product: AppProduct) => {
    if (!user || !session?.access_token) {
      toast.error('Please sign in to purchase');
      navigate('/auth');
      return;
    }

    setLoadingId(product.id);
    const t = toast.loading(`Preparing checkout for ${product.name}…`);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { priceId: product.priceId, tierId: product.id },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success(`Opening checkout in a new tab`, { id: t });
      } else {
        throw new Error('Checkout URL missing');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start checkout', { id: t });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto mb-12 max-w-3xl text-center space-y-3">
        <Badge className="border-primary/25 bg-primary/10 text-primary">
          <Sparkles className="w-3 h-3 mr-1" /> Apps Marketplace
        </Badge>
        <h2 className="text-3xl font-bold md:text-4xl">
          Standalone <span className="text-gradient-oro">AI apps</span>, billed monthly
        </h2>
        <p className="text-muted-foreground">
          Pick individual modules from the AuraOmega ecosystem. Each one is a real Stripe subscription with a 3-day free trial.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {APP_PRODUCTS.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
          >
            <Card
              className={`oro-card h-full flex flex-col border-border/40 transition-all hover:border-primary/40 ${
                product.badge ? 'border-primary/40 shadow-lg shadow-primary/10' : ''
              }`}
            >
              {product.badge && (
                <div className="bg-gradient-to-r from-primary to-cyan-500 text-white text-center py-1 text-xs font-medium rounded-t-lg">
                  {product.badge}
                </div>
              )}
              <CardHeader>
                <div
                  className={`mb-3 h-10 w-10 rounded-xl bg-gradient-to-br ${product.accent} flex items-center justify-center`}
                >
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription className="text-xs uppercase tracking-wide text-primary/80">
                  {product.tagline}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                <div className="mb-5">
                  <span className="text-3xl font-bold">{formatPricePerMonth(product.price)}</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-2 mt-auto">
                  <Button
                    onClick={() => handleBuy(product)}
                    disabled={loadingId === product.id}
                    className={`w-full ${
                      product.badge ? 'bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90' : ''
                    }`}
                    variant={product.badge ? 'default' : 'outline'}
                  >
                    {loadingId === product.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing checkout…
                      </>
                    ) : (
                      <>
                        Start free trial <ExternalLink className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <Link to={`/apps/${product.id}`} className="block">
                    <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                      View details <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}