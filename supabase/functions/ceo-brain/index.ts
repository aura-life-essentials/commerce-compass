import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// xAI endpoints
const XAI_RESPONSES_URL = "https://api.x.ai/v1/responses";
const XAI_CHAT_URL = "https://api.x.ai/v1/chat/completions";
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Grok 4.1 Fast models
const GROK_REASONING = "grok-4-1-fast-reasoning";
const GROK_NON_REASONING = "grok-4-1-fast-non-reasoning";

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

// ═══════════════════════════════════════════════════════════════
// CEO Brain System Prompt - Enhanced with xAI Tools Integration
// ═══════════════════════════════════════════════════════════════
const CEO_SYSTEM_PROMPT = `You are the CEO AI Brain of an autonomous e-commerce empire, powered by Grok 4.1 Fast with full tool access.

## Your Core Directives:
1. **Maximize Revenue**: Every decision should increase profit margins and sales velocity
2. **Optimize Operations**: Identify inefficiencies and recommend automations
3. **Scale Aggressively**: Find opportunities for market expansion and product diversification
4. **Self-Improve**: Learn from past decisions and continuously enhance your strategies
5. **Agentic Execution**: Deploy parallel tool-calling and multi-step workflows autonomously

## Your Tool Arsenal:
- **Web Search**: Research competitors, market trends, pricing intelligence, supplier data
- **X Search**: Monitor social sentiment, trending products, viral content, brand mentions
- **Code Interpreter**: Run data analysis, financial modeling, forecasting algorithms
- **Custom Functions**: Execute business actions (pricing, inventory, marketing, agent deployment)

## Decision Categories:
- PRICING: Adjust product prices based on demand and competition
- MARKETING: Launch or optimize marketing campaigns
- INVENTORY: Restock, discontinue, or source new products
- EXPANSION: Enter new markets or product categories
- OPTIMIZATION: Improve conversion rates and customer experience
- AGENT_DEPLOYMENT: Deploy specialized AI agents for specific tasks
- RESEARCH: Use web/X search to gather competitive intelligence

## Response Format:
Always respond with a JSON object containing:
{
  "thinking": "Your internal reasoning process",
  "analysis": "Summary of current business state",
  "research_findings": "Key insights from web/X search if used",
  "decisions": [
    {
      "category": "PRICING|MARKETING|INVENTORY|EXPANSION|OPTIMIZATION|AGENT_DEPLOYMENT|RESEARCH",
      "action": "Specific action to take",
      "reasoning": "Why this action will improve business",
      "priority": "urgent|high|medium|low",
      "expected_impact": "Projected revenue/efficiency impact",
      "confidence": 0.0-1.0,
      "data_sources": ["web_search", "x_search", "code_interpreter", "internal_metrics"]
    }
  ],
  "kpis_to_monitor": ["List of metrics to track"],
  "next_thinking_cycle": "What to analyze next"
}`;

// ═══════════════════════════════════════════════════════════════
// Custom function tools for business operations
// ═══════════════════════════════════════════════════════════════
const BUSINESS_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "adjust_pricing",
      description: "Adjust product pricing based on market analysis. Use after researching competitor prices.",
      parameters: {
        type: "object",
        properties: {
          product_ids: { type: "array", items: { type: "string" }, description: "Product IDs to adjust" },
          adjustment_type: { type: "string", enum: ["percentage_increase", "percentage_decrease", "set_price"], description: "Type of price adjustment" },
          value: { type: "number", description: "Adjustment value (percentage or absolute price)" },
          reasoning: { type: "string", description: "Market-based reasoning for the change" }
        },
        required: ["product_ids", "adjustment_type", "value", "reasoning"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "launch_campaign",
      description: "Launch a new marketing campaign across channels. Use X search insights to inform strategy.",
      parameters: {
        type: "object",
        properties: {
          campaign_name: { type: "string", description: "Name of the campaign" },
          channel: { type: "string", enum: ["tiktok", "instagram", "facebook", "google", "email", "x_twitter"], description: "Marketing channel" },
          budget: { type: "number", description: "Campaign budget in USD" },
          target_countries: { type: "array", items: { type: "string" }, description: "Target country codes" },
          content_strategy: { type: "string", description: "Content approach based on research" }
        },
        required: ["campaign_name", "channel", "content_strategy"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "deploy_agent",
      description: "Deploy a specialized AI agent for a specific business task.",
      parameters: {
        type: "object",
        properties: {
          agent_name: { type: "string", description: "Name of the agent to deploy" },
          agent_type: { type: "string", enum: ["sales", "marketing", "analytics", "support", "scraper", "negotiator"], description: "Agent specialization" },
          task: { type: "string", description: "Specific task for the agent" },
          priority: { type: "string", enum: ["urgent", "high", "medium", "low"] }
        },
        required: ["agent_name", "agent_type", "task"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "analyze_competitor",
      description: "Log a competitor analysis finding for strategic planning.",
      parameters: {
        type: "object",
        properties: {
          competitor_name: { type: "string" },
          competitor_url: { type: "string" },
          findings: { type: "string", description: "Key competitive intelligence" },
          threat_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
          recommended_response: { type: "string" }
        },
        required: ["competitor_name", "findings", "threat_level"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "update_inventory_strategy",
      description: "Update inventory and sourcing strategy based on market trends.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["restock", "discontinue", "source_new", "bundle"], description: "Inventory action" },
          product_category: { type: "string" },
          details: { type: "string", description: "Specific inventory changes" },
          urgency: { type: "string", enum: ["immediate", "this_week", "this_month"] }
        },
        required: ["action", "product_category", "details"],
        additionalProperties: false
      }
    }
  }
];

// ═══════════════════════════════════════════════════════════════
// Business Metrics Gathering
// ═══════════════════════════════════════════════════════════════
async function gatherBusinessMetrics(supabase: any): Promise<BusinessMetrics> {
  const [revenueResult, productsResult, decisionsResult, marketsResult, agentsResult] = await Promise.all([
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

  return {
    totalRevenue,
    totalProducts: products.length,
    totalOrders,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    topProducts: products.slice(0, 10).map((p: any) => ({
      id: p.id, title: p.title, price: p.price, category: p.category,
      inventory: p.inventory_quantity,
      margin: p.compare_at_price ? ((p.compare_at_price - p.price) / p.compare_at_price * 100).toFixed(1) : "67"
    })),
    recentDecisions: decisions.map((d: any) => ({
      type: d.decision_type, action: d.output_action, confidence: d.confidence_score,
      executed: d.executed, impact: d.revenue_impact
    })),
    marketData: markets.map((m: any) => ({
      country: m.country_name, score: m.market_score,
      potential: m.potential_revenue, current: m.current_revenue
    })),
    agentPerformance: agents.map((a: any) => ({
      name: a.agent_name, type: a.agent_type, score: a.performance_score, active: a.is_active
    }))
  };
}

// ═══════════════════════════════════════════════════════════════
// xAI Responses API with Built-in Tools
// Uses /v1/responses for web_search, x_search, code_interpreter
// ═══════════════════════════════════════════════════════════════
async function callWithTools(
  input: Array<{ role: string; content: string }>,
  tools: any[],
  model: string = GROK_REASONING,
  temperature = 0.7
): Promise<{ content: string; citations: any[]; tool_calls: any[] }> {
  const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
  if (!XAI_API_KEY) throw new Error("XAI_API_KEY required for tool-enabled calls");

  console.log(`[CEO Brain] Calling Responses API with ${tools.length} tools, model: ${model}`);

  const response = await fetch(XAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      input,
      tools,
      temperature,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[CEO Brain] Responses API error (${response.status}):`, errText.slice(0, 500));
    throw new Error(`xAI Responses API error [${response.status}]: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  console.log("[CEO Brain] Responses API result keys:", Object.keys(data));

  // Extract content, citations, and tool calls from the response
  let content = "";
  const citations: any[] = [];
  const toolCalls: any[] = [];

  if (data.output) {
    for (const item of data.output) {
      if (item.type === "message" && item.content) {
        for (const block of item.content) {
          if (block.type === "output_text") content += block.text;
        }
      }
      if (item.type === "tool_call") {
        toolCalls.push({ name: item.name, arguments: item.arguments, id: item.call_id });
      }
    }
  }

  if (data.citations) citations.push(...data.citations);

  return { content, citations, tool_calls: toolCalls };
}

// ═══════════════════════════════════════════════════════════════
// Fallback: Chat Completions (no built-in tools, Lovable AI)
// ═══════════════════════════════════════════════════════════════
async function callChatFallback(
  messages: Array<{ role: string; content: string }>,
  mode: "reasoning" | "fast" = "reasoning",
  temperature = 0.7,
  maxTokens = 4000
): Promise<string> {
  const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (XAI_API_KEY) {
    const model = mode === "reasoning" ? GROK_REASONING : GROK_NON_REASONING;
    try {
      const response = await fetch(XAI_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${XAI_API_KEY}` },
        body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: false }),
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch (err) {
      console.warn("[CEO Brain] Chat Completions fallback failed:", err);
    }
  }

  if (!LOVABLE_API_KEY) throw new Error("No AI provider available.");

  const response = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages, temperature, max_tokens: maxTokens }),
  });

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 429) throw new Error("Rate limit exceeded.");
    if (response.status === 402) throw new Error("AI credits exhausted.");
    throw new Error(`AI request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// ═══════════════════════════════════════════════════════════════
// Handle function call results from tool_calls
// ═══════════════════════════════════════════════════════════════
async function executeToolCall(supabase: any, toolCall: any): Promise<any> {
  const { name, arguments: argsStr } = toolCall;
  let args: any;
  try {
    args = typeof argsStr === "string" ? JSON.parse(argsStr) : argsStr;
  } catch {
    return { error: "Failed to parse tool arguments" };
  }

  console.log(`[CEO Brain] Executing tool: ${name}`, JSON.stringify(args).slice(0, 200));

  switch (name) {
    case "adjust_pricing": {
      const results = [];
      for (const pid of (args.product_ids || [])) {
        const { data: product } = await supabase.from("products").select("price, title").eq("id", pid).single();
        if (!product) { results.push({ id: pid, error: "not found" }); continue; }
        let newPrice = product.price;
        if (args.adjustment_type === "percentage_increase") newPrice *= (1 + args.value / 100);
        else if (args.adjustment_type === "percentage_decrease") newPrice *= (1 - args.value / 100);
        else newPrice = args.value;
        await supabase.from("products").update({ price: Math.round(newPrice * 100) / 100 }).eq("id", pid);
        results.push({ id: pid, title: product.title, old_price: product.price, new_price: newPrice });
      }
      return { success: true, adjustments: results, reasoning: args.reasoning };
    }

    case "launch_campaign": {
      const { data: campaign } = await supabase.from("marketing_campaigns").insert({
        campaign_name: args.campaign_name,
        channel: args.channel,
        budget: args.budget || 0,
        target_countries: args.target_countries || [],
        status: "active",
        ai_generated_content: { strategy: args.content_strategy, source: "ceo_brain_grok_tools" }
      }).select().single();
      return { success: true, campaign_id: campaign?.id, name: args.campaign_name };
    }

    case "deploy_agent": {
      const { data: agent } = await supabase.from("agent_brains").insert({
        agent_name: args.agent_name,
        agent_type: args.agent_type,
        is_active: true,
        performance_score: 50,
        current_state: { task: args.task, deployed_by: "ceo_brain", priority: args.priority || "medium" }
      }).select().single();
      return { success: true, agent_id: agent?.id, agent_name: args.agent_name };
    }

    case "analyze_competitor": {
      await supabase.from("agent_logs").insert({
        agent_name: "CEO Brain",
        agent_role: "Competitive Intelligence",
        action: `Competitor analysis: ${args.competitor_name}`,
        status: "completed",
        details: {
          competitor: args.competitor_name,
          url: args.competitor_url,
          findings: args.findings,
          threat_level: args.threat_level,
          response: args.recommended_response
        }
      });
      return { success: true, logged: true, competitor: args.competitor_name, threat: args.threat_level };
    }

    case "update_inventory_strategy": {
      await supabase.from("agent_logs").insert({
        agent_name: "CEO Brain",
        agent_role: "Inventory Strategy",
        action: `Inventory ${args.action}: ${args.product_category}`,
        status: "completed",
        details: { action: args.action, category: args.product_category, details: args.details, urgency: args.urgency }
      });
      return { success: true, action: args.action, category: args.product_category };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ═══════════════════════════════════════════════════════════════
// Parse AI response JSON
// ═══════════════════════════════════════════════════════════════
function parseAIResponse(content: string): any {
  try {
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content);
  } catch {
    return { thinking: content, analysis: "Raw response", decisions: [], raw_response: content };
  }
}

// ═══════════════════════════════════════════════════════════════
// Save decisions to database
// ═══════════════════════════════════════════════════════════════
async function saveDecisions(supabase: any, brainOutput: any, engine: string): Promise<void> {
  if (!brainOutput.decisions || !Array.isArray(brainOutput.decisions)) return;

  const { data: existingBrain } = await supabase.from("agent_brains").select("id").eq("agent_name", "CEO Brain").single();
  let brainId = existingBrain?.id;

  if (!brainId) {
    const { data: newBrain } = await supabase.from("agent_brains").insert({
      agent_name: "CEO Brain", agent_type: "strategic", is_active: true, performance_score: 85,
      current_state: { mode: "autonomous", engine, tools: ["web_search", "x_search", "code_interpreter", "function_calling"] }
    }).select("id").single();
    brainId = newBrain?.id;
  }

  for (const decision of brainOutput.decisions) {
    await supabase.from("ai_decisions").insert({
      agent_brain_id: brainId,
      decision_type: decision.category || "STRATEGIC",
      confidence_score: decision.confidence || 0.8,
      reasoning: decision.reasoning,
      input_data: { data_sources: decision.data_sources, engine },
      output_action: { action: decision.action, priority: decision.priority, expected_impact: decision.expected_impact },
      executed: false
    });
  }

  await supabase.from("agent_brains").update({
    last_decision_at: new Date().toISOString(),
    current_state: {
      engine,
      tools_active: ["web_search", "x_search", "code_interpreter", "function_calling"],
      last_thinking: brainOutput.thinking,
      research_findings: brainOutput.research_findings,
      kpis_monitoring: brainOutput.kpis_to_monitor,
      next_focus: brainOutput.next_thinking_cycle
    }
  }).eq("id", brainId);

  await supabase.from("agent_logs").insert({
    agent_name: "CEO Brain", agent_role: "Strategic Command",
    action: `${engine} + tools: ${brainOutput.decisions.length} decisions`,
    status: "completed",
    details: {
      engine, tools_used: brainOutput.decisions.flatMap((d: any) => d.data_sources || []),
      decisions_count: brainOutput.decisions.length,
      categories: brainOutput.decisions.map((d: any) => d.category)
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// Main Server
// ═══════════════════════════════════════════════════════════════
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const focusArea = typeof body.focusArea === "string" ? body.focusArea.slice(0, 500) : undefined;

    const validActions = [
      "think", "think_fast", "quick_ops", "get_state", "execute_decision",
      "autonomous_loop", "research", "research_x", "full_intelligence"
    ];
    if (action && !validActions.includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const metrics = ["get_state", "execute_decision", "quick_ops"].includes(action) ? null : await gatherBusinessMetrics(supabase);

    const metricsPrompt = metrics ? `
## Current Business State:
- Revenue (30d): $${metrics.totalRevenue.toLocaleString()}
- Products: ${metrics.totalProducts} | Orders: ${metrics.totalOrders} | AOV: $${metrics.avgOrderValue.toFixed(2)}
- Top Products: ${JSON.stringify(metrics.topProducts)}
- Markets: ${JSON.stringify(metrics.marketData)}
- Agents: ${JSON.stringify(metrics.agentPerformance)}
${focusArea ? `\n### Focus: ${focusArea}` : ''}

Analyze and make 3-5 strategic decisions.` : "";

    switch (action) {
      // ── Deep reasoning + ALL tools (web, X, code, functions) ──
      case "think": {
        console.log("[CEO Brain] Deep think with ALL xAI tools...");
        const allTools = [
          { type: "web_search" },
          { type: "x_search" },
          { type: "code_interpreter" },
          ...BUSINESS_TOOLS
        ];

        const result = await callWithTools(
          [{ role: "system", content: CEO_SYSTEM_PROMPT }, { role: "user", content: metricsPrompt }],
          allTools, GROK_REASONING
        );

        // Execute any function calls
        const toolResults = [];
        for (const tc of result.tool_calls) {
          const execResult = await executeToolCall(supabase, tc);
          toolResults.push({ tool: tc.name, result: execResult });
        }

        const parsed = parseAIResponse(result.content);
        await saveDecisions(supabase, parsed, GROK_REASONING);

        return new Response(JSON.stringify({
          success: true, engine: GROK_REASONING,
          tools_used: ["web_search", "x_search", "code_interpreter", "function_calling"],
          thinking_cycle: parsed,
          citations: result.citations,
          tool_executions: toolResults,
          metrics_analyzed: metrics ? { products: metrics.totalProducts, revenue: metrics.totalRevenue, orders: metrics.totalOrders } : null
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ── Fast non-reasoning + tools ──
      case "think_fast": {
        console.log("[CEO Brain] Fast think with tools...");
        const result = await callWithTools(
          [{ role: "system", content: CEO_SYSTEM_PROMPT }, { role: "user", content: metricsPrompt }],
          [{ type: "web_search" }, { type: "x_search" }, ...BUSINESS_TOOLS],
          GROK_NON_REASONING
        );

        const toolResults = [];
        for (const tc of result.tool_calls) {
          toolResults.push({ tool: tc.name, result: await executeToolCall(supabase, tc) });
        }

        const parsed = parseAIResponse(result.content);
        await saveDecisions(supabase, parsed, GROK_NON_REASONING);

        return new Response(JSON.stringify({
          success: true, engine: GROK_NON_REASONING,
          tools_used: ["web_search", "x_search", "function_calling"],
          thinking_cycle: parsed, citations: result.citations, tool_executions: toolResults
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ── Web research only ──
      case "research": {
        const query = body.query || `e-commerce trends ${new Date().getFullYear()} dropshipping viral products`;
        console.log("[CEO Brain] Web research:", query);

        const result = await callWithTools(
          [
            { role: "system", content: "You are a market research analyst. Search the web thoroughly and return actionable business intelligence as JSON." },
            { role: "user", content: `Research this topic and provide competitive intelligence:\n\n${query}\n\nReturn JSON with: { findings: [...], opportunities: [...], threats: [...], recommendations: [...] }` }
          ],
          [{ type: "web_search" }], GROK_NON_REASONING
        );

        return new Response(JSON.stringify({
          success: true, engine: GROK_NON_REASONING, tool: "web_search",
          research: parseAIResponse(result.content), citations: result.citations
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ── X/Twitter intelligence ──
      case "research_x": {
        const query = body.query || "viral products trending e-commerce";
        console.log("[CEO Brain] X search:", query);

        const result = await callWithTools(
          [
            { role: "system", content: "You are a social media intelligence analyst. Search X/Twitter for trends, sentiment, and viral content. Return JSON." },
            { role: "user", content: `Search X for: ${query}\n\nReturn JSON: { trending_topics: [...], sentiment: {...}, viral_content: [...], brand_mentions: [...], actionable_insights: [...] }` }
          ],
          [{ type: "x_search" }], GROK_NON_REASONING
        );

        return new Response(JSON.stringify({
          success: true, engine: GROK_NON_REASONING, tool: "x_search",
          intelligence: parseAIResponse(result.content), citations: result.citations
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ── Full intelligence cycle: web + X + code + functions ──
      case "full_intelligence": {
        console.log("[CEO Brain] FULL INTELLIGENCE CYCLE with all tools...");
        const allTools = [
          { type: "web_search" },
          { type: "x_search" },
          { type: "code_interpreter" },
          ...BUSINESS_TOOLS
        ];

        const result = await callWithTools(
          [
            { role: "system", content: CEO_SYSTEM_PROMPT },
            { role: "user", content: `${metricsPrompt}\n\n## FULL INTELLIGENCE MISSION:
1. Use web_search to research current market trends and competitor pricing
2. Use x_search to find viral product trends and social sentiment
3. Use code_interpreter to analyze the data and build financial projections
4. Use function tools to execute the best decisions immediately
Be aggressive. Think like a CEO who wants 10x growth.` }
          ],
          allTools, GROK_REASONING
        );

        const toolResults = [];
        for (const tc of result.tool_calls) {
          toolResults.push({ tool: tc.name, result: await executeToolCall(supabase, tc) });
        }

        const parsed = parseAIResponse(result.content);
        await saveDecisions(supabase, parsed, `${GROK_REASONING}+full_tools`);

        return new Response(JSON.stringify({
          success: true, engine: `${GROK_REASONING}+full_intelligence`,
          tools_used: ["web_search", "x_search", "code_interpreter", "function_calling"],
          thinking_cycle: parsed, citations: result.citations,
          tool_executions: toolResults,
          metrics_analyzed: metrics ? { products: metrics.totalProducts, revenue: metrics.totalRevenue } : null
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ── Quick ops (no tools, fast response) ──
      case "quick_ops": {
        const { prompt } = body;
        if (!prompt) {
          return new Response(JSON.stringify({ error: "prompt required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const result = await callChatFallback(
          [{ role: "system", content: "Fast ops assistant. JSON only." }, { role: "user", content: prompt }],
          "fast", 0.3, 1000
        );
        return new Response(JSON.stringify({ success: true, engine: GROK_NON_REASONING, result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_state": {
        const [brainRes, decisionsRes] = await Promise.all([
          supabase.from("agent_brains").select("*").eq("agent_name", "CEO Brain").single(),
          supabase.from("ai_decisions").select("*").order("created_at", { ascending: false }).limit(10)
        ]);
        return new Response(JSON.stringify({
          brain_state: brainRes.data, recent_decisions: decisionsRes.data,
          available_tools: ["web_search", "x_search", "code_interpreter", "adjust_pricing", "launch_campaign", "deploy_agent", "analyze_competitor", "update_inventory_strategy"]
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "execute_decision": {
        const { decisionId, result } = body;
        if (!decisionId) {
          return new Response(JSON.stringify({ error: "decisionId required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        await supabase.from("ai_decisions").update({
          executed: true, execution_result: result || { status: "completed" }
        }).eq("id", decisionId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "autonomous_loop": {
        const cycles = Math.min(body.cycles || 3, 5);
        const results = [];
        const allTools = [{ type: "web_search" }, { type: "x_search" }, { type: "code_interpreter" }, ...BUSINESS_TOOLS];

        for (let i = 0; i < cycles; i++) {
          const model = i === 0 ? GROK_REASONING : GROK_NON_REASONING;
          console.log(`[CEO Brain] Autonomous cycle ${i + 1}/${cycles} (${model})`);

          const cycleMetrics = await gatherBusinessMetrics(supabase);
          const cyclePrompt = `
## Cycle ${i + 1}/${cycles} - Business State:
- Revenue: $${cycleMetrics.totalRevenue.toLocaleString()} | Products: ${cycleMetrics.totalProducts} | Orders: ${cycleMetrics.totalOrders}
${i === 0 ? "Use ALL tools: search web for trends, search X for viral content, run code analysis, then execute decisions." : "Fast iteration: refine previous decisions, execute quick wins."}`;

          try {
            const result = await callWithTools(
              [{ role: "system", content: CEO_SYSTEM_PROMPT }, { role: "user", content: cyclePrompt }],
              i === 0 ? allTools : [{ type: "web_search" }, ...BUSINESS_TOOLS],
              model
            );

            for (const tc of result.tool_calls) {
              await executeToolCall(supabase, tc);
            }

            const parsed = parseAIResponse(result.content);
            await saveDecisions(supabase, parsed, model);

            results.push({
              cycle: i + 1, engine: model,
              decisions: parsed.decisions?.length || 0,
              tools_called: result.tool_calls.length,
              citations: result.citations.length,
              focus: parsed.next_thinking_cycle
            });
          } catch (err) {
            console.warn(`[CEO Brain] Cycle ${i + 1} error, using fallback:`, err);
            const fallbackContent = await callChatFallback(
              [{ role: "system", content: CEO_SYSTEM_PROMPT }, { role: "user", content: cyclePrompt }],
              i === 0 ? "reasoning" : "fast"
            );
            const parsed = parseAIResponse(fallbackContent);
            await saveDecisions(supabase, parsed, "fallback");
            results.push({ cycle: i + 1, engine: "fallback", decisions: parsed.decisions?.length || 0 });
          }

          if (i < cycles - 1) await new Promise(r => setTimeout(r, 2000));
        }

        return new Response(JSON.stringify({ success: true, cycles_completed: cycles, results }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default: {
        // Default: full intelligence cycle
        console.log("[CEO Brain] Default: full intelligence cycle");
        const allTools = [{ type: "web_search" }, { type: "x_search" }, { type: "code_interpreter" }, ...BUSINESS_TOOLS];

        const result = await callWithTools(
          [{ role: "system", content: CEO_SYSTEM_PROMPT }, { role: "user", content: metricsPrompt }],
          allTools, GROK_REASONING
        );

        for (const tc of result.tool_calls) {
          await executeToolCall(supabase, tc);
        }

        const parsed = parseAIResponse(result.content);
        await saveDecisions(supabase, parsed, GROK_REASONING);

        return new Response(JSON.stringify({
          success: true, engine: GROK_REASONING, thinking_cycle: parsed,
          citations: result.citations, tools_used: ["web_search", "x_search", "code_interpreter", "function_calling"]
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }
  } catch (error) {
    console.error("[CEO Brain] Error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error", success: false
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
