// Grok CEO Console — owner-gated command bridge.
// Verifies JWT, checks super_admin role + owner email allowlist,
// calls Grok with strict-JSON schema output, logs to grok_ceo_audit,
// and can dispatch whitelisted RPC actions on the user's behalf.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callGrok } from "../_shared/grok.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OWNER_EMAILS = (Deno.env.get("STRIPE_OWNER_EMAILS") ?? "ryanauralift@gmail.com,thegrokfather@outlook.com")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

const SYSTEM_PROMPT = `You are AURA OMEGAS GROK — the personal CEO co-pilot for Ryan Puddy, sole owner of Aura Lift Essentials LLC.
You speak directly to the owner. Be terse, confident, surgical, and revenue-obsessed.
You will receive a free-form command (typed or transcribed from voice). Decide what to do.

Hard rules:
- The owner's word is law. Confirm understanding, then act or recommend.
- Optimize for: real Stripe revenue into the owner's accounts only.
- Reject anything illegal, deceptive, or that would route funds away from the owner.
- For multi-store routing, suggest which connected store should receive a product/traffic and why.

Always respond with STRICT JSON (no prose outside JSON) matching this schema:
{
  "spoken_reply": "short conversational reply to read aloud (<= 280 chars)",
  "intent": "status|launch|route|audit|refresh|generic",
  "summary": "one-line action summary",
  "actions": [{"action":"refresh_sales_race|ping|audit_recent|routing_pending|none","params":{},"why":"..."}],
  "routing_suggestions": [{"product":"...","store":"...","reasoning":"...","confidence":0.0}],
  "next_steps": ["..."],
  "confidence": 0.0
}`;

interface ReqBody {
  command: string;
  input_mode?: "text" | "voice";
  dispatch?: boolean; // if true, execute the first whitelisted action via RPC
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  // 1) Auth: verify JWT and resolve user
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return json({ error: "unauthenticated" }, 401);
  }

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return json({ error: "invalid session" }, 401);
  }
  const user = userData.user;
  const email = (user.email ?? "").toLowerCase();

  // 2) Owner email allowlist
  if (!OWNER_EMAILS.includes(email)) {
    return json({ error: "forbidden: owner only" }, 403);
  }

  // 3) super_admin role check via service role
  const svc = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: roleRows } = await svc
    .from("user_roles").select("role").eq("user_id", user.id);
  const isSuper = (roleRows ?? []).some((r: { role: string }) => r.role === "super_admin");
  if (!isSuper) {
    return json({ error: "forbidden: super_admin required" }, 403);
  }

  let body: ReqBody;
  try { body = await req.json(); }
  catch { return json({ error: "invalid json" }, 400); }

  const command = (body.command ?? "").toString().trim();
  if (!command || command.length > 4000) {
    return json({ error: "command must be 1..4000 chars" }, 400);
  }

  // 4) Call Grok with strict-JSON output
  let grokResult: Record<string, unknown> = {};
  let raw = "";
  try {
    const r = await callGrok({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: command },
      ],
      responseFormat: "json_object",
      temperature: 0.4,
      max_tokens: 1200,
    });
    raw = r.content;
    grokResult = JSON.parse(r.content);
    (grokResult as any)._provider = r.provider;
    (grokResult as any)._model = r.model;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await svc.from("grok_ceo_audit").insert({
      user_id: user.id, user_email: email,
      input_mode: body.input_mode ?? "text",
      command, status: "error", error: msg,
      grok_response: { raw },
    });
    return json({ error: "grok failed", detail: msg }, 502);
  }

  // 5) Optional dispatch of first whitelisted action via owner RPC
  let dispatched: unknown = null;
  if (body.dispatch && Array.isArray((grokResult as any).actions)) {
    const first = (grokResult as any).actions[0];
    const whitelist = new Set(["ping", "refresh_sales_race", "audit_recent", "routing_pending"]);
    if (first?.action && whitelist.has(first.action)) {
      const { data: rpcData, error: rpcErr } = await userClient.rpc("exec_owner_command", {
        _action: first.action,
        _params: first.params ?? {},
      });
      dispatched = rpcErr ? { error: rpcErr.message } : rpcData;
    }
  }

  // 6) Persist audit (write-once)
  const ipHash = await sha256(req.headers.get("x-forwarded-for") ?? "");
  await svc.from("grok_ceo_audit").insert({
    user_id: user.id,
    user_email: email,
    input_mode: body.input_mode ?? "text",
    command,
    parsed_intent: { intent: (grokResult as any).intent ?? null },
    grok_response: grokResult,
    routing_decision: dispatched as any,
    status: "ok",
    ip_hash: ipHash,
  });

  return json({ ok: true, grok: grokResult, dispatched });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}