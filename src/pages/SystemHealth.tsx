import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Activity, Database, CreditCard, ShoppingCart, Bot, Globe, Shield, Zap, Package, BarChart3, FileText, Megaphone, Truck, Blocks, Heart } from "lucide-react";

const SystemHealth = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("system-health");
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      operational: "bg-green-500/20 text-green-400 border-green-500/30",
      connected: "bg-green-500/20 text-green-400 border-green-500/30",
      wired: "bg-green-500/20 text-green-400 border-green-500/30",
      not_configured: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
      error: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return <Badge className={map[status] || "bg-muted text-muted-foreground"}>{status}</Badge>;
  };

  const moduleIcon = (name: string) => {
    const icons: Record<string, React.ReactNode> = {
      payments: <CreditCard className="h-4 w-4" />,
      products: <Package className="h-4 w-4" />,
      orders: <ShoppingCart className="h-4 w-4" />,
      agents: <Bot className="h-4 w-4" />,
      analytics: <BarChart3 className="h-4 w-4" />,
      content: <FileText className="h-4 w-4" />,
      marketing: <Megaphone className="h-4 w-4" />,
      fulfillment: <Truck className="h-4 w-4" />,
      web3: <Blocks className="h-4 w-4" />,
      health: <Heart className="h-4 w-4" />,
    };
    return icons[name] || <Zap className="h-4 w-4" />;
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Activity className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error) return <div className="min-h-screen bg-background flex items-center justify-center text-destructive">Failed to load system health</div>;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">System Health — Canonical Architecture</h1>
          <p className="text-sm text-muted-foreground">Single source of truth. All backend wiring verified in real-time.</p>
        </div>
      </div>

      {/* Core Services */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4" /> Database {statusBadge(data?.database?.status)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-muted-foreground">
            {data?.database?.tables && Object.entries(data.database.tables as Record<string, number>).map(([k, v]) => (
              <div key={k} className="flex justify-between"><span>{k}</span><span className="font-mono">{v}</span></div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4" /> Stripe {statusBadge(data?.stripe?.status)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Secret Key</span><span>{data?.stripe?.secret_key ? "✅" : "❌"}</span></div>
            <div className="flex justify-between"><span>Webhook Secret</span><span>{data?.stripe?.webhook_secret ? "✅" : "❌"}</span></div>
            <div className="flex justify-between"><span>Live Mode</span><span>{data?.stripe?.livemode ? "🔴 LIVE" : "🟡 TEST"}</span></div>
            {data?.stripe?.balance_available?.map((b: { amount: number; currency: string }, i: number) => (
              <div key={i} className="flex justify-between"><span>Balance ({b.currency})</span><span className="font-mono">${b.amount.toFixed(2)}</span></div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Shopify {statusBadge(data?.shopify?.status)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Admin Token</span><span>{data?.shopify?.admin_token ? "✅" : "❌"}</span></div>
            <div className="flex justify-between"><span>Storefront Token</span><span>{data?.shopify?.storefront_token ? "✅" : "❌"}</span></div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Modules */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Module Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data?.modules && Object.entries(data.modules as Record<string, { service: string; functions: string[]; status: string }>).map(([name, mod]) => (
            <Card key={name} className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {moduleIcon(name)}
                  <span className="capitalize">{name}</span>
                  {statusBadge(mod.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <div className="mb-1">Service: <span className="text-foreground">{mod.service}</span></div>
                <div className="flex flex-wrap gap-1">
                  {mod.functions.map((fn: string) => (
                    <Badge key={fn} variant="outline" className="text-[10px] font-mono">{fn}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Secrets */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Secrets Audit</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {data?.secrets && Object.entries(data.secrets as Record<string, boolean>).map(([name, set]) => (
            <div key={name} className="flex items-center gap-2 text-xs">
              <span className={set ? "text-green-400" : "text-red-400"}>{set ? "✅" : "❌"}</span>
              <span className="font-mono text-muted-foreground truncate">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Edge Functions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Deployed Edge Functions ({data?.edge_functions?.count})</h2>
        <div className="flex flex-wrap gap-1">
          {data?.edge_functions?.deployed?.map((fn: string) => (
            <Badge key={fn} variant="outline" className="text-xs font-mono">{fn}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
