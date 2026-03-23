import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// xAI endpoints
const XAI_RESPONSES_URL = "https://api.x.ai/v1/responses";
const XAI_CHAT_URL = "https://api.x.ai/v1/chat/completions";
// All AI routed through xAI — zero external credit dependency

// Grok 4.1 Fast models
const GROK_REASONING = "grok-4-1-fast-reasoning";
const GROK_NON_REASONING = "grok-4-1-fast-non-reasoning";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function requireAdminUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await authClient.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !userId) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: isAdmin, error: roleError } = await adminClient.rpc("is_admin", { _user_id: userId });
  if (roleError || !isAdmin) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return { userId, adminClient };
}

interface BusinessMetrics {
  totalRevenue: number;
  totalProducts: number;
  totalOrders: number;
  avgOrderValue: number;
  totalStripeRevenue: number;
  totalOrderRevenue: number;
  conversions24h: number;
  trafficEvents24h: number;
  topSources: Array<{ source: string; events: number; revenue: number }>;
  activeCampaigns: number;
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
  },
  {
    type: "function" as const,
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
  },
  {
    type: "function" as const,
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
  },
  {
    type: "function" as const,
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
  },
  {
    type: "function" as const,
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
];

// ═══════════════════════════════════════════════════════════════
// Business Metrics Gathering
// ═══════════════════════════════════════════════════════════════
async function gatherBusinessMetrics(supabase: any): Promise<BusinessMetrics> {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    revenueResult,
    productsResult,
    decisionsResult,
    marketsResult,
    agentsResult,
    ordersResult,
    stripeResult,
    trafficResult,
    campaignsResult
  ] = await Promise.all([
    supabase.from("revenue_metrics").select("*").order("date", { ascending: false }).limit(30),
    supabase.from("products").select("*").eq("status", "active"),
    supabase.from("ai_decisions").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("global_markets").select("*").eq("is_active", true),
    supabase.from("agent_brains").select("*").eq("is_active", true),
    supabase.from("orders").select("id,total_amount,created_at,status").order("created_at", { ascending: false }).limit(500),
    supabase.from("stripe_transactions").select("amount,status,created_at").order("created_at", { ascending: false }).limit(500),
    supabase.from("traffic_webhooks").select("source,revenue,webhook_type,created_at").gte("created_at", since24h).limit(1000),
    supabase.from("marketing_campaigns").select("id,status")
  ]);

  const revenue = revenueResult.data || [];
  const products = productsResult.data || [];
  const decisions = decisionsResult.data || [];
  const markets = marketsResult.data || [];
  const agents = agentsResult.data || [];
  const orders = ordersResult.data || [];
  const stripe = stripeResult.data || [];
  const traffic = trafficResult.data || [];
  const campaigns = campaignsResult.data || [];

  const revenueFromMetrics = revenue.reduce((sum: number, r: any) => sum + Number(r.revenue || 0), 0);
  const totalOrderRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);
  const totalStripeRevenue = stripe
    .filter((t: any) => t.status === "succeeded")
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

  const totalRevenue = Math.max(revenueFromMetrics, totalOrderRevenue, totalStripeRevenue);
  const totalOrders = orders.length || revenue.reduce((sum: number, r: any) => sum + (r.orders_count || 0), 0);

  const sourceAgg = (traffic || []).reduce((acc: Record<string, { source: string; events: number; revenue: number }>, event: any) => {
    const key = event.source || "unknown";
    if (!acc[key]) acc[key] = { source: key, events: 0, revenue: 0 };
    acc[key].events += 1;
    acc[key].revenue += Number(event.revenue || 0);
    return acc;
  }, {});

  return {
    totalRevenue,
    totalProducts: products.length,
    totalOrders,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    totalStripeRevenue,
    totalOrderRevenue,
    conversions24h: traffic.filter((t: any) => ["purchase", "conversion"].includes(t.webhook_type)).length,
    trafficEvents24h: traffic.length,
    topSources: Object.values(sourceAgg).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    activeCampaigns: campaigns.filter((c: any) => c.status === "active").length,
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
  if (!XAI_API_KEY) throw new Error("XAI_API_KEY not configured — no external AI credits needed, just your own key.");

  const model = mode === "reasoning" ? GROK_REASONING : GROK_NON_REASONING;
  const response = await fetch(XAI_CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${XAI_API_KEY}` },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: false }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`xAI Chat failed [${response.status}]: ${errText}`);
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

async function invokeEdgeFunction(
  supabaseUrl: string,
  serviceRoleKey: string,
  functionName: string,
  payload: Record<string, any>
) {
  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceRoleKey}`,
      "apikey": serviceRoleKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, error: data?.error || `${functionName} ${response.status}`, data };
  }

  return { success: true, data };
}

async function invokeAutonomousBrain(supabaseUrl: string, serviceRoleKey: string, payload: Record<string, any>) {
  return invokeEdgeFunction(supabaseUrl, serviceRoleKey, "autonomous-brain", payload);
}

async function getCommandProducts(supabase: any) {
  const { data: products } = await supabase
    .from("products")
    .select("title, description, price")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(5);

  return (products || []).map((product: any) => ({
    title: product.title,
    description: product.description || "",
    price: String(product.price ?? 0),
    handle: product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  }));
}

async function runMarketingCommand(
  supabase: any,
  supabaseUrl: string,
  serviceRoleKey: string,
  command: string,
  metrics: BusinessMetrics
) {
  const normalized = command.toLowerCase();
  const products = await getCommandProducts(supabase);
  const actions: Array<Promise<any>> = [];
  const actionLabels: string[] = [];

  if (
    normalized.includes("market") ||
    normalized.includes("campaign") ||
    normalized.includes("blitz") ||
    normalized.includes("launch") ||
    normalized.includes("social")
  ) {
    if (products.length) {
      actions.push(invokeEdgeFunction(supabaseUrl, serviceRoleKey, "marketing-blitz", {
        action: products.length > 1 ? "blitz_all" : "single",
        products,
        product: products[0],
        mode: "local",
      }));
      actionLabels.push("marketing_blitz");
    }
  }

  if (
    normalized.includes("content") ||
    normalized.includes("creative") ||
    normalized.includes("video") ||
    normalized.includes("youtube")
  ) {
    if (products.length) {
      actions.push(invokeEdgeFunction(supabaseUrl, serviceRoleKey, "content-factory", {
        action: products.length > 1 ? "start_batch" : "start_single",
        products,
        product: products[0],
      }));
      actionLabels.push("content_factory");
    }
  }

  if (normalized.includes("traffic") || normalized.includes("optimize") || normalized.includes("funnel")) {
    actions.push(invokeEdgeFunction(supabaseUrl, serviceRoleKey, "traffic-webhook", { action: "optimize" }));
    actionLabels.push("traffic_optimization");
  }

  if (normalized.includes("analytics") || normalized.includes("track") || normalized.includes("measure")) {
    actions.push(invokeEdgeFunction(supabaseUrl, serviceRoleKey, "track-analytics", {
      event_type: "user_action",
      event_name: "ceo_marketing_command",
      event_data: {
        command,
        triggered_actions: actionLabels,
        metrics_snapshot: {
          totalRevenue: metrics.totalRevenue,
          totalOrders: metrics.totalOrders,
          trafficEvents24h: metrics.trafficEvents24h,
          conversions24h: metrics.conversions24h,
        },
      },
      page_url: "backend://ceo-brain-command",
      referrer: "backend://ceo-brain",
      session_id: `ceo-brain-${Date.now()}`,
    }));
    actionLabels.push("analytics_tracking");
  }

  if (normalized.includes("milestone") || normalized.includes("announce") || normalized.includes("discord") || normalized.includes("twitter")) {
    actions.push(invokeEdgeFunction(supabaseUrl, serviceRoleKey, "social-milestone-post", { action: "check_milestone" }));
    actionLabels.push("social_milestone_post");
  }

  if (normalized.includes("deploy all") || normalized.includes("swarm") || normalized.includes("agents") || normalized.includes("team")) {
    actions.push(invokeAutonomousBrain(supabaseUrl, serviceRoleKey, { action: "deploy_all" }));
    actionLabels.push("autonomous_deploy_all");
  }

  if (!actions.length) {
    return null;
  }

  const settled = await Promise.allSettled(actions);
  const results = settled.map((result, index) =>
    result.status === "fulfilled"
      ? { action: actionLabels[index], ...result.value }
      : { action: actionLabels[index], success: false, error: String(result.reason) }
  );

  const successfulActions = results.filter((item) => item.success).length;
  const status = successfulActions === results.length ? "completed" : successfulActions > 0 ? "partial" : "error";

  const executionResult = {
    command,
    mode: "marketing_orchestration",
    products_considered: products.length,
    metrics_snapshot: {
      total_revenue: metrics.totalRevenue,
      total_orders: metrics.totalOrders,
      traffic_events_24h: metrics.trafficEvents24h,
      conversions_24h: metrics.conversions24h,
      active_campaigns: metrics.activeCampaigns,
    },
    results,
  };

  await supabase.from("ai_decisions").insert({
    decision_type: "marketing_command_execution",
    reasoning: "Executed typed marketing orchestration command across backend webhook functions",
    confidence_score: 0.91,
    executed: true,
    input_data: { command, routed_actions: actionLabels },
    output_action: {
      action: "run_marketing_orchestration",
      category: "MARKETING",
      priority: "urgent",
      expected_impact: "Triggers campaigns, content, analytics, traffic optimization, and swarm workflows"
    },
    execution_result: executionResult,
  });

  await supabase.from("agent_logs").insert({
    agent_name: "CEO Brain",
    agent_role: "Marketing Command",
    action: `Typed marketing command executed (${successfulActions}/${results.length} actions succeeded)`,
    status,
    details: executionResult,
    error_message: status === "error" ? "All marketing orchestration actions failed" : null,
  });

  return executionResult;
}

async function runSalesWorkflow(supabase: any, supabaseUrl: string, serviceRoleKey: string, command: string) {
  const metrics = await gatherBusinessMetrics(supabase);

  const { data: activeAgents } = await supabase
    .from("agent_brains")
    .select("id, agent_name, agent_role, agent_type, performance_score, revenue_generated, tasks_completed")
    .eq("is_active", true)
    .order("performance_score", { ascending: false })
    .limit(100);

  const { count: storeCount } = await supabase.from("stores").select("id", { count: "exact", head: true });
  const { count: productCount } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active");

  const salesRaceTitle = `Global Sales Race ${new Date().toISOString().slice(0, 19).replace("T", " ")}`;
  const { data: salesRace } = await supabase
    .from("sales_races")
    .insert({
      title: salesRaceTitle,
      command_text: command,
      target_amount: 1000,
      currency: "USD",
      status: "active",
      objective: "Sell all products, monetization surfaces, apps, and stores as fast as possible",
      started_at: new Date().toISOString(),
      connected_store_count: storeCount || 0,
      connected_product_count: productCount || 0,
      metadata: {
        source: "ceo_brain",
        mode: "hundred_agent_race",
        requested_agents: 100,
        live_metrics: {
          totalRevenue: metrics.totalRevenue,
          totalOrders: metrics.totalOrders,
          totalProducts: metrics.totalProducts,
          totalStripeRevenue: metrics.totalStripeRevenue,
        },
      },
    })
    .select("id, title, target_amount")
    .single();

  const raceAgents = (activeAgents || []).slice(0, 100).map((agent: any, index: number) => ({
    sales_race_id: salesRace.id,
    agent_brain_id: agent.id,
    agent_name: agent.agent_name,
    agent_role: agent.agent_role,
    agent_type: agent.agent_type,
    lane_number: index + 1,
    status: "selling",
    target_amount: 1000,
    revenue_generated: Number(agent.revenue_generated || 0),
    orders_count: Math.max(0, Math.floor(Number(agent.tasks_completed || 0) / 3)),
    conversion_rate: Math.min(100, Number(agent.performance_score || 0)),
    avg_order_value: Number(metrics.avgOrderValue || 0),
    outreach_count: Number(agent.tasks_completed || 0),
    campaigns_launched: 0,
    products_pitched: productCount || 0,
    last_action_at: new Date().toISOString(),
    metadata: {
      seeded_from_agent_brain: true,
      baseline_performance: agent.performance_score || 0,
    },
  }));

  if (raceAgents.length) {
    // Insert agents in smaller batches to avoid trigger overhead
    const BATCH_SIZE = 10;
    let insertedCount = 0;
    for (let i = 0; i < raceAgents.length; i += BATCH_SIZE) {
      const batch = raceAgents.slice(i, i + BATCH_SIZE);
      const { error: insertErr } = await supabase.from("sales_race_agents").insert(batch);
      if (insertErr) {
        console.error(`[CEO Brain] Agent batch ${i}-${i + batch.length} insert error:`, insertErr.message);
      } else {
        insertedCount += batch.length;
      }
    }
    console.log(`[CEO Brain] Enrolled ${insertedCount}/${raceAgents.length} agents into sales race`);

    const { error: eventsErr } = await supabase.from("sales_race_events").insert(
      raceAgents.slice(0, 12).map((agent: any, index: number) => ({
        sales_race_id: salesRace.id,
        agent_brain_id: agent.agent_brain_id,
        event_type: "agent_deployed",
        event_label: `${agent.agent_name} entered lane ${agent.lane_number}`,
        status: "success",
        details: {
          rank_seed: index + 1,
          products_targeted: productCount || 0,
          command,
        },
      }))
    );
    if (eventsErr) console.error("[CEO Brain] Events insert error:", eventsErr.message);
  }

  const { data: existingCampaigns } = await supabase
    .from("marketing_campaigns")
    .select("id")
    .eq("status", "active")
    .limit(1);

  const campaignResults: any[] = [];
  if (!existingCampaigns?.length) {
    const channels = ["tiktok", "instagram", "email"];
    for (const channel of channels) {
      const { data: campaign } = await supabase
        .from("marketing_campaigns")
        .insert({
          campaign_name: `Auto ${channel} sales push ${new Date().toISOString().slice(0, 10)}`,
          channel,
          status: "active",
          budget: 150,
          ai_generated_content: {
            source: "ceo_command",
            command,
            objective: "drive immediate product checkout traffic",
            sales_race_id: salesRace.id,
          }
        })
        .select("id,campaign_name,channel")
        .single();

      if (campaign) campaignResults.push(campaign);
    }
  }

  if (campaignResults.length) {
    await supabase.from("sales_race_events").insert(
      campaignResults.map((campaign: any) => ({
        sales_race_id: salesRace.id,
        event_type: "campaign_launched",
        event_label: `${campaign.channel} campaign launched`,
        status: "success",
        details: campaign,
      }))
    );
  }

  const [deployRes, marketingRes] = await Promise.all([
    invokeAutonomousBrain(supabaseUrl, serviceRoleKey, { action: "deploy_all" }),
    runMarketingCommand(supabase, supabaseUrl, serviceRoleKey, `${command} marketing blitz traffic analytics`, metrics),
  ]);

  await supabase.rpc("refresh_sales_race_leaderboard", { _sales_race_id: salesRace.id });

  const executionResult = {
    command,
    sales_race_id: salesRace.id,
    sales_race_title: salesRace.title,
    agents_enrolled: raceAgents.length,
    metrics_snapshot: {
      total_revenue: metrics.totalRevenue,
      total_orders: metrics.totalOrders,
      traffic_events_24h: metrics.trafficEvents24h,
      conversions_24h: metrics.conversions24h,
      active_campaigns: metrics.activeCampaigns,
      total_stripe_revenue: metrics.totalStripeRevenue,
    },
    campaigns_created: campaignResults.length,
    campaign_details: campaignResults,
    marketing_orchestration: marketingRes,
    deployment: deployRes,
  };

  await supabase.from("ai_decisions").insert({
    decision_type: "sales_command_execution",
    reasoning: "Executed SELL NOW command with live 100-agent sales race, campaign orchestration, and deployment workflow",
    confidence_score: 0.96,
    executed: true,
    input_data: { command, sales_race_id: salesRace.id, agents_enrolled: raceAgents.length },
    output_action: {
      action: "run_sales_race_workflow",
      category: "AGENT_DEPLOYMENT",
      priority: "urgent",
      expected_impact: "Activates 100-agent monetization race across stores, apps, and products"
    },
    execution_result: executionResult,
  });

  await supabase.from("agent_logs").insert({
    agent_name: "CEO Brain",
    agent_role: "Sales Command",
    action: `SELL NOW workflow triggered (${raceAgents.length} agents, ${campaignResults.length} campaigns)`,
    status: deployRes.success ? "completed" : "error",
    details: executionResult,
    error_message: deployRes.success ? null : deployRes.error,
  });

  await supabase.from("sales_race_events").insert({
    sales_race_id: salesRace.id,
    event_type: "command_completed",
    event_label: "CEO Brain launched live sell race",
    status: deployRes.success ? "success" : "warning",
    details: executionResult,
  });

  return executionResult;
}

// ═══════════════════════════════════════════════════════════════
// Main Server
// ═══════════════════════════════════════════════════════════════
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { adminClient: supabase } = await requireAdminUser(req);

    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const focusArea = typeof body.focusArea === "string" ? body.focusArea.slice(0, 500) : undefined;

    const validActions = [
      "think", "think_fast", "quick_ops", "get_state", "execute_decision",
      "autonomous_loop", "research", "research_x", "full_intelligence", "command", "sales_run"
    ];
    if (action && !validActions.includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const metrics = ["get_state", "execute_decision", "quick_ops"].includes(action) ? null : await gatherBusinessMetrics(supabase);

    const metricsPrompt = metrics ? `
## Current Business State:
- Revenue (best live source): $${metrics.totalRevenue.toLocaleString()}
- Stripe Revenue: $${metrics.totalStripeRevenue.toLocaleString()} | Orders Revenue: $${metrics.totalOrderRevenue.toLocaleString()}
- Products: ${metrics.totalProducts} | Orders: ${metrics.totalOrders} | AOV: $${metrics.avgOrderValue.toFixed(2)}
- Traffic 24h: ${metrics.trafficEvents24h} events | Conversions 24h: ${metrics.conversions24h}
- Active Campaigns: ${metrics.activeCampaigns}
- Top Sources: ${JSON.stringify(metrics.topSources)}
- Top Products: ${JSON.stringify(metrics.topProducts)}
- Markets: ${JSON.stringify(metrics.marketData)}
- Agents: ${JSON.stringify(metrics.agentPerformance)}
${focusArea ? `\n### Focus: ${focusArea}` : ''}

Analyze and make 3-5 strategic decisions with immediate execution options.` : "";

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

      // ── Explicit command router for operational control ──
      case "command":
      case "sales_run": {
        const command = (body.command || body.focusArea || "").toString();
        const normalized = command.toLowerCase();

        if (!command.trim()) {
          return new Response(JSON.stringify({ error: "command is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (normalized.includes("sell now") || normalized.includes("run live sales") || normalized.includes("deploy all")) {
          const execution = await runSalesWorkflow(supabase, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, command);
          return new Response(JSON.stringify({
            success: true,
            mode: "sales_workflow",
            execution,
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (
          normalized.includes("traffic") ||
          normalized.includes("market") ||
          normalized.includes("campaign") ||
          normalized.includes("content") ||
          normalized.includes("social") ||
          normalized.includes("analytics") ||
          normalized.includes("track") ||
          normalized.includes("video") ||
          normalized.includes("swarm") ||
          normalized.includes("team")
        ) {
          const orchestration = await runMarketingCommand(supabase, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, command, metrics!);
          if (orchestration) {
            return new Response(JSON.stringify({ success: true, mode: "marketing_command", execution: orchestration }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }

        // Deterministic fallback (no model credits required)
        const quickDecisionPack = {
          thinking: "Rule-based command execution from live backend metrics",
          analysis: `Revenue $${metrics?.totalRevenue || 0}, orders ${metrics?.totalOrders || 0}, traffic24h ${metrics?.trafficEvents24h || 0}`,
          decisions: [
            {
              category: "OPTIMIZATION",
              action: "Prioritize top-traffic source into active campaigns",
              reasoning: "Highest immediate lift usually comes from channels already generating traffic.",
              priority: "high",
              expected_impact: "Improved conversion from existing visitors",
              confidence: 0.82,
              data_sources: ["internal_metrics"]
            },
            {
              category: "AGENT_DEPLOYMENT",
              action: "Deploy all active teams for coordinated lead->close workflow",
              reasoning: "Cross-role handoff execution increases throughput without waiting for manual ops.",
              priority: "high",
              expected_impact: "More decision cycles and campaign output per hour",
              confidence: 0.84,
              data_sources: ["internal_metrics"]
            }
          ],
          kpis_to_monitor: ["orders", "totalRevenue", "conversions24h"],
          next_thinking_cycle: "Re-run after next 50 traffic events"
        };

        await saveDecisions(supabase, quickDecisionPack, "deterministic_command");

        return new Response(JSON.stringify({
          success: true,
          mode: "strategic_command",
          thinking_cycle: quickDecisionPack,
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
