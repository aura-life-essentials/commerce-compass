import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const log = (msg: string, meta?: unknown) =>
  console.log(`[organic-launch] ${msg}`, meta ? JSON.stringify(meta) : "");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

/**
 * Every product the launcher knows about.
 * Must stay in sync with src/lib/appProducts.ts and src/lib/subscriptionTiers.ts.
 */
const KNOWN_APPS: Record<
  string,
  { name: string; tagline: string; description: string; priceId?: string; price: number }
> = {
  core: {
    name: "AuraOmega Core",
    tagline: "Essential AI sales automation",
    description:
      "Lead Qualifier + Nurture Agent + revenue analytics. The basics, automated.",
    priceId: "price_1TLtK0Fpvr5YnJS74uUhKJAU",
    price: 97,
  },
  pro: {
    name: "AuraOmega Pro",
    tagline: "Full autonomous revenue system",
    description:
      "All 5 AI agents — qualify, nurture, close, onboard, orchestrate. Unlimited leads.",
    priceId: "price_1TLtK2Fpvr5YnJS743sxV1Cj",
    price: 297,
  },
  "ceo-brain-starter": {
    name: "CEO Brain — Starter",
    tagline: "Empire OS for solo founders",
    description: "AI command center with workflows, KPIs and 3 connectors.",
    priceId: "price_1TPzQMFpvr5YnJS77Y1wgbzM",
    price: 49,
  },
  "ceo-brain-pro": {
    name: "CEO Brain — Pro",
    tagline: "Full marketing engine + workflows",
    description:
      "Unlimited workflows, voice commands, decision engine + memory.",
    priceId: "price_1TPzQMFpvr5YnJS7feiqMetX",
    price: 149,
  },
  "ceo-brain-godmode": {
    name: "CEO Brain — Godmode",
    tagline: "Unlimited AI, every connector",
    description:
      "Multi-AI consensus engine, dedicated infra, white-glove onboarding.",
    priceId: "price_1TPzQLFpvr5YnJS7DexY4Z8V",
    price: 499,
  },
  "profit-reaper": {
    name: "Profit Reaper Engine",
    tagline: "Automated revenue optimization",
    description:
      "Pricing experiments, churn prediction, LTV maximization — 24/7.",
    priceId: "price_1TPzQKFpvr5YnJS7wdOEY27A",
    price: 149,
  },
};

const PLATFORMS = [
  "reddit",
  "instagram",
  "youtube",
  "pinterest",
  "facebook",
  "x",
  "tiktok",
  "linkedin",
] as const;
type Platform = (typeof PLATFORMS)[number];

const PLATFORM_BRIEFS: Record<Platform, string> = {
  reddit:
    "A genuine, value-first Reddit text post. Conversational, no hype, problem→insight→soft mention. Title <300 chars. Body 600-1200 chars. Pick a relevant subreddit suggestion.",
  instagram:
    "An Instagram caption + 5-slide carousel idea. Hook in first line, scannable body, 8-12 hashtags.",
  youtube:
    "A YouTube Shorts script: 3-5 beats (≤60s total). Include hook line, body beats, CTA, 3 keyword tags.",
  pinterest:
    "A Pinterest pin: keyword-rich title + 200-char description, idea for vertical image.",
  facebook:
    "A Facebook post: warm, story-led 700-1100 chars, soft CTA at end.",
  x: "An X (Twitter) thread of 6-10 numbered tweets, each ≤280 chars. Hook tweet first.",
  tiktok:
    "A TikTok script: punchy 30-45s, beats labeled (HOOK / BODY / PROOF / CTA). 5-8 hashtags.",
  linkedin:
    "A LinkedIn post: 1100-1700 chars, professional, story+insight+lesson, 3 hashtags.",
};

async function callAI(prompt: string, system: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (res.status === 429)
    throw new Error("AI rate limit reached, please retry shortly");
  if (res.status === 402)
    throw new Error(
      "AI credits exhausted. Add credits in Lovable AI to keep launching.",
    );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI gateway ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("AI returned invalid JSON");
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function generatePlatformPost(
  app: { name: string; tagline: string; description: string; price: number },
  platform: Platform,
  targetUrl: string,
) {
  const system = `You are an elite organic marketing strategist. Output ONLY valid JSON, no prose. Schema:
{
  "title": string|null,
  "body": string,
  "hashtags": string[],
  "cta": string,
  "media_prompt": string,
  "extra": object
}
No emojis in keys. Keep copy authentic, no fake claims, no hype words like "guaranteed".`;

  const user = `Platform: ${platform}
Brief: ${PLATFORM_BRIEFS[platform]}

Product: ${app.name} — ${app.tagline}
Description: ${app.description}
Price: $${app.price}/mo with 3-day free trial
Stripe checkout URL (always include in CTA copy when natural): ${targetUrl}

Generate the post per the schema. media_prompt = a one-line image/video idea a creator could shoot.`;

  const result = await callAI(user, system);
  return {
    title: result.title ?? null,
    body: typeof result.body === "string" ? result.body : JSON.stringify(result),
    hashtags: Array.isArray(result.hashtags) ? result.hashtags.slice(0, 12) : [],
    cta: result.cta ?? "Start your free trial",
    media_prompt: result.media_prompt ?? "",
  };
}

async function generateSeoPage(
  app: { name: string; tagline: string; description: string; price: number },
  angle: string,
  targetUrl: string,
) {
  const system = `You are an SEO copywriter. Output ONLY valid JSON. Schema:
{
  "title": string,        // <60 chars, keyword-rich
  "meta_description": string, // <160 chars, action-oriented
  "headline": string,
  "subheadline": string,
  "body_md": string,      // markdown, 600-1100 words, H2/H3 structure
  "keywords": string[]
}`;

  const user = `Write a high-intent SEO landing page from this angle: "${angle}".
Product: ${app.name} — ${app.tagline}
Description: ${app.description}
CTA URL (link 2-3x in body_md): ${targetUrl}
CTA text: "Start free trial — $${app.price}/mo"

Be specific, no fluff, no fake stats. Include FAQ section at the end.`;

  const result = await callAI(user, system);
  return {
    title: (result.title ?? `${app.name} — ${angle}`).slice(0, 70),
    meta_description: (result.meta_description ?? app.description).slice(0, 170),
    headline: result.headline ?? app.name,
    subheadline: result.subheadline ?? app.tagline,
    body_md: result.body_md ?? `# ${app.name}\n\n${app.description}`,
    keywords: Array.isArray(result.keywords) ? result.keywords.slice(0, 10) : [],
  };
}

async function getAuthedUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
    const appId: string = body?.app_id;
    const origin: string = body?.origin || "https://ceo-brain-orchestra.lovable.app";
    const platforms: Platform[] = Array.isArray(body?.platforms) && body.platforms.length
      ? body.platforms.filter((p: string) => (PLATFORMS as readonly string[]).includes(p))
      : [...PLATFORMS];
    const seoAngles: string[] =
      Array.isArray(body?.seo_angles) && body.seo_angles.length
        ? body.seo_angles
        : [
            "founders' guide",
            "alternative to hiring",
            "how it works",
            "case for automation",
          ];

    const app = KNOWN_APPS[appId];
    if (!app) throw new Error(`Unknown app_id: ${appId}`);

    // Stripe checkout target → use the product detail page on the live storefront.
    // Detail page contains the real Stripe-backed Start Trial button.
    const targetUrl = `${origin}/apps/${encodeURIComponent(appId)}`;

    // Create the launch master record
    const { data: launch, error: launchErr } = await admin
      .from("organic_launches")
      .insert({
        user_id: userId,
        app_id: appId,
        app_name: app.name,
        status: "generating",
        platforms,
        stripe_price_id: app.priceId ?? null,
        stripe_checkout_url: targetUrl,
      })
      .select()
      .single();

    if (launchErr) throw launchErr;

    // Generate everything in parallel (fast)
    const [postResults, seoResults] = await Promise.all([
      Promise.all(
        platforms.map(async (p) => {
          try {
            const post = await generatePlatformPost(app, p, targetUrl);
            return { platform: p, ok: true as const, post };
          } catch (e) {
            return { platform: p, ok: false as const, error: (e as Error).message };
          }
        }),
      ),
      Promise.all(
        seoAngles.map(async (angle) => {
          try {
            const page = await generateSeoPage(app, angle, targetUrl);
            return { angle, ok: true as const, page };
          } catch (e) {
            return { angle, ok: false as const, error: (e as Error).message };
          }
        }),
      ),
    ]);

    // Persist successful posts
    const postRows = postResults
      .filter((r) => r.ok)
      .map((r) => ({
        launch_id: launch.id,
        user_id: userId,
        platform: r.platform,
        title: r.ok ? r.post.title : null,
        body: r.ok ? r.post.body : "",
        hashtags: r.ok ? r.post.hashtags : [],
        cta: r.ok ? r.post.cta : null,
        media_prompt: r.ok ? r.post.media_prompt : null,
        target_url: targetUrl,
        status: "ready",
      }));
    if (postRows.length) {
      await admin.from("social_posts").insert(postRows);
    }

    // Persist successful SEO pages with unique slugs
    const seoRows = seoResults
      .filter((r) => r.ok)
      .map((r) => {
        const baseSlug = slugify(`${appId}-${r.angle}`);
        const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;
        return {
          launch_id: launch.id,
          user_id: userId,
          app_id: appId,
          slug,
          title: r.ok ? r.page.title : "",
          meta_description: r.ok ? r.page.meta_description : "",
          headline: r.ok ? r.page.headline : "",
          subheadline: r.ok ? r.page.subheadline : null,
          body_md: r.ok ? r.page.body_md : "",
          cta_text: `Start free trial — $${app.price}/mo`,
          target_url: targetUrl,
          keywords: r.ok ? r.page.keywords : [],
          published: true,
        };
      });
    if (seoRows.length) {
      await admin.from("seo_landing_pages").insert(seoRows);
    }

    // Mark launch done
    const { error: updErr } = await admin
      .from("organic_launches")
      .update({
        status: "ready",
        posts_generated: postRows.length,
        landing_pages_generated: seoRows.length,
      })
      .eq("id", launch.id);
    if (updErr) log("launch update error", { error: updErr.message });

    // Best-effort log
    await admin.from("agent_logs").insert({
      agent_name: "Organic Launch Engine",
      agent_role: "marketing",
      action: `One-click launched ${app.name} across ${postRows.length} platforms + ${seoRows.length} SEO pages`,
      status: "success",
      details: { app_id: appId, posts: postRows.length, pages: seoRows.length },
    });

    return new Response(
      JSON.stringify({
        ok: true,
        launch_id: launch.id,
        posts: postRows.length,
        landing_pages: seoRows.length,
        target_url: targetUrl,
        post_errors: postResults.filter((r) => !r.ok),
        page_errors: seoResults.filter((r) => !r.ok),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    log("ERROR", { message: (e as Error).message });
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});