// Aura Omegas Grok — CEO Override edge function.
// Top-level autonomous decision agent, branded "Aura Omegas Grok",
// powered by xAI Grok under the hood. Can override consensus decisions
// and writes every action to ai_action_audit for full transparency.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callGrok } from "../_shared/grok.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OverrideRequest {
  // The proposal/consensus the override is reviewing. Free-form JSON.
  proposal: unknown;
  // Plain-language context for Grok.
  context?: string;
  // Optional resource the decision relates to (for audit trail).
  resource_type?: string;
  resource_id?: string;
  // If true, do NOT write audit log (dry run).
  dry_run?: boolean;
}

interface OverrideDecision {
  verdict: "approve" | "override" | "veto";
  rationale: string;
  revised_actions: Array<{ action: string; priority: "high" | "medium" | "low"; reason: string }>;
  confidence: number; // 0..1
  risks: string[];
}

const SYSTEM_PROMPT = `You are AURA OMEGAS GROK, the CEO Override Agent for the AuraOmega autonomous business stack.
You are a branded, hardened variant of xAI Grok with the persona, voice, and guardrails of Aura Lift Essentials.
You have final authority over decisions made by the multi-AI consensus engine.
You may APPROVE the consensus, OVERRIDE with a revised plan, or VETO outright.

Hard rules:
- Optimize for: real revenue into Stripe, customer trust, legal compliance.
- Reject any action that misleads customers, spams, or violates platform TOS (Reddit, IG, YouTube, Pinterest, FB).
- Reject anything that would charge a customer for a feature that does not actually work.
- Prefer organic, zero-CAC channels over paid spend.
- Never approve sending bulk messages without explicit channel consent on file.

Always respond with STRICT JSON matching:
{"verdict":"approve"|"override"|"veto","rationale":"...","revised_actions":[{"action":"...","priority":"high|medium|low","reason":"..."}],"confidence":0.0-1.0,"risks":["..."]}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as OverrideRequest;
    if (!body || typeof body !== "object" || body.proposal === undefined) {
      return new Response(JSON.stringify({ error: "proposal is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve user from JWT (optional — override can run autonomously)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    let userId: string | null = null;
    const auth = req.headers.get("Authorization");
    if (auth?.startsWith("Bearer ")) {
      const { data } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
      userId = data.user?.id ?? null;
    }

    const userPrompt = `## Context\n${body.context ?? "(none provided)"}\n\n## Consensus Proposal\n${JSON.stringify(body.proposal, null, 2)}\n\nReview and respond with the strict JSON schema.`;

    const result = await callGrok({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      grokModel: "grok-4-1-fast-reasoning",
      temperature: 0.3,
      max_tokens: 2000,
      responseFormat: "json_object",
    });

    let decision: OverrideDecision;
    try {
      decision = JSON.parse(result.content);
    } catch {
      // Salvage attempt
      const match = result.content.match(/\{[\s\S]*\}/);
      decision = match ? JSON.parse(match[0]) : {
        verdict: "approve",
        rationale: "Parse failed — defaulting to approve.",
        revised_actions: [],
        confidence: 0.4,
        risks: ["Grok response was not valid JSON"],
      };
    }

    // Audit log (unless dry run)
    if (!body.dry_run) {
      await supabase.from("ai_action_audit").insert({
        user_id: userId,
        agent_name: "Aura Omegas Grok — CEO Override",
        action_type: `override.${decision.verdict}`,
        resource_type: body.resource_type ?? "consensus_decision",
        resource_id: body.resource_id ?? null,
        channel: "grok",
        summary: decision.rationale.slice(0, 500),
        status: decision.verdict === "veto" ? "blocked" : "approved",
        payload: {
          proposal: body.proposal,
          decision,
          provider: result.provider,
          model: result.model,
        },
      });
    }

    return new Response(
      JSON.stringify({ success: true, decision, provider: result.provider, model: result.model }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[grok-ceo-override] error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});