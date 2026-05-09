import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

const PLATFORMS = ["instagram", "youtube", "tiktok", "x", "linkedin"] as const;
type Platform = (typeof PLATFORMS)[number];

async function getAuthedUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data } = await client.auth.getUser(authHeader.slice(7));
  return data.user?.id ?? null;
}

async function callAI(prompt: string, system: string) {
  const { callGrok } = await import("../_shared/grok.ts");
  const result = await callGrok({
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    grokModel: "grok-4-1-fast-non-reasoning",
    fallbackModel: "google/gemini-2.5-flash",
    temperature: 0.6,
    responseFormat: "json_object",
  });
  const text = result.content || "{}";
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : {};
  }
}

/**
 * Generates a list of plausible influencer leads for the given niche/platform
 * using the AI. Real handles are surfaced when the model knows them; otherwise
 * the agent stores a "discovery handle" the user can replace with a real one.
 */
async function discoverInfluencers(
  niche: string,
  platforms: Platform[],
  count: number,
): Promise<
  Array<{
    handle: string;
    platform: Platform;
    display_name: string;
    follower_count: number;
    engagement_rate: number;
    niche: string;
    region: string;
    contact_url: string;
    notes: string;
  }>
> {
  const system = `You are an influencer discovery agent. Output ONLY valid JSON.
Schema: { "influencers": [ { "handle": string, "platform": string, "display_name": string, "follower_count": number, "engagement_rate": number, "niche": string, "region": string, "contact_url": string, "notes": string } ] }
Use only handles you are confident are real, otherwise leave the handle as "search:<keyword>" so the user knows to verify.
contact_url should be the public profile URL.`;
  const user = `Find ${count} relevant ${platforms.join(", ")} creators in the niche "${niche}" who would be a good organic partner for an AI sales automation SaaS targeting founders. Aim for mid-tier (10k-500k followers) where reply rates are highest.`;
  const result = await callAI(user, system);
  const list = Array.isArray(result.influencers) ? result.influencers : [];
  return list
    .filter((i: any) => i?.handle && platforms.includes(i.platform))
    .slice(0, count);
}

async function craftOutreach(
  influencer: { handle: string; platform: string; display_name: string; niche: string },
  app: { name: string; tagline: string; description: string },
  commission: number,
  affiliateUrl: string,
) {
  const system = `You are a partnerships manager. Output ONLY valid JSON: { "subject": string, "body": string }. The body must be 600-1100 chars, warm, specific, and mention their work. No hype. Offer ${(commission * 100).toFixed(0)}% recurring commission. End with the affiliate link.`;
  const user = `Influencer: ${influencer.display_name || influencer.handle} (${influencer.platform}, niche: ${influencer.niche || "general"}).
Product: ${app.name} — ${app.tagline}. ${app.description}
Affiliate URL: ${affiliateUrl}`;
  const result = await callAI(user, system);
  return {
    subject: result.subject ?? `Partnership idea for ${influencer.display_name || influencer.handle}`,
    body: result.body ?? `Hi ${influencer.display_name || influencer.handle}, would love to send you ${app.name}. ${affiliateUrl}`,
  };
}

function affiliateCode(handle: string): string {
  const slug = handle.replace(/[^a-z0-9]+/gi, "").slice(0, 18).toLowerCase() || "partner";
  return `${slug}-${crypto.randomUUID().slice(0, 6)}`;
}

const APPS: Record<string, { name: string; tagline: string; description: string }> = {
  core: { name: "AuraOmega Core", tagline: "Essential AI sales automation", description: "Lead Qualifier + Nurture Agent + analytics." },
  pro: { name: "AuraOmega Pro", tagline: "Full autonomous revenue system", description: "All 5 AI agents, unlimited leads." },
  "ceo-brain-starter": { name: "CEO Brain — Starter", tagline: "Empire OS for solo founders", description: "AI command center." },
  "ceo-brain-pro": { name: "CEO Brain — Pro", tagline: "Marketing engine + workflows", description: "Voice commands, decision engine." },
  "ceo-brain-godmode": { name: "CEO Brain — Godmode", tagline: "Unlimited AI", description: "Multi-AI consensus + dedicated infra." },
  "profit-reaper": { name: "Profit Reaper Engine", tagline: "Automated revenue optimization", description: "Pricing, churn, LTV." },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    const userId = await getAuthedUserId(req);
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const appId: string = body?.app_id ?? "pro";
    const niche: string = (body?.niche ?? "founders, indie hackers, AI builders").toString().slice(0, 200);
    const count: number = Math.max(1, Math.min(15, Number(body?.count ?? 8)));
    const commission: number = Math.max(0.05, Math.min(0.5, Number(body?.commission_rate ?? 0.2)));
    const platforms: Platform[] = Array.isArray(body?.platforms) && body.platforms.length
      ? body.platforms.filter((p: string) => (PLATFORMS as readonly string[]).includes(p))
      : [...PLATFORMS];
    const origin: string = body?.origin || "https://ceo-brain-orchestra.lovable.app";

    const app = APPS[appId];
    if (!app) throw new Error(`Unknown app_id: ${appId}`);

    // ---- Consent check: influencer outreach must be approved ----
    const { data: consent } = await admin
      .from("launch_consents")
      .select("enabled")
      .eq("user_id", userId)
      .eq("channel", "influencer")
      .maybeSingle();
    if (!consent?.enabled) {
      return new Response(
        JSON.stringify({
          error: "Influencer outreach is not approved. Enable the 'Influencer' channel first.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const discovered = await discoverInfluencers(niche, platforms, count);

    const created: any[] = [];
    for (const inf of discovered) {
      // Upsert influencer (unique on platform+handle)
      const { data: row, error: infErr } = await admin
        .from("influencers")
        .upsert(
          {
            handle: inf.handle,
            platform: inf.platform,
            display_name: inf.display_name,
            follower_count: inf.follower_count ?? 0,
            engagement_rate: inf.engagement_rate ?? 0,
            niche: inf.niche ?? niche,
            region: inf.region ?? null,
            contact_url: inf.contact_url ?? null,
            notes: inf.notes ?? null,
            source: "agent_discovery",
          },
          { onConflict: "platform,handle" },
        )
        .select()
        .single();
      if (infErr || !row) continue;

      const code = affiliateCode(inf.handle);
      const affiliateUrl = `${origin}/apps/${appId}?ref=${code}`;
      const message = await craftOutreach(row, app, commission, affiliateUrl);

      const { data: deal } = await admin
        .from("influencer_deals")
        .insert({
          user_id: userId,
          influencer_id: row.id,
          app_id: appId,
          status: "proposed",
          commission_rate: commission,
          outreach_message: `${message.subject}\n\n${message.body}`,
          affiliate_code: code,
          affiliate_url: affiliateUrl,
          contacted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (deal) {
        created.push(deal);
        await admin.from("ai_action_audit").insert({
          user_id: userId,
          agent_name: "Influencer Outreach Agent",
          action_type: "influencer_outreach_drafted",
          resource_type: "influencer_deal",
          resource_id: deal.id,
          channel: "influencer",
          summary: `Drafted outreach to ${row.display_name || row.handle} (${row.platform}) at ${(commission * 100).toFixed(0)}% commission`,
          payload: {
            influencer_id: row.id,
            handle: row.handle,
            platform: row.platform,
            affiliate_code: code,
          },
        });
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        discovered: discovered.length,
        created: created.length,
        deals: created,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});