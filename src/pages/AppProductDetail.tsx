import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2, Rocket, Settings, Shield, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSEOHead } from '@/hooks/useSEOHead';
import { APP_PRODUCTS, getAppProductById, productDetailDefaults } from '@/lib/appProducts';
import { formatPricePerMonth } from '@/lib/formatCurrency';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuraOmegaLogo } from '@/components/branding/AuraOmegaLogo';

export default function AppProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = id ? getAppProductById(id) : undefined;
  const { user, session } = useAuthContext();
  const { manageSubscription } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [launchLoading, setLaunchLoading] = useState(false);

  useSEOHead({
    title: product ? `${product.name} — AuraOmega` : 'App not found — AuraOmega',
    description: product?.description || 'Standalone AI app from AuraOmega.',
  });

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">App not found</h1>
          <p className="text-muted-foreground">We couldn't find that product.</p>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const outcomes = product.outcomes || productDetailDefaults.outcomes;
  const bestFor = product.bestFor || productDetailDefaults.bestFor;
  const faqs = product.faqs || productDetailDefaults.faqs;

  const handleCheckout = async () => {
    if (!user || !session?.access_token) {
      toast.error('Please sign in to start your trial');
      navigate('/auth');
      return;
    }
    setCheckoutLoading(true);
    const t = toast.loading(`Preparing secure checkout for ${product.name}…`);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { priceId: product.priceId, tierId: product.id },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('Checkout URL missing');
      toast.success('Opening checkout in a new tab', { id: t });
      window.open(data.url, '_blank');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start checkout', { id: t });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    if (!user || !session?.access_token) {
      toast.error('Please sign in to manage your subscription');
      navigate('/auth');
      return;
    }
    setPortalLoading(true);
    const t = toast.loading('Opening customer portal…');
    try {
      await manageSubscription();
      toast.success('Customer portal opened', { id: t });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open portal', { id: t });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleOneClickLaunch = async () => {
    if (!product) return;
    if (!user || !session?.access_token) {
      toast.error('Please sign in to launch');
      navigate('/auth');
      return;
    }
    setLaunchLoading(true);
    const t = toast.loading('Spinning up your organic launch across every channel…');
    try {
      const { data, error } = await supabase.functions.invoke('organic-launch', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { app_id: product.id, origin: window.location.origin },
      });
      if (error) throw error;
      if (!data?.launch_id) throw new Error('Launch did not return an id');
      toast.success(`Launch ready: ${data.posts} posts + ${data.landing_pages} SEO pages`, { id: t });
      navigate(`/launch/${data.launch_id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Launch failed', { id: t });
    } finally {
      setLaunchLoading(false);
    }
  };

  const otherProducts = APP_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link to="/" className="min-w-0">
            <AuraOmegaLogo className="max-w-[15rem]" />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/pricing">
              <Button variant="ghost">Pricing</Button>
            </Link>
            <Link to="/subscription">
              <Button variant="ghost">Manage</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 md:px-6 md:py-16 max-w-6xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> All apps
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          {/* Left: hero + content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <div
                className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${product.accent}`}
              >
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              {product.badge && (
                <Badge className="mb-2 bg-primary/10 text-primary border-primary/30">
                  {product.badge}
                </Badge>
              )}
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {product.name}
              </h1>
              <p className="mt-2 text-primary/90 text-sm uppercase tracking-wide font-medium">
                {product.tagline}
              </p>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                {product.longDescription || product.description}
              </p>
            </div>

            {/* Outcomes */}
            <div className="grid gap-4 sm:grid-cols-3">
              {outcomes.map((o) => (
                <Card key={o.metric} className="oro-card border-border/40">
                  <CardContent className="p-5">
                    <div className="text-3xl font-bold text-gradient-oro">{o.metric}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{o.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features */}
            <Card className="oro-card border-border/40">
              <CardHeader>
                <CardTitle className="text-xl">What's included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Best for */}
            <Card className="oro-card border-border/40">
              <CardHeader>
                <CardTitle className="text-xl">Best for</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {bestFor.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* FAQ */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Frequently asked</h2>
              {faqs.map((f) => (
                <Card key={f.q} className="oro-card border-border/40">
                  <CardContent className="p-5">
                    <div className="font-medium mb-1">{f.q}</div>
                    <div className="text-sm text-muted-foreground">{f.a}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Right: sticky purchase card */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <Card className="oro-card border-primary/30 shadow-lg shadow-primary/10">
              <CardContent className="p-6 space-y-5">
                <div>
                  <div className="text-4xl font-bold">
                    {formatPricePerMonth(product.price)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Billed monthly · cancel anytime
                  </div>
                </div>

                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                  <div className="flex items-center gap-2 font-medium text-primary">
                    <Sparkles className="w-4 h-4" /> 3-day free trial
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">
                    Full access today. We'll only charge after the trial ends.
                  </p>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 glow-primary"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Preparing checkout…
                    </>
                  ) : (
                    <>
                      Start free trial <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={handlePortal}
                  disabled={portalLoading}
                >
                  {portalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Opening portal…
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Manage subscription
                    </>
                  )}
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full bg-gradient-to-r from-fuchsia-500/20 to-amber-500/20 border border-amber-500/40 hover:from-fuchsia-500/30 hover:to-amber-500/30"
                  onClick={handleOneClickLaunch}
                  disabled={launchLoading}
                >
                  {launchLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Launching everywhere…
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      🚀 One-Click Organic Launch
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-muted-foreground text-center -mt-2">
                  Generates posts for Reddit, IG, YouTube, TikTok, X, LinkedIn, Pinterest, Facebook + SEO pages.
                </p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/40">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Secured by Stripe · Bank-grade encryption</span>
                </div>
              </CardContent>
            </Card>

            {otherProducts.length > 0 && (
              <div className="mt-6 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                  Other apps
                </div>
                {otherProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/apps/${p.id}`}
                    className="block rounded-lg border border-border/40 hover:border-primary/40 transition-colors p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{p.tagline}</div>
                      </div>
                      <div className="text-sm font-semibold whitespace-nowrap">
                        {formatPricePerMonth(p.price)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.aside>
        </div>
      </main>
    </div>
  );
}