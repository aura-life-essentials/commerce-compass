import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════════════════════════════
// Multi-AI Consensus Engine
// OpenAI (Master) + xAI Grok (CEO Mode) + Lovable AI (Gateway)
// All three AIs debate and converge on monetization decisions
// ═══════════════════════════════════════════════════════════════

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const XAI_CHAT_URL = "https://api.x.ai/v1/chat/completions";
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface AIVote {
  provider: string;
  model: string;
  decisions: any[];
  confidence: number;
  reasoning: string;
  latency_ms: number;
  error?: string;
}

interface ConsensusResult {
  consensus_decisions: any[];
  agreement_score: number;
  votes: AIVote[];
  master_verdict: string;
  engine: string;
}

const DECISION_PROMPT = `You are an autonomous revenue strategist for a global e-commerce empire. 
Analyze the business metrics and return EXACTLY this JSON format (no markdown, no code fences):
{
  "decisions": [
    {
      "category": "PRICING|MARKETING|EXPANSION|OPTIMIZATION|AGENT_DEPLOYMENT",
      "action": "Specific action",
      "reasoning": "Data-driven reasoning",
      "priority": "urgent|high|medium",
      "expected_roi": "projected $ impact",
      "confidence": 0.0-1.0
    }
  ],
  "overall_confidence": 0.0-1.0,
  "top_insight": "Single most important finding"
}`;

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await authClient.auth.getUser();
  if (error || !data?.user) throw new Error("Unauthorized");
  const { data: isAdmin } = await adminClient.rpc("is_admin", { _user_id: data.user.id });
  if (!isAdmin) throw new Error("Forbidden");
  return adminClient;
}

function parseJSON(content: string): any {
  try {
    const match = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? (match[1] || match[0]) : content);
  } catch {
    return { decisions: [], overall_confidence: 0, top_insight: content.slice(0, 200) };
  }
}

// ── Call OpenAI (Master Key) ──
async function callOpenAI(messages: any[]): Promise<AIVote> {
  const key = Deno.env.get("OPENAI_MASTER_API_KEY") || Deno.env.get("OPENAI_API_KEY");
  if (!key) return { provider: "openai", model: "unavailable", decisions: [], confidence: 0, reasoning: "No API key", latency_ms: 0, error: "OPENAI_MASTER_API_KEY not set" };

  const start = Date.now();
  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "gpt-4o", messages, temperature: 0.4, max_tokens: 3000 }),
    });
    const latency = Date.now() - start;
    if (!res.ok) {
      const err = await res.text();
      return { provider: "openai", model: "gpt-4o", decisions: [], confidence: 0, reasoning: `API error ${res.status}`, latency_ms: latency, error: err.slice(0, 200) };
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    const parsed = parseJSON(content);
    return {
      provider: "openai", model: "gpt-4o",
      decisions: parsed.decisions || [],
      confidence: parsed.overall_confidence || 0.7,
      reasoning: parsed.top_insight || content.slice(0, 300),
      latency_ms: latency,
    };
  } catch (e) {
    return { provider: "openai", model: "gpt-4o", decisions: [], confidence: 0, reasoning: String(e), latency_ms: Date.now() - start, error: String(e) };
  }
}

// ── Call xAI Grok (CEO Mode) ──
async function callGrok(messages: any[]): Promise<AIVote> {
  const key = Deno.env.get("XAI_API_KEY");
  if (!key) return { provider: "xai", model: "unavailable", decisions: [], confidence: 0, reasoning: "No XAI_API_KEY", latency_ms: 0, error: "XAI_API_KEY not set" };

  const start = Date.now();
  try {
    const res = await fetch(XAI_CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "grok-4-1-fast-non-reasoning", messages, temperature: 0.4, max_tokens: 3000 }),
    });
    const latency = Date.now() - start;
    if (!res.ok) {
      const err = await res.text();
      return { provider: "xai", model: "grok-4-1-fast", decisions: [], confidence: 0, reasoning: `API error ${res.status}`, latency_ms: latency, error: err.slice(0, 200) };
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    const parsed = parseJSON(content);
    return {
      provider: "xai", model: "grok-4-1-fast",
      decisions: parsed.decisions || [],
      confidence: parsed.overall_confidence || 0.7,
      reasoning: parsed.top_insight || content.slice(0, 300),
      latency_ms: latency,
    };
  } catch (e) {
    return { provider: "xai", model: "grok-4-1-fast", decisions: [], confidence: 0, reasoning: String(e), latency_ms: Date.now() - start, error: String(e) };
  }
}

// ── Call Lovable AI Gateway (Gemini) ──
async function callLovableAI(messages: any[]): Promise<AIVote> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return { provider: "lovable", model: "unavailable", decisions: [], confidence: 0, reasoning: "No LOVABLE_API_KEY", latency_ms: 0, error: "LOVABLE_API_KEY not set" };

  const start = Date.now();
  try {
    const res = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, temperature: 0.4, stream: false }),
    });
    const latency = Date.now() - start;
    if (!res.ok) {
      const err = await res.text();
      return { provider: "lovable", model: "gemini-2.5-flash", decisions: [], confidence: 0, reasoning: `API error ${res.status}`, latency_ms: latency, error: err.slice(0, 200) };
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    const parsed = parseJSON(content);
    return {
      provider: "lovable", model: "gemini-2.5-flash",
      decisions: parsed.decisions || [],
      confidence: parsed.overall_confidence || 0.7,
      reasoning: parsed.top_insight || content.slice(0, 300),
      latency_ms: latency,
    };
  } catch (e) {
    return { provider: "lovable", model: "gemini-2.5-flash", decisions: [], confidence: 0, reasoning: String(e), latency_ms: Date.now() - start, error: String(e) };
  }
}

// ── Merge votes into consensus using OpenAI as master arbiter ──
async function buildConsensus(votes: AIVote[], metricsPrompt: string): Promise<ConsensusResult> {
  const validVotes = votes.filter(v => v.decisions.length > 0);

  if (validVotes.length === 0) {
    return {
      consensus_decisions: [],
      agreement_score: 0,
      votes,
      master_verdict: "No AI providers returned valid decisions",
      engine: "consensus_failed",
    };
  }

  // If only one provider responded, use it directly
  if (validVotes.length === 1) {
    return {
      consensus_decisions: validVotes[0].decisions,
      agreement_score: validVotes[0].confidence,
      votes,
      master_verdict: `Single-provider mode: ${validVotes[0].provider}`,
      engine: `single_${validVotes[0].provider}`,
    };
  }

  // Use OpenAI master to arbitrate between competing decisions
  const key = Deno.env.get("OPENAI_MASTER_API_KEY") || Deno.env.get("OPENAI_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
  if (!key) {
    // Fallback: merge by highest confidence
    const allDecisions = validVotes.flatMap(v => v.decisions.map(d => ({ ...d, _source: v.provider, _confidence: v.confidence })));
    const deduped = allDecisions.sort((a, b) => (b.confidence || 0) - (a.confidence || 0)).slice(0, 5);
    return {
      consensus_decisions: deduped,
      agreement_score: validVotes.reduce((s, v) => s + v.confidence, 0) / validVotes.length,
      votes,
      master_verdict: "Confidence-ranked merge (no arbiter key)",
      engine: "confidence_merge",
    };
  }

  const arbiterMessages = [
    {
      role: "system",
      content: `You are the MASTER ARBITER of a multi-AI decision council. Three AI strategists have independently analyzed business data and proposed decisions. Your job:
1. Identify areas of AGREEMENT (high-conviction moves)
2. Resolve CONFLICTS by choosing the stronger data-backed argument
3. Synthesize a final action plan that captures the best insights from all three
Return JSON only (no markdown): { "consensus_decisions": [...], "agreement_score": 0.0-1.0, "verdict": "summary" }`
    },
    {
      role: "user",
      content: `${metricsPrompt}

## AI Council Votes:
${validVotes.map(v => `### ${v.provider.toUpperCase()} (${v.model}, confidence: ${v.confidence})
${JSON.stringify(v.decisions, null, 2)}`).join("\n\n")}

Synthesize the final consensus. Prioritize revenue-generating actions.`
    }
  ];

  const isOpenAIKey = key.startsWith("sk-");
  const arbiterUrl = isOpenAIKey ? OPENAI_URL : LOVABLE_AI_URL;
  const arbiterModel = isOpenAIKey ? "gpt-4o" : "google/gemini-2.5-flash";

  try {
    const res = await fetch(arbiterUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: arbiterModel, messages: arbiterMessages, temperature: 0.3, max_tokens: 3000, stream: false }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      const parsed = parseJSON(content);
      return {
        consensus_decisions: parsed.consensus_decisions || parsed.decisions || [],
        agreement_score: parsed.agreement_score || 0.8,
        votes,
        master_verdict: parsed.verdict || parsed.top_insight || "Consensus reached",
        engine: `consensus_${isOpenAIKey ? "openai_master" : "lovable_arbiter"}`,
      };
    }
  } catch (e) {
    console.error("[Consensus] Arbiter error:", e);
  }

  // Final fallback
  const merged = validVotes.flatMap(v => v.decisions).slice(0, 5);
  return {
    consensus_decisions: merged,
    agreement_score: 0.6,
    votes,
    master_verdict: "Merged without arbitration",
    engine: "fallback_merge",
  };
}

// ── Gather metrics ──
async function gatherMetrics(supabase: any) {
  const [rev, prods, orders, stripe] = await Promise.all([
    supabase.from("revenue_metrics").select("revenue,orders_count").order("date", { ascending: false }).limit(30),
    supabase.from("products").select("id,title,price,category").eq("status", "active").limit(20),
    supabase.from("orders").select("total_amount,status").order("created_at", { ascending: false }).limit(100),
    supabase.from("stripe_transactions").select("amount,status").eq("status", "succeeded").limit(100),
  ]);

  const totalRev = (rev.data || []).reduce((s: number, r: any) => s + Number(r.revenue || 0), 0);
  const orderRev = (orders.data || []).reduce((s: number, o: any) => s + Number(o.total_amount || 0), 0);
  const stripeRev = (stripe.data || []).reduce((s: number, t: any) => s + Number(t.amount || 0), 0);

  return {
    revenue: Math.max(totalRev, orderRev, stripeRev),
    products: (prods.data || []).length,
    orders: (orders.data || []).length,
    topProducts: (prods.data || []).slice(0, 5),
    stripeRevenue: stripeRev,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const { action = "consensus", focusArea } = body;

    if (action === "consensus" || action === "decide") {
      const metrics = await gatherMetrics(supabase);
      const metricsPrompt = `Business State: Revenue $${metrics.revenue.toLocaleString()}, ${metrics.products} products, ${metrics.orders} orders, Stripe $${metrics.stripeRevenue.toLocaleString()}. Top products: ${JSON.stringify(metrics.topProducts.map((p: any) => p.title))}. ${focusArea ? `Focus: ${focusArea}` : ""}`;

      const messages = [
        { role: "system", content: DECISION_PROMPT },
        { role: "user", content: metricsPrompt },
      ];

      // Fire all three AIs in parallel
      console.log("[Consensus] Launching 3-way AI council...");
      const [openaiVote, grokVote, lovableVote] = await Promise.all([
        callOpenAI(messages),
        callGrok(messages),
        callLovableAI(messages),
      ]);

      console.log(`[Consensus] Votes: OpenAI(${openaiVote.decisions.length}d/${openaiVote.latency_ms}ms) Grok(${grokVote.decisions.length}d/${grokVote.latency_ms}ms) Lovable(${lovableVote.decisions.length}d/${lovableVote.latency_ms}ms)`);

      const consensus = await buildConsensus([openaiVote, grokVote, lovableVote], metricsPrompt);

      // Log the consensus decision
      await supabase.from("ai_decisions").insert({
        decision_type: "multi_ai_consensus",
        reasoning: consensus.master_verdict,
        confidence_score: consensus.agreement_score,
        executed: false,
        input_data: {
          providers: consensus.votes.map(v => ({ provider: v.provider, model: v.model, confidence: v.confidence, latency: v.latency_ms })),
          metrics_snapshot: metrics,
          focus: focusArea,
        },
        output_action: {
          action: "consensus_decision",
          category: "STRATEGIC",
          priority: "high",
          decisions: consensus.consensus_decisions,
        },
      });

      await supabase.from("agent_logs").insert({
        agent_name: "AI Consensus Council",
        agent_role: "Multi-AI Arbitration",
        action: `${consensus.engine}: ${consensus.consensus_decisions.length} decisions, agreement ${(consensus.agreement_score * 100).toFixed(0)}%`,
        status: "completed",
        details: {
          engine: consensus.engine,
          providers_responded: consensus.votes.filter(v => !v.error).length,
          total_latency_ms: consensus.votes.reduce((s, v) => s + v.latency_ms, 0),
        },
      });

      return new Response(JSON.stringify({ success: true, ...consensus }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "status") {
      const providers = [];
      if (Deno.env.get("OPENAI_MASTER_API_KEY") || Deno.env.get("OPENAI_API_KEY")) providers.push({ name: "OpenAI", role: "Master Arbiter", status: "active" });
      if (Deno.env.get("XAI_API_KEY")) providers.push({ name: "xAI Grok", role: "CEO Mode", status: "active" });
      if (Deno.env.get("LOVABLE_API_KEY")) providers.push({ name: "Lovable AI (Gemini)", role: "Gateway", status: "active" });

      return new Response(JSON.stringify({
        success: true,
        providers,
        total_engines: providers.length,
        consensus_mode: providers.length >= 2 ? "multi_ai" : "single_ai",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use 'consensus', 'decide', or 'status'" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "Unauthorized" || msg === "Forbidden") {
      return new Response(JSON.stringify({ error: msg }), {
        status: msg === "Unauthorized" ? 401 : 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("[Consensus] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
