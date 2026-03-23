import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const logStep = (step: string, details?: unknown) => {
  console.log(`[TRAFFIC-WEBHOOK] ${step}`, details ? JSON.stringify(details) : "");
};

async function requireAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const token = authHeader.replace("Bearer ", "");

  // Allow service-role key for internal edge-function-to-edge-function calls
  if (token === SUPABASE_SERVICE_ROLE_KEY) {
    return "service-role";
  }

  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await authClient.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return data.claims.sub;
}

async function analyzeTrafficPatterns() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: traffic, error } = await supabase
    .from("traffic_webhooks")
    .select("*")
    .gte("created_at", yesterday);

  if (error) {
    logStep("Error fetching traffic", error);
    return null;
  }

  const bySource: Record<string, { count: number; revenue: number }> = {};
  const byCountry: Record<string, { count: number; revenue: number }> = {};

  for (const t of traffic || []) {
    if (!bySource[t.source]) bySource[t.source] = { count: 0, revenue: 0 };
    bySource[t.source].count++;
    bySource[t.source].revenue += t.revenue || 0;

    if (t.country) {
      if (!byCountry[t.country]) byCountry[t.country] = { count: 0, revenue: 0 };
      byCountry[t.country].count++;
      byCountry[t.country].revenue += t.revenue || 0;
    }
  }

  return {
    total_events: traffic?.length || 0,
    by_source: bySource,
    by_country: byCountry,
    total_revenue: traffic?.reduce((sum, t) => sum + (t.revenue || 0), 0) || 0,
  };
}

async function optimizeTraffic(analysis: any) {
  logStep("Optimizing traffic based on analysis");

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${XAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-3-mini-fast",
      messages: [
        {
          role: "system",
          content: `You are a traffic optimization AI. Your goal is to increase organic traffic by 300% daily.
          Analyze traffic patterns and provide actionable recommendations for scaling.`
        },
        {
          role: "user",
          content: `Based on this traffic analysis, provide optimization recommendations:

${JSON.stringify(analysis, null, 2)}

Provide specific actions to:
1. Scale high-performing sources
2. Optimize underperforming sources
3. Expand to new countries with high potential
4. Improve conversion rates
5. Reduce acquisition costs

Return as JSON with prioritized actions.`
        }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI optimization failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return { recommendations: content };
    }
  }
  return { recommendations: content };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await requireAuthenticatedUser(req);

    const { action, event_type, source, country, device, utm_data, revenue, store_id } = await req.json();
    logStep("Request received", { action, event_type, source });

    if (action === "track") {
      const { data: webhook, error } = await supabase.from("traffic_webhooks").insert({
        webhook_type: event_type || "click",
        source: source || "unknown",
        country,
        device,
        utm_data: utm_data || {},
        revenue: revenue || 0,
        store_id,
        processed: false,
      }).select().single();

      if (error) throw error;

      if (event_type === "purchase" && revenue && store_id) {
        const today = new Date().toISOString().split("T")[0];

        await supabase.from("revenue_metrics").upsert({
          store_id,
          date: today,
          revenue: revenue,
          orders_count: 1,
        }, {
          onConflict: "store_id,date",
        });
      }

      return new Response(JSON.stringify({ success: true, webhook }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "analyze") {
      const analysis = await analyzeTrafficPatterns();

      return new Response(JSON.stringify({ success: true, analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "optimize") {
      const analysis = await analyzeTrafficPatterns();
      const recommendations = await optimizeTraffic(analysis);

      await supabase.from("ai_decisions").insert({
        decision_type: "traffic_optimization",
        input_data: analysis,
        output_action: recommendations,
        reasoning: "AI-driven traffic optimization for 300% growth",
        confidence_score: 0.85,
        executed: false,
      });

      return new Response(JSON.stringify({
        success: true,
        analysis,
        recommendations
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "daily_report") {
      const analysis = await analyzeTrafficPatterns();

      const previousDay = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

      const { data: previousTraffic } = await supabase
        .from("traffic_webhooks")
        .select("*")
        .gte("created_at", twoDaysAgo)
        .lt("created_at", previousDay);

      const previousTotal = previousTraffic?.length || 1;
      const currentTotal = analysis?.total_events || 0;
      const growthRate = ((currentTotal - previousTotal) / previousTotal) * 100;

      return new Response(JSON.stringify({
        success: true,
        analysis,
        growth_rate: growthRate.toFixed(2),
        target_300_percent: growthRate >= 300 ? "ACHIEVED!" : `${(300 - growthRate).toFixed(2)}% to go`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    if (error instanceof Response) return error;
    logStep("Error", { message: (error as Error).message });
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});