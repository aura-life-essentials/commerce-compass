import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const XAI_BASE = "https://api.x.ai/v1";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const PLATFORMS = ["tiktok", "instagram", "twitter", "facebook"] as const;
type Platform = (typeof PLATFORMS)[number];
type EngineMode = "local" | "xai";

async function requireAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const token = authHeader.replace("Bearer ", "");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceRoleKey && token === serviceRoleKey) return "service-role";
  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
  const { data, error } = await authClient.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  return data.claims.sub;
}

interface Product { title: string; description: string; price: string; handle: string; }
interface MarketingContent { hook: string; main_content: string; hashtags: string[]; cta: string; posting_time: string; target_audience: string; estimated_reach: string; content_type: string; engine_mode: string; }

function parsePrice(v: string): number { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function getAudience(p: number): string { return p >= 70 ? "buyers seeking premium utility" : p >= 40 ? "value-focused shoppers" : "impulse-friendly shoppers"; }
function getReach(p: Platform): string { return p === "tiktok" ? "2,000-20,000" : p === "instagram" ? "1,000-12,000" : p === "twitter" ? "800-8,000" : "500-5,000"; }
function getPostingTime(p: Platform): string { return p === "tiktok" ? "8:30pm Tue-Thu" : p === "instagram" ? "7:00pm Mon-Thu" : p === "twitter" ? "12:15pm weekdays" : "6:30pm Wed-Fri"; }
function getContentType(p: Platform): string { return p === "tiktok" ? "short_video" : p === "instagram" ? "reel_or_carousel" : p === "twitter" ? "thread" : "story_post"; }

function buildHashtags(product: Product, platform: Platform): string[] {
  const base = ["trending", "musthave", "dealoftheday", "shopnow"];
  const tags = product.title.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 3).slice(0, 3);
  const pTag = platform === "twitter" ? "xfinds" : `${platform}finds`;
  return Array.from(new Set([pTag, ...tags, ...base])).slice(0, 8);
}

function generateLocalContent(product: Product, platform: Platform): MarketingContent {
  const price = parsePrice(product.price);
  const hooks: Record<Platform, string> = {
    tiktok: `This ${product.title} solves a daily problem in under 10 seconds`,
    instagram: `Still doing this the hard way? ${product.title} is the shortcut`,
    twitter: `Hot take: ${product.title} is the most underpriced upgrade right now`,
    facebook: `We tested ${product.title} for a week — here's what changed`,
  };
  const ctas: Record<Platform, string> = {
    tiktok: `Tap now before this batch sells out.`,
    instagram: `Comment "LINK" and grab yours before stock drops.`,
    twitter: `Reply "link" and I'll send the direct product page.`,
    facebook: `Message us "DETAILS" and we'll send today's offer link.`,
  };
  const bodies: Record<Platform, string> = {
    tiktok: `${hooks.tiktok}\n\nPain: you lose time every day.\nFix: ${product.title} does it faster.\nProof: customers wish they bought earlier.\nPrice: $${price.toFixed(2)}\n${ctas.tiktok}`,
    instagram: `Slide 1: ${hooks.instagram}\nSlide 2: The old way wastes time.\nSlide 3: ${product.title} removes friction.\nSlide 4: Better results, less effort.\nSlide 5: $${price.toFixed(2)} today. ${ctas.instagram}`,
    twitter: `${hooks.twitter}\n\n1) Most people ignore this pain point.\n2) ${product.title} fixes it.\n3) ${(product.description || "Built for speed.").slice(0, 200)}\n4) Absurd value at $${price.toFixed(2)}.\n5) ${ctas.twitter}`,
    facebook: `${hooks.facebook}\n\nBefore: frustrating routine.\nAfter ${product.title}: smoother, quicker, less stress.\nStrong pick at $${price.toFixed(2)}.\n\n${ctas.facebook}`,
  };
  return { hook: hooks[platform], main_content: bodies[platform], hashtags: buildHashtags(product, platform), cta: ctas[platform], posting_time: getPostingTime(platform), target_audience: getAudience(price), estimated_reach: getReach(platform), content_type: getContentType(platform), engine_mode: "local" };
}

async function generateXAIContent(product: Product, platform: Platform): Promise<MarketingContent> {
  const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
  if (!XAI_API_KEY) return generateLocalContent(product, platform); // graceful fallback

  try {
    const res = await fetch(`${XAI_BASE}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${XAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "grok-3-mini-fast",
        messages: [
          { role: "system", content: "You are an elite direct-response copywriter. Write content that SELLS. Return JSON with fields: hook, main_content, hashtags (array), cta, posting_time, target_audience, estimated_reach, content_type." },
          { role: "user", content: `Create ${platform.toUpperCase()} marketing content for:\nPRODUCT: ${product.title}\nPRICE: $${product.price}\nDESCRIPTION: ${product.description}\n\nMake it viral and conversion-focused.` },
        ],
        temperature: 0.8,
      }),
    });

    if (!res.ok) throw new Error(`xAI ${res.status}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const p = JSON.parse(match[0]);
        return { hook: p.hook || "", main_content: p.main_content || text, hashtags: Array.isArray(p.hashtags) ? p.hashtags : buildHashtags(product, platform), cta: p.cta || "", posting_time: p.posting_time || getPostingTime(platform), target_audience: p.target_audience || getAudience(parsePrice(product.price)), estimated_reach: p.estimated_reach || getReach(platform), content_type: p.content_type || getContentType(platform), engine_mode: "xai" };
      } catch { /* fall through */ }
    }
    return { hook: text.slice(0, 100), main_content: text, hashtags: buildHashtags(product, platform), cta: "Tap to shop now", posting_time: getPostingTime(platform), target_audience: getAudience(parsePrice(product.price)), estimated_reach: getReach(platform), content_type: getContentType(platform), engine_mode: "xai" };
  } catch (e) {
    console.error("xAI content gen failed, falling back to local:", e);
    return generateLocalContent(product, platform);
  }
}

async function generateContent(product: Product, platform: Platform, mode: EngineMode): Promise<MarketingContent> {
  return mode === "xai" ? generateXAIContent(product, platform) : generateLocalContent(product, platform);
}

async function persistCampaign(product: Product, platform: Platform, content: MarketingContent, campaignType: string) {
  const { data: campaign } = await supabase.from("organic_campaigns").insert({
    campaign_name: `${product.title} - ${platform}`, campaign_type: campaignType,
    target_platforms: [platform], status: "ready",
    generated_content: [{ id: crypto.randomUUID(), type: content.content_type || "post", platform, content: content.main_content, hook: content.hook, hashtags: content.hashtags, cta: content.cta, posting_time: content.posting_time, target_audience: content.target_audience, status: "ready", engine_mode: content.engine_mode }],
    content_strategy: { product_handle: product.handle, product_price: product.price, estimated_reach: content.estimated_reach, engine_mode: content.engine_mode },
    assigned_agent: "Marketing Blitz AI", started_at: new Date().toISOString(),
  }).select().single();

  await supabase.from("agent_logs").insert({
    agent_name: "Marketing Blitz AI", agent_role: "content_creator",
    action: `Generated ${platform} content for ${product.title}`,
    status: "success", details: { platform, product: product.title, hook: content.hook, engine_mode: content.engine_mode },
  });
  return campaign;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    await requireAuthenticatedUser(req);
    const { action, products, platform, product, mode = "local" } = await req.json();
    const engineMode: EngineMode = mode === "xai" || mode === "external" ? "xai" : "local";

    if (action === "blitz_all") {
      const targetProducts = (products || []).slice(0, 5) as Product[];
      const jobs = targetProducts.flatMap(prod => PLATFORMS.map(plat => ({ prod, plat })));
      const results = await Promise.all(jobs.map(async ({ prod, plat }) => {
        try {
          const content = await generateContent(prod, plat, engineMode);
          const campaign = await persistCampaign(prod, plat, content, "content_blitz");
          return { product: prod.title, platform: plat, content, campaign };
        } catch (e) {
          console.error(`Failed for ${prod.title} on ${plat}:`, e);
          return { product: prod.title, platform: plat, error: (e as Error).message };
        }
      }));
      return new Response(JSON.stringify({ success: true, results, total: results.length, mode: engineMode }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "single") {
      const resolvedPlatform = (platform || "tiktok") as Platform;
      const content = await generateContent(product, resolvedPlatform, engineMode);
      const campaign = await persistCampaign(product, resolvedPlatform, content, "single_post");
      return new Response(JSON.stringify({ success: true, content, campaign, mode: engineMode }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Marketing blitz error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
