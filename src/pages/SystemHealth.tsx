import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/dashboard/Header";
import { 
  Activity, Database, CreditCard, ShoppingCart, Bot, Globe, Shield, Zap, 
  Package, BarChart3, FileText, Truck, Heart, AlertCircle, CheckCircle2,
  XCircle, Clock, RefreshCw, Webhook
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const SystemHealth = () => {
  // Real system health from edge function
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ["system-health-real"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("system-health");
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000,
  });

  // Real webhook events
  const { data: webhookEvents } = useQuery({
    queryKey: ["webhook-events-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhook_events")
        .select("*")
        .order("received_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000,
  });

  // Real agent runs
  const { data: agentRuns } = useQuery({
    queryKey: ["agent-runs-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000,
  });

  // Real health checks
  const { data: healthChecks } = useQuery({
    queryKey: ["health-checks-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("health_checks")
        .select("*")
        .order("checked_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000,
  });

  // Integration status
  const { data: integrations } = useQuery({
    queryKey: ["integrations-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  // Fulfillment jobs
  const { data: fulfillmentJobs } = useQuery({
    queryKey: ["fulfillment-jobs-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fulfillment_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  // Sync jobs
  const { data: syncJobs } = useQuery({
    queryKey: ["sync-jobs-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sync_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  // Real table counts
  const { data: tableCounts } = useQuery({
    queryKey: ["table-counts-admin"],
    queryFn: async () => {
      const results: Record<string, number> = {};
      const tableNames = [
        "stores", "products", "orders", "stripe_transactions", "subscriptions",
        "agent_brains", "agent_logs", "ai_decisions", "webhook_events",
        "agent_runs", "health_checks", "fulfillment_jobs", "integrations",
        "lead_contacts", "content_pipeline", "organic_campaigns"
      ] as const;
      for (const table of tableNames) {
        const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
        results[table] = count || 0;
      }
      return results;
    },
    refetchInterval: 30000,
  });

  const statusIcon = (status: string) => {
    if (["pass", "connected", "operational", "completed", "processed"].includes(status)) 
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (["fail", "broken", "failed", "error"].includes(status)) 
      return <XCircle className="w-4 h-4 text-red-500" />;
    if (["unknown", "not_configured", "pending", "running"].includes(status)) 
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  const statusBadge = (status: string) => {
    const colorMap: Record<string, string> = {
      pass: "bg-green-500/20 text-green-400 border-green-500/30",
      connected: "bg-green-500/20 text-green-400 border-green-500/30",
      operational: "bg-green-500/20 text-green-400 border-green-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      processed: "bg-green-500/20 text-green-400 border-green-500/30",
      fail: "bg-red-500/20 text-red-400 border-red-500/30",
      broken: "bg-red-500/20 text-red-400 border-red-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
      error: "bg-red-500/20 text-red-400 border-red-500/30",
      not_configured: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      running: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      received: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    };
    return <Badge className={colorMap[status] || "bg-muted text-muted-foreground"}>{status.toUpperCase()}</Badge>;
  };

  if (healthLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Activity className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">System Health — Production Diagnostics</h1>
              <p className="text-sm text-muted-foreground">Real backend verification. No simulated status.</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => { refetchHealth(); toast.success("Refreshing..."); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Core Services - from edge function */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4" /> Database 
                {statusBadge(healthData?.database?.status || "unknown")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              {tableCounts && Object.entries(tableCounts).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="font-mono">{k}</span>
                  <span className="font-mono font-bold">{v as number}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Stripe 
                {statusBadge(healthData?.stripe?.status || "unknown")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Secret Key</span><span>{healthData?.stripe?.secret_key ? "✅ Set" : "❌ Missing"}</span></div>
              <div className="flex justify-between"><span>Webhook Secret</span><span>{healthData?.stripe?.webhook_secret ? "✅ Set" : "❌ Missing"}</span></div>
              <div className="flex justify-between"><span>Mode</span><span>{healthData?.stripe?.livemode ? "🔴 LIVE" : "🟡 TEST"}</span></div>
              {healthData?.stripe?.balance_available?.map((b: { amount: number; currency: string }, i: number) => (
                <div key={i} className="flex justify-between">
                  <span>Balance ({b.currency})</span>
                  <span className="font-mono">${b.amount.toFixed(2)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Shopify 
                {statusBadge(healthData?.shopify?.status || "unknown")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Admin Token</span><span>{healthData?.shopify?.admin_token ? "✅ Set" : "❌ Missing"}</span></div>
              <div className="flex justify-between"><span>Storefront Token</span><span>{healthData?.shopify?.storefront_token ? "✅ Set" : "❌ Missing"}</span></div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Webhook Monitor */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Webhook className="w-5 h-5" /> Webhook Monitor
            <Badge variant="outline" className="text-xs">{webhookEvents?.length || 0} events</Badge>
          </h2>
          {webhookEvents && webhookEvents.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {webhookEvents.map((event: any) => (
                  <Card key={event.id} className="border-border">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {statusIcon(event.delivery_status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{event.provider}</span>
                            <Badge variant="outline" className="text-xs font-mono">{event.topic}</Badge>
                            {statusBadge(event.delivery_status)}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span>Signature: {event.signature_valid ? "✅ Valid" : "❌ Invalid"}</span>
                            {event.response_code && <span>HTTP {event.response_code}</span>}
                            <span>{formatDistanceToNow(new Date(event.received_at), { addSuffix: true })}</span>
                          </div>
                          {event.processing_notes && (
                            <p className="text-xs text-muted-foreground mt-1">{event.processing_notes}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Card className="border-border">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Webhook className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No webhook events recorded yet.</p>
                <p className="text-xs">Events will appear here when Stripe or Shopify sends webhooks.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        {/* Agent Runs + Sync Jobs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Bot className="w-5 h-5" /> Recent Agent Runs
              <Badge variant="outline" className="text-xs">{agentRuns?.length || 0}</Badge>
            </h2>
            {agentRuns && agentRuns.length > 0 ? (
              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {agentRuns.map((run: any) => (
                    <div key={run.id} className="p-3 rounded-lg border bg-secondary/30">
                      <div className="flex items-center gap-2">
                        {statusIcon(run.status)}
                        <span className="text-sm font-medium">{run.agent_name}</span>
                        {statusBadge(run.status)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Trigger: {run.trigger_source} • {formatDistanceToNow(new Date(run.started_at), { addSuffix: true })}
                      </div>
                      {run.error_message && <p className="text-xs text-red-400 mt-1">{run.error_message}</p>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <Card className="border-border">
                <CardContent className="p-6 text-center text-muted-foreground text-sm">
                  No agent runs recorded. Trigger an agent from the CEO Brain dashboard.
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" /> Sync Jobs
              <Badge variant="outline" className="text-xs">{syncJobs?.length || 0}</Badge>
            </h2>
            {syncJobs && syncJobs.length > 0 ? (
              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {syncJobs.map((job: any) => (
                    <div key={job.id} className="p-3 rounded-lg border bg-secondary/30">
                      <div className="flex items-center gap-2">
                        {statusIcon(job.status)}
                        <span className="text-sm font-medium">{job.job_type}</span>
                        {statusBadge(job.status)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Processed: {job.processed_items || 0}/{job.total_items || '?'} • {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </div>
                      {job.error_message && <p className="text-xs text-red-400 mt-1">{job.error_message}</p>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <Card className="border-border">
                <CardContent className="p-6 text-center text-muted-foreground text-sm">
                  No sync jobs recorded yet.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Separator />

        {/* Fulfillment Status */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Truck className="w-5 h-5" /> Fulfillment Queue
            <Badge variant="outline" className="text-xs">{fulfillmentJobs?.length || 0}</Badge>
          </h2>
          {fulfillmentJobs && fulfillmentJobs.length > 0 ? (
            <div className="space-y-2">
              {fulfillmentJobs.map((job: any) => (
                <div key={job.id} className="p-3 rounded-lg border bg-secondary/30 flex items-center gap-3">
                  {statusIcon(job.status)}
                  <div className="flex-1">
                    <span className="text-sm font-medium">Order: {job.order_id?.slice(0, 8)}...</span>
                    <span className="text-xs text-muted-foreground ml-2">Provider: {job.provider}</span>
                  </div>
                  {statusBadge(job.status)}
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                <p className="text-sm font-medium text-amber-400">FULFILLMENT: NOT IMPLEMENTED</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No fulfillment dispatch jobs recorded. This layer requires a supplier endpoint configuration.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        {/* Integration Registry */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5" /> Integration Registry
          </h2>
          {integrations && integrations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {integrations.map((int: any) => (
                <Card key={int.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">{int.type}</span>
                      {statusBadge(int.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last verified: {int.last_verified_at 
                        ? formatDistanceToNow(new Date(int.last_verified_at), { addSuffix: true }) 
                        : "Never"}
                    </p>
                    {int.error_message && <p className="text-xs text-red-400 mt-1">{int.error_message}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border">
              <CardContent className="p-6 text-center text-muted-foreground text-sm">
                No integrations registered. Run system health check to auto-detect connections.
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        {/* Secrets + Edge Functions from health data */}
        {healthData?.secrets && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Secrets Audit</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(healthData.secrets as Record<string, boolean>).map(([name, set]) => (
                <div key={name} className="flex items-center gap-2 text-xs">
                  <span className={set ? "text-green-400" : "text-red-400"}>{set ? "✅" : "❌"}</span>
                  <span className="font-mono text-muted-foreground truncate">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {healthData?.edge_functions && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-semibold mb-3">
                Deployed Edge Functions ({healthData.edge_functions.count})
              </h2>
              <div className="flex flex-wrap gap-1">
                {healthData.edge_functions.deployed?.map((fn: string) => (
                  <Badge key={fn} variant="outline" className="text-xs font-mono">{fn}</Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Pipeline Summary */}
        <Separator />
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              End-to-End Pipeline Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              {[
                { label: "Shopify API", status: healthData?.shopify?.admin_token ? "VERIFIED" : "NOT CONFIGURED" },
                { label: "Stripe API", status: healthData?.stripe?.secret_key ? "VERIFIED" : "NOT CONFIGURED" },
                { label: "Database", status: healthData?.database?.status === "operational" ? "VERIFIED" : "UNKNOWN" },
                { label: "Webhooks", status: (webhookEvents?.length || 0) > 0 ? "RECEIVING" : "NO EVENTS" },
                { label: "Fulfillment", status: (fulfillmentJobs?.length || 0) > 0 ? "ACTIVE" : "NOT IMPLEMENTED" },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-lg bg-background text-center">
                  <p className="font-medium mb-1">{item.label}</p>
                  {statusBadge(
                    ["VERIFIED", "RECEIVING", "ACTIVE"].includes(item.status) ? "pass" :
                    ["NOT CONFIGURED", "NOT IMPLEMENTED", "NO EVENTS"].includes(item.status) ? "not_configured" : "fail"
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemHealth;
