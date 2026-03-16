import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const authHeader = req.headers.get("Authorization") ?? "";

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [
      storesRes,
      revenueRes,
      ordersRes,
      stripeRes,
      agentsRes,
      decisionsRes,
      raceRes,
      agentRaceRes,
      trafficRes,
      logsRes,
    ] = await Promise.all([
      admin.from("stores").select("id,name,domain,status,currency,last_synced_at").order("created_at", { ascending: false }).limit(12),
      admin.from("revenue_metrics").select("date,revenue,orders_count").order("date", { ascending: true }).limit(120),
      admin.from("orders").select("id,total_amount,status,created_at").order("created_at", { ascending: false }).limit(500),
      admin.from("stripe_transactions").select("id,amount,status,created_at").order("created_at", { ascending: false }).limit(500),
      admin.from("agent_brains").select("id,is_active").limit(500),
      admin.from("ai_decisions").select("id,executed").order("created_at", { ascending: false }).limit(100),
      admin.from("sales_races").select("id,title,status,target_amount,total_revenue,total_orders,winning_agent_name").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      admin.from("sales_race_agents").select("id,sales_race_id").limit(500),
      admin.from("traffic_webhooks").select("source,revenue,created_at").order("created_at", { ascending: false }).limit(300),
      admin.from("agent_logs").select("id,agent_name,action,status,created_at").order("created_at", { ascending: false }).limit(8),
    ]);

    const errors = [storesRes.error, revenueRes.error, ordersRes.error, stripeRes.error, agentsRes.error, decisionsRes.error, raceRes.error, agentRaceRes.error, trafficRes.error, logsRes.error].filter(Boolean);
    if (errors.length > 0) {
      throw errors[0];
    }

    const stores = storesRes.data ?? [];
    const revenueSeries = revenueRes.data ?? [];
    const orders = ordersRes.data ?? [];
    const stripeTransactions = stripeRes.data ?? [];
    const agents = agentsRes.data ?? [];
    const decisions = decisionsRes.data ?? [];
    const latestRace = raceRes.data;
    const salesRaceAgents = agentRaceRes.data ?? [];
    const traffic = trafficRes.data ?? [];
    const recentLogs = logsRes.data ?? [];

    const totalMetricRevenue = revenueSeries.reduce((sum, item) => sum + Number(item.revenue ?? 0), 0);
    const orderRevenue = orders.reduce((sum, item) => sum + Number(item.total_amount ?? 0), 0);
    const stripeRevenue = stripeTransactions
      .filter((item) => item.status === "succeeded")
      .reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
    const revenue = Math.max(totalMetricRevenue, orderRevenue, stripeRevenue);

    const latestRevenue = Number(revenueSeries[revenueSeries.length - 1]?.revenue ?? 0);
    const previousRevenue = Number(revenueSeries[revenueSeries.length - 2]?.revenue ?? 0);
    const pendingOrders = orders.filter((item) => item.status === "pending").length;
    const completedOrders = orders.filter((item) => item.status === "completed").length;
    const activeAgents = agents.filter((item) => item.is_active).length;
    const pendingDecisions = decisions.filter((item) => !item.executed).length;
    const trafficBySource = Object.values(
      traffic.reduce<Record<string, { source: string; events: number; revenue: number }>>((acc, item) => {
        const source = item.source || "unknown";
        if (!acc[source]) acc[source] = { source, events: 0, revenue: 0 };
        acc[source].events += 1;
        acc[source].revenue += Number(item.revenue ?? 0);
        return acc;
      }, {}),
    )
      .sort((a, b) => b.revenue - a.revenue || b.events - a.events)
      .slice(0, 4);

    const raceAgentCount = latestRace
      ? salesRaceAgents.filter((item) => item.sales_race_id === latestRace.id).length
      : 0;

    const response = {
      totals: {
        revenue,
        stripeRevenue,
        orderRevenue,
        orders: orders.length,
        stores: stores.length,
        activeAgents,
        pendingDecisions,
        succeededStripeTransactions: stripeTransactions.filter((item) => item.status === "succeeded").length,
      },
      health: {
        avgOrderValue: orders.length > 0 ? revenue / orders.length : 0,
        pendingOrders,
        completedOrders,
        revenueDelta: latestRevenue - previousRevenue,
        autonomousReadiness: Math.max(0, Math.min(100, 45 + activeAgents * 4 + Math.max(0, 15 - pendingOrders))),
      },
      salesRace: {
        id: latestRace?.id ?? null,
        title: latestRace?.title ?? null,
        status: latestRace?.status ?? null,
        targetAmount: Number(latestRace?.target_amount ?? 0),
        totalRevenue: Number(latestRace?.total_revenue ?? 0),
        totalOrders: Number(latestRace?.total_orders ?? 0),
        winningAgentName: latestRace?.winning_agent_name ?? null,
        progress: latestRace?.target_amount
          ? Math.min(100, (Number(latestRace.total_revenue ?? 0) / Number(latestRace.target_amount)) * 100)
          : 0,
        liveAgents: raceAgentCount,
      },
      stores: stores.map((store) => ({
        id: store.id,
        name: store.name,
        domain: store.domain,
        status: store.status,
        currency: store.currency,
        lastSyncedAt: store.last_synced_at,
      })),
      signals: {
        topSources: trafficBySource,
        recentAgentActions: recentLogs.map((log) => ({
          id: log.id,
          agentName: log.agent_name,
          action: log.action,
          status: log.status,
          createdAt: log.created_at,
        })),
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("sales-control-plane error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
