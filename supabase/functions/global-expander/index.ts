import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const logStep = (step: string, details?: unknown) => {
  console.log(`[GLOBAL-EXPANDER] ${step}`, details ? JSON.stringify(details) : "");
};

async function analyzeMarket(country: string, productCategory: string) {
  logStep("Analyzing market", { country, productCategory });

  // Use Perplexity for real-time market research
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        { 
          role: "user", 
          content: `Analyze the e-commerce market for ${productCategory} products in ${country}.
          
Provide:
1. Market size and growth rate
2. Key competitors and their market share
3. Consumer behavior and preferences
4. Pricing strategies that work
5. Popular sales channels (marketplaces, social commerce)
6. Regulatory considerations for foreign sellers
7. Recommended entry strategy
8. Estimated revenue potential for a new entrant`
        }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Market analysis failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    analysis: data.choices?.[0]?.message?.content || "",
    citations: data.citations || [],
  };
}

async function generateExpansionStrategy(markets: any[], currentPerformance: any) {
  logStep("Generating expansion strategy");

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
          content: `You are a global expansion strategist for e-commerce. 
          Your goal is to identify and prioritize markets for rapid international growth.
          Focus on maximizing revenue while managing risk.`
        },
        { 
          role: "user", 
          content: `Based on these markets and current performance, create a global expansion strategy:

Available Markets:
${JSON.stringify(markets, null, 2)}

Current Performance:
${JSON.stringify(currentPerformance, null, 2)}

Provide a prioritized expansion plan as JSON with:
- priority_markets: top 5 markets to enter first (with reasoning)
- market_entry_tactics: specific tactics for each market
- localization_requirements: what needs to be adapted
- timeline: phased expansion timeline
- expected_revenue: revenue projections by market
- risk_factors: potential challenges and mitigations
- success_metrics: KPIs to track`
        }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Strategy generation failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return { strategy: content };
    }
  }
  return { strategy: content };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, country, product_category } = await req.json();
    logStep("Request received", { action, country });

    if (action === "analyze_market") {
      if (!country) throw new Error("Country is required");
      
      const analysis = await analyzeMarket(country, product_category || "general");

      // Update market data
      await supabase.from("global_markets")
        .update({ 
          last_analyzed_at: new Date().toISOString(),
        })
        .eq("country_code", country);

      return new Response(JSON.stringify({ success: true, analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "expansion_strategy") {
      // Get all markets
      const { data: markets, error } = await supabase
        .from("global_markets")
        .select("*")
        .order("market_score", { ascending: false });

      if (error) throw error;

      // Get current revenue performance
      const { data: revenue } = await supabase
        .from("revenue_metrics")
        .select("*")
        .order("date", { ascending: false })
        .limit(30);

      const currentPerformance = {
        total_revenue: revenue?.reduce((sum, r) => sum + (r.revenue || 0), 0) || 0,
        total_orders: revenue?.reduce((sum, r) => sum + (r.orders_count || 0), 0) || 0,
        avg_order_value: revenue?.length ? 
          revenue.reduce((sum, r) => sum + (r.avg_order_value || 0), 0) / revenue.length : 0,
      };

      const strategy = await generateExpansionStrategy(markets, currentPerformance);

      // Log the expansion decision
      await supabase.from("ai_decisions").insert({
        decision_type: "global_expansion",
        input_data: { markets: markets?.length, performance: currentPerformance },
        output_action: strategy,
        reasoning: "AI-driven global market expansion strategy",
        confidence_score: 0.8,
        executed: false,
      });

      return new Response(JSON.stringify({ 
        success: true, 
        markets,
        current_performance: currentPerformance,
        strategy 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "activate_market") {
      if (!country) throw new Error("Country code is required");

      const { data: market, error } = await supabase
        .from("global_markets")
        .update({ is_active: true })
        .eq("country_code", country)
        .select()
        .single();

      if (error) throw error;

      // Create governance event for market activation
      await supabase.from("governance_events").insert({
        event_type: "market_activation",
        category: "expansion",
        severity: "info",
        description: `Activated market expansion in ${market.country_name}`,
        resolved: true,
      });

      return new Response(JSON.stringify({ success: true, market }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_markets") {
      const { data: markets, error } = await supabase
        .from("global_markets")
        .select("*")
        .order("market_score", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, markets }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    logStep("Error", { message: (error as Error).message });
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
