import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type IntelligenceType = "research" | "competitor" | "trend" | "financial";
type IntelligenceMode = "local" | "external";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const XAI_BASE = "https://api.x.ai/v1";

function normalizeKeywords(query: string): string[] {
  return Array.from(
    new Set(
      query.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3)
    )
  ).slice(0, 10);
}

function pickFocus(type: IntelligenceType): string {
  if (type === "competitor") return "competitor positioning and offer gap";
  if (type === "trend") return "demand signals and short-window trends";
  if (type === "financial") return "unit economics and cash speed";
  return "market demand and conversion leverage";
}

function buildLocalIntelligence(query: string, type: IntelligenceType) {
  const keywords = normalizeKeywords(query);
  const focus = pickFocus(type);
  const topKeywords = keywords.length ? keywords.join(", ") : "high-intent buyers, conversion hooks, urgency offers";

  const content = [
    `Executive Brief (${type.toUpperCase()}):`,
    `Priority focus: ${focus}.`,
    "",
    "What the in-house engine sees:",
    `- Core signals detected: ${topKeywords}`,
    "- Fastest growth path is short-form acquisition + offer clarity + same-day follow-up.",
    "- Biggest leakage risk is weak hook-to-offer continuity across ad/post/click/cart.",
    "",
    "5-Day Revenue Sprint:",
    "Day 1: Ship 3 offer-led landing variants for top 3 SKUs and one no-friction checkout flow.",
    "Day 2: Publish 24 short-form creatives (8 per top SKU) with 3 hook angles each.",
    "Day 3: Retarget all clickers with proof-heavy creatives + urgency bundle offer.",
    "Day 4: Run DM/email recovery sequence for all cart and checkout abandoners.",
    "Day 5: Double spend/time on the top 20% creators/angles, kill losers aggressively.",
    "",
    "Execution rules:",
    "- Every creative must include one pain point, one proof point, one CTA.",
    "- Keep hook under 7 words and show product in first 2 seconds.",
    "- Push buyers to one product page per campaign, not full catalog browsing.",
  ].join("\n");

  return { content, citations: ["local://strategy-engine-v1", "local://playbook/5-day-revenue-sprint"], model: "local/strategy-engine-v1" };
}

async function buildXAIIntelligence(query: string, type: IntelligenceType) {
  const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
  if (!XAI_API_KEY) throw new Error("XAI_API_KEY not configured");

  const systemPrompts: Record<IntelligenceType, string> = {
    research: "You are a senior business intelligence analyst. Provide comprehensive, actionable market research with data-driven insights.",
    competitor: "You are a competitive intelligence expert. Analyze competitors, market positioning, and strategic advantages.",
    trend: "You are a trend forecasting specialist. Identify emerging patterns, predict market movements, and highlight innovation opportunities.",
    financial: "You are a financial analyst. Provide detailed financial analysis, valuation insights, and investment recommendations.",
  };

  const res = await fetch(`${XAI_BASE}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${XAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "grok-3-mini-fast",
      messages: [
        { role: "system", content: systemPrompts[type] },
        { role: "user", content: query },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`xAI error [${res.status}]: ${err}`);
  }

  const data = await res.json();
  return {
    content: data.choices?.[0]?.message?.content || "",
    citations: [],
    model: data.model || "grok-3-mini-fast",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query : "";
    const type: IntelligenceType = ["research", "competitor", "trend", "financial"].includes(body?.type) ? body.type : "research";
    const mode: IntelligenceMode = body?.mode === "external" ? "external" : "local";

    if (!query) return new Response(JSON.stringify({ error: "Query is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (query.length > 2000) return new Response(JSON.stringify({ error: "Query must be under 2000 characters" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    if (mode === "local") {
      return new Response(JSON.stringify(buildLocalIntelligence(query, type)), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await buildXAIIntelligence(query, type);
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    console.error("AI Intelligence Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
