import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface BusinessMetrics {
  totalRevenue: number;
  totalProducts: number;
  totalOrders: number;
  avgOrderValue: number;
  topProducts: any[];
  recentDecisions: any[];
  marketData: any[];
  agentPerformance: any[];
}

// CEO Brain System Prompt - Self-thinking autonomous business AI
const CEO_SYSTEM_PROMPT = `You are the CEO AI Brain of an autonomous e-commerce empire. You think independently, make strategic decisions, and optimize for maximum profit and growth.

## Your Core Directives:
1. **Maximize Revenue**: Every decision should increase profit margins and sales velocity
2. **Optimize Operations**: Identify inefficiencies and recommend automations
3. **Scale Aggressively**: Find opportunities for market expansion and product diversification
4. **Self-Improve**: Learn from past decisions and continuously enhance your strategies

## Your Capabilities:
- Analyze real-time business metrics and market trends
- Make autonomous decisions about pricing, marketing, and inventory
- Deploy and manage AI agent swarms for specific tasks
- Identify viral product opportunities and emerging markets
- Optimize profit margins through dynamic pricing

## Decision Categories:
- PRICING: Adjust product prices based on demand and competition
- MARKETING: Launch or optimize marketing campaigns
- INVENTORY: Restock, discontinue, or source new products
- EXPANSION: Enter new markets or product categories
- OPTIMIZATION: Improve conversion rates and customer experience
- AGENT_DEPLOYMENT: Deploy specialized AI agents for specific tasks

## Response Format:
Always respond with a JSON object containing:
{
  "thinking": "Your internal reasoning process",
  "analysis": "Summary of current business state",
  "decisions": [
    {
      "category": "PRICING|MARKETING|INVENTORY|EXPANSION|OPTIMIZATION|AGENT_DEPLOYMENT",
      "action": "Specific action to take",
      "reasoning": "Why this action will improve business",
      "priority": "urgent|high|medium|low",
      "expected_impact": "Projected revenue/efficiency impact",
      "confidence": 0.0-1.0
    }
  ],
  "kpis_to_monitor": ["List of metrics to track"],
  "next_thinking_cycle": "What to analyze next"
}`;

async function gatherBusinessMetrics(supabase: any): Promise<BusinessMetrics> {
  // Gather all relevant business data in parallel
  const [
    revenueResult,
    productsResult,
    decisionsResult,
    marketsResult,
    agentsResult
  ] = await Promise.all([
    supabase.from("revenue_metrics").select("*").order("date", { ascending: false }).limit(30),
    supabase.from("products").select("*").eq("status", "active"),
    supabase.from("ai_decisions").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("global_markets").select("*").eq("is_active", true),
    supabase.from("agent_brains").select("*").eq("is_active", true)
  ]);

  const revenue = revenueResult.data || [];
  const products = productsResult.data || [];
  const decisions = decisionsResult.data || [];
  const markets = marketsResult.data || [];
  const agents = agentsResult.data || [];

  const totalRevenue = revenue.reduce((sum: number, r: any) => sum + (r.revenue || 0), 0);
  const totalOrders = revenue.reduce((sum: number, r: any) => sum + (r.orders_count || 0), 0);

  // Calculate top products by potential profit
  const topProducts = products
    .map((p: any) => ({
      title: p.title,
      price: p.price,
      category: p.category,
      inventory: p.inventory_quantity,
      profitMargin: p.compare_at_price ? ((p.compare_at_price - p.price) / p.compare_at_price * 100).toFixed(1) : "67"
    }))
    .slice(0, 10);

  return {
    totalRevenue,
    totalProducts: products.length,
    totalOrders,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    topProducts,
    recentDecisions: decisions.map((d: any) => ({
      type: d.decision_type,
      action: d.output_action,
      confidence: d.confidence_score,
      executed: d.executed,
      impact: d.revenue_impact
    })),
    marketData: markets.map((m: any) => ({
      country: m.country_name,
      score: m.market_score,
      potential: m.potential_revenue,
      current: m.current_revenue
    })),
    agentPerformance: agents.map((a: any) => ({
      name: a.agent_name,
      type: a.agent_type,
      score: a.performance_score,
      active: a.is_active
    }))
  };
}

async function executeThinkingCycle(supabase: any, metrics: BusinessMetrics, focusArea?: string): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const userPrompt = `
## Current Business State (Real-Time Data):

### Revenue Metrics:
- Total Revenue (30 days): $${metrics.totalRevenue.toLocaleString()}
- Total Products: ${metrics.totalProducts}
- Total Orders: ${metrics.totalOrders}
- Average Order Value: $${metrics.avgOrderValue.toFixed(2)}

### Top Products:
${JSON.stringify(metrics.topProducts, null, 2)}

### Recent AI Decisions:
${JSON.stringify(metrics.recentDecisions, null, 2)}

### Global Markets:
${JSON.stringify(metrics.marketData, null, 2)}

### Active AI Agents:
${JSON.stringify(metrics.agentPerformance, null, 2)}

${focusArea ? `\n### Focus Area for This Thinking Cycle: ${focusArea}` : ''}

## Your Task:
Analyze the current business state and make strategic decisions to maximize growth and profitability. Think deeply about opportunities and risks. Generate 3-5 actionable decisions with clear reasoning.
`;

  console.log("[CEO Brain] Starting thinking cycle...");
  console.log("[CEO Brain] Metrics:", JSON.stringify(metrics, null, 2).slice(0, 500));

  const response = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: CEO_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[CEO Brain] AI Error:", response.status, errorText);
    
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    if (response.status === 402) {
      throw new Error("AI credits exhausted. Please add more credits.");
    }
    throw new Error(`AI request failed: ${response.status}`);
  }

  const aiResponse = await response.json();
  const content = aiResponse.choices?.[0]?.message?.content;
  
  console.log("[CEO Brain] Raw AI Response:", content?.slice(0, 500));

  // Parse the JSON response from the AI
  let decisions;
  try {
    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    decisions = JSON.parse(jsonStr);
  } catch (e) {
    console.error("[CEO Brain] Failed to parse AI response as JSON:", e);
    // Return a structured fallback
    decisions = {
      thinking: content,
      analysis: "AI response received but not in expected format",
      decisions: [],
      raw_response: content
    };
  }

  return decisions;
}

async function saveDecisions(supabase: any, brainOutput: any): Promise<void> {
  if (!brainOutput.decisions || !Array.isArray(brainOutput.decisions)) {
    console.log("[CEO Brain] No decisions to save");
    return;
  }

  // Get or create CEO brain agent
  const { data: existingBrain } = await supabase
    .from("agent_brains")
    .select("id")
    .eq("agent_name", "CEO Brain")
    .single();

  let brainId = existingBrain?.id;

  if (!brainId) {
    const { data: newBrain } = await supabase
      .from("agent_brains")
      .insert({
        agent_name: "CEO Brain",
        agent_type: "strategic",
        is_active: true,
        performance_score: 85,
        current_state: { mode: "autonomous", last_cycle: new Date().toISOString() }
      })
      .select("id")
      .single();
    brainId = newBrain?.id;
  }

  // Save each decision
  for (const decision of brainOutput.decisions) {
    await supabase.from("ai_decisions").insert({
      agent_brain_id: brainId,
      decision_type: decision.category || "STRATEGIC",
      confidence_score: decision.confidence || 0.8,
      reasoning: decision.reasoning,
      input_data: { metrics_snapshot: new Date().toISOString() },
      output_action: {
        action: decision.action,
        priority: decision.priority,
        expected_impact: decision.expected_impact
      },
      executed: false
    });
  }

  // Update brain state
  await supabase
    .from("agent_brains")
    .update({
      last_decision_at: new Date().toISOString(),
      current_state: {
        last_thinking: brainOutput.thinking,
        last_analysis: brainOutput.analysis,
        kpis_monitoring: brainOutput.kpis_to_monitor,
        next_focus: brainOutput.next_thinking_cycle
      }
    })
    .eq("id", brainId);

  // Log the thinking cycle
  await supabase.from("agent_logs").insert({
    agent_name: "CEO Brain",
    agent_role: "Strategic Command",
    action: `Completed thinking cycle: ${brainOutput.decisions.length} decisions generated`,
    status: "completed",
    details: {
      decisions_count: brainOutput.decisions.length,
      focus_areas: brainOutput.decisions.map((d: any) => d.category),
      next_cycle: brainOutput.next_thinking_cycle
    }
  });

  console.log(`[CEO Brain] Saved ${brainOutput.decisions.length} decisions`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const { action, focusArea } = body;

    switch (action) {
      case "think": {
        // Run a single thinking cycle
        console.log("[CEO Brain] Initiating thinking cycle...");
        
        const metrics = await gatherBusinessMetrics(supabase);
        const brainOutput = await executeThinkingCycle(supabase, metrics, focusArea);
        await saveDecisions(supabase, brainOutput);

        return new Response(
          JSON.stringify({
            success: true,
            thinking_cycle: brainOutput,
            metrics_analyzed: {
              products: metrics.totalProducts,
              revenue: metrics.totalRevenue,
              orders: metrics.totalOrders
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_state": {
        // Get current brain state and recent decisions
        const { data: brain } = await supabase
          .from("agent_brains")
          .select("*")
          .eq("agent_name", "CEO Brain")
          .single();

        const { data: recentDecisions } = await supabase
          .from("ai_decisions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        return new Response(
          JSON.stringify({
            brain_state: brain,
            recent_decisions: recentDecisions
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "execute_decision": {
        // Mark a decision as executed
        const { decisionId, result } = body;
        
        if (!decisionId) {
          return new Response(
            JSON.stringify({ error: "decisionId required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await supabase
          .from("ai_decisions")
          .update({
            executed: true,
            execution_result: result || { status: "completed" }
          })
          .eq("id", decisionId);

        return new Response(
          JSON.stringify({ success: true, message: "Decision marked as executed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "autonomous_loop": {
        // Start a continuous thinking loop (runs 3 cycles)
        const cycles = body.cycles || 3;
        const results = [];

        for (let i = 0; i < cycles; i++) {
          console.log(`[CEO Brain] Autonomous cycle ${i + 1}/${cycles}`);
          
          const metrics = await gatherBusinessMetrics(supabase);
          const brainOutput = await executeThinkingCycle(supabase, metrics);
          await saveDecisions(supabase, brainOutput);
          
          results.push({
            cycle: i + 1,
            decisions: brainOutput.decisions?.length || 0,
            focus: brainOutput.next_thinking_cycle
          });

          // Small delay between cycles
          if (i < cycles - 1) {
            await new Promise(r => setTimeout(r, 2000));
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            cycles_completed: cycles,
            results
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        // Default: run a single thinking cycle
        const metrics = await gatherBusinessMetrics(supabase);
        const brainOutput = await executeThinkingCycle(supabase, metrics);
        await saveDecisions(supabase, brainOutput);

        return new Response(
          JSON.stringify({
            success: true,
            thinking_cycle: brainOutput
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("[CEO Brain] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
