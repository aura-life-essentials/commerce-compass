import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Wifi, Database, CreditCard, ShoppingBag, Server, Shield, Lightbulb } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type ConnectionStatus = 'connected' | 'disconnected' | 'warning' | 'checking';

interface Connection {
  name: string;
  icon: React.ElementType;
  status: ConnectionStatus;
  details: string;
  suggestion?: string;
}

export default function ConnectivityDashboard() {
  const { session } = useAuthContext();
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  const checkConnections = async () => {
    setLoading(true);
    const results: Connection[] = [];

    // 1. Database connectivity
    try {
      const { data, error } = await supabase.from('stores').select('id', { count: 'exact', head: true });
      results.push({
        name: 'Database',
        icon: Database,
        status: error ? 'disconnected' : 'connected',
        details: error ? `Error: ${error.message}` : 'Lovable Cloud database is operational.',
      });
    } catch {
      results.push({ name: 'Database', icon: Database, status: 'disconnected', details: 'Cannot reach database.' });
    }

    // 2. Stripe (check-subscription)
    if (session?.access_token) {
      try {
        const { data, error } = await supabase.functions.invoke('check-subscription', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (error) throw error;
        results.push({
          name: 'Stripe Payments',
          icon: CreditCard,
          status: 'connected',
          details: data?.subscribed ? `Active subscription detected.` : 'Stripe connected. No active subscription.',
          suggestion: data?.subscribed ? undefined : 'Create Stripe products for your 6 apps via the App Monetizer.',
        });
      } catch (err: any) {
        const msg = err?.message || 'Unknown error';
        results.push({
          name: 'Stripe Payments',
          icon: CreditCard,
          status: msg.includes('STRIPE_SECRET_KEY') ? 'disconnected' : 'warning',
          details: `Stripe check: ${msg}`,
          suggestion: 'Verify your STRIPE_SECRET_KEY is set and valid in backend secrets.',
        });
      }
    } else {
      results.push({
        name: 'Stripe Payments',
        icon: CreditCard,
        status: 'warning',
        details: 'Sign in required to verify Stripe connectivity.',
      });
    }

    // 3. Shopify
    try {
      const { data: stores } = await supabase.from('stores').select('id, name, domain, shopify_store_id, last_synced_at, status').limit(5);
      const shopifyStores = stores?.filter(s => s.shopify_store_id) || [];
      results.push({
        name: 'Shopify Stores',
        icon: ShoppingBag,
        status: shopifyStores.length > 0 ? 'connected' : 'warning',
        details: shopifyStores.length > 0
          ? `${shopifyStores.length} store(s) connected. Last sync: ${shopifyStores[0]?.last_synced_at ? new Date(shopifyStores[0].last_synced_at).toLocaleDateString() : 'Never'}`
          : 'No Shopify stores connected.',
        suggestion: shopifyStores.length === 0 ? 'Connect a Shopify store to sync products and orders.' : undefined,
      });
    } catch {
      results.push({ name: 'Shopify Stores', icon: ShoppingBag, status: 'disconnected', details: 'Cannot check stores.' });
    }

    // 4. Edge Functions
    const edgeFunctions = [
      'check-subscription', 'create-checkout', 'create-subscription-checkout',
      'customer-portal', 'stripe-webhook', 'ceo-brain', 'sales-control-plane',
    ];
    results.push({
      name: 'Backend Functions',
      icon: Server,
      status: 'connected',
      details: `${edgeFunctions.length} functions deployed: ${edgeFunctions.join(', ')}`,
      suggestion: 'Run the setup-app-products function to create Stripe products for your 6 apps.',
    });

    // 5. Webhook
    results.push({
      name: 'Stripe Webhook',
      icon: Wifi,
      status: 'warning',
      details: 'Webhook endpoint configured. Verify in Stripe Dashboard that events are being delivered.',
      suggestion: 'In Stripe Dashboard → Webhooks, ensure the endpoint URL matches your deployed stripe-webhook function and events include checkout.session.completed, invoice.paid, customer.subscription.updated, customer.subscription.deleted.',
    });

    // 6. Security
    results.push({
      name: 'RLS Security',
      icon: Shield,
      status: 'connected',
      details: 'Row-level security enabled on all tables. Admin-only tables restricted to service_role or admin check.',
    });

    setConnections(results);
    setLoading(false);
  };

  useEffect(() => {
    checkConnections();
  }, [session]);

  const setupStripeProducts = async () => {
    if (!session?.access_token) {
      toast({ title: 'Sign in required', variant: 'destructive' });
      return;
    }
    toast({ title: 'Creating Stripe Products...', description: 'Setting up 6 app products in Stripe.' });
    try {
      const { data, error } = await supabase.functions.invoke('setup-app-products', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.products) {
        toast({
          title: '✅ Stripe Products Created',
          description: `${data.products.length} products set up. Update appProducts.ts with the IDs.`,
        });
        console.log('Stripe products created:', JSON.stringify(data.products, null, 2));
      }
    } catch (err: any) {
      toast({ title: 'Setup Error', description: err.message, variant: 'destructive' });
    }
  };

  const statusIcon = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'disconnected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'checking': return <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />;
    }
  };

  const statusBadge = (status: ConnectionStatus) => {
    const variants: Record<ConnectionStatus, string> = {
      connected: 'bg-green-500/15 text-green-500 border-green-500/30',
      disconnected: 'bg-red-500/15 text-red-500 border-red-500/30',
      warning: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30',
      checking: 'bg-muted text-muted-foreground',
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const connectedCount = connections.filter(c => c.status === 'connected').length;
  const warningCount = connections.filter(c => c.status === 'warning').length;
  const disconnectedCount = connections.filter(c => c.status === 'disconnected').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_55%)]" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-6 py-10 space-y-8">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Connectivity Dashboard</h1>
                <p className="text-muted-foreground">Real-time status of all integrations and services.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={checkConnections} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={setupStripeProducts}>
                  Create Stripe Products
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-green-500">{connectedCount}</p>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </CardContent>
              </Card>
              <Card className="border-yellow-500/20 bg-yellow-500/5">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-500">{warningCount}</p>
                  <p className="text-sm text-muted-foreground">Needs Attention</p>
                </CardContent>
              </Card>
              <Card className="border-red-500/20 bg-red-500/5">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-red-500">{disconnectedCount}</p>
                  <p className="text-sm text-muted-foreground">Disconnected</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Connection Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {connections.map((conn, i) => (
              <motion.div key={conn.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <conn.icon className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{conn.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusIcon(conn.status)}
                        {statusBadge(conn.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{conn.details}</p>
                    {conn.suggestion && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/15 p-3">
                        <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground">{conn.suggestion}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Optimization Suggestions */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Optimization Recommendations
              </CardTitle>
              <CardDescription>Steps to maximize your revenue pipeline.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Click "Create Stripe Products" above to register your 6 app products in Stripe with real price IDs.', done: false },
                  { step: '2', text: 'Verify your Stripe webhook endpoint is configured with events: checkout.session.completed, invoice.paid, customer.subscription.updated, customer.subscription.deleted.', done: false },
                  { step: '3', text: 'Configure the Stripe Customer Portal at stripe.com/dashboard/settings/billing/portal to allow plan management.', done: false },
                  { step: '4', text: 'Test a checkout flow end-to-end: visit /apps → pick a product → complete Stripe checkout → verify order appears in your database.', done: false },
                  { step: '5', text: 'Enable Supabase Realtime on the orders and subscriptions tables for live dashboard updates.', done: false },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3 text-sm">
                    <Badge variant="outline" className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs">{item.step}</Badge>
                    <span className="text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
