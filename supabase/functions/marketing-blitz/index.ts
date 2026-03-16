import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const PLATFORMS = ["tiktok", "instagram", "twitter", "facebook"] as const;
type Platform = (typeof PLATFORMS)[number];
type EngineMode = "local" | "external";

async function requireAuthenticatedUser(req: Request) {
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

  const { data, error } = await authClient.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return data.claims.sub;
}

interface Product {
  title: string;
  description: string;
  price: string;
  handle: string;
}

interface MarketingContent {
  hook: string;
  main_content: string;
  hashtags: string[];
  cta: string;
  posting_time: string;
  target_audience: string;
  estimated_reach: string;
  content_type: string;
  engine_mode: EngineMode;
}

function parsePrice(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getAudience(price: number): string {
  if (price >= 70) return "buyers seeking premium utility and performance upgrades";
  if (price >= 40) return "value-focused shoppers ready to solve a daily pain fast";
  return "impulse-friendly shoppers who want quick wins under budget";
}

function getReach(platform: Platform): string {
  if (platform === "tiktok") return "2,000-20,000 per post";
  if (platform === "instagram") return "1,000-12,000 per post";
  if (platform === "twitter") return "800-8,000 per thread";
  return "500-5,000 per post";
}

function getPostingTime(platform: Platform): string {
  if (platform === "tiktok") return "8:30pm local time, Tue-Thu";
  if (platform === "instagram") return "7:00pm local time, Mon-Thu";
  if (platform === "twitter") return "12:15pm local time, weekdays";
  return "6:30pm local time, Wed-Fri";
}

function getContentType(platform: Platform): string {
  if (platform === "tiktok") return "short_video";
  if (platform === "instagram") return "reel_or_carousel";
  if (platform === "twitter") return "thread";
  return "story_post";
}

function buildHashtags(product: Product, platform: Platform): string[] {
  const base = ["trending", "musthave", "dealoftheday", "shopnow"];
  const productTags = product.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 3);

  const platformTag = platform === "twitter" ? "xfinds" : `${platform}finds`;
  return Array.from(new Set([platformTag, ...productTags, ...base])).slice(0, 8);
}

function generateLocalMarketingContent(product: Product, platform: Platform): MarketingContent {
  const price = parsePrice(product.price);
  const audience = getAudience(price);
  const shortDesc = (product.description || "").replace(/\s+/g, " ").trim().slice(0, 220);

  const hookByPlatform: Record<Platform, string> = {
    tiktok: `This ${product.title} solves a daily problem in under 10 seconds`,
    instagram: `Still doing this the hard way? ${product.title} is the shortcut`,
    twitter: `Hot take: ${product.title} is the most underpriced upgrade right now`,
    facebook: `We tested ${product.title} for a week — here’s what changed`,
  };

  const ctaByPlatform: Record<Platform, string> = {
    tiktok: `Tap now before this batch sells out.`,
    instagram: `Comment "LINK" and grab yours before stock drops.`,
    twitter: `Reply "link" and I’ll send the direct product page.`,
    facebook: `Message us "DETAILS" and we’ll send today’s offer link.`,
  };

  const mainContentByPlatform: Record<Platform, string> = {
    tiktok: `${hookByPlatform.tiktok}\n\nPain: you lose time every day doing this manually.\nFix: ${product.title} does it faster with less effort.\nProof: customers keep saying they wish they bought earlier.\nPrice: $${price.toFixed(2)}\n${ctaByPlatform.tiktok}`,
    instagram: `Slide 1: ${hookByPlatform.instagram}\nSlide 2: The old way wastes time + energy.\nSlide 3: ${product.title} removes friction instantly.\nSlide 4: Why this matters: better results, less effort.\nSlide 5: $${price.toFixed(2)} today. ${ctaByPlatform.instagram}`,
    twitter: `${hookByPlatform.twitter}\n\n1) Most people ignore this pain point until it costs them time/money.\n2) ${product.title} fixes it quickly.\n3) ${shortDesc || "Built for real-life speed and convenience."}\n4) Price-to-value ratio is absurd at $${price.toFixed(2)}.\n5) ${ctaByPlatform.twitter}`,
    facebook: `${hookByPlatform.facebook}\n\nBefore: frustrating routine, inconsistent results.\nAfter using ${product.title}: smoother day, quicker outcome, less stress.\nIf you're in the market for a practical upgrade, this is a strong pick at $${price.toFixed(2)}.\n\n${ctaByPlatform.facebook}`,
  };

  return {
    hook: hookByPlatform[platform],
    main_content: mainContentByPlatform[platform],
    hashtags: buildHashtags(product, platform),
    cta: ctaByPlatform[platform],
    posting_time: getPostingTime(platform),
    target_audience: audience,
    estimated_reach: getReach(platform),
    content_type: getContentType(platform),
    engine_mode: "local",
  };
}

async function generateExternalMarketingContent(product: Product, platform: Platform): Promise<MarketingContent> {
  const platformGuides: Record<Platform, string> = {
    tiktok: "15-60 second video script. Hook in first 1.5 seconds. Use trending sounds reference. POV/storytime format. End with 'link in bio' CTA.",
    instagram: "Carousel post (5 slides). Slide 1: bold hook question. Slides 2-4: problem + solution with product. Slide 5: CTA with urgency. Include Reels script alternative (30s).",
    twitter: "Thread of 5 tweets. Tweet 1: controversial/surprising hook. Tweets 2-4: value + product weave. Tweet 5: soft CTA. Also provide 3 standalone viral tweet options.",
    facebook: "Long-form post (200-300 words). Story-driven. Problem → discovery → transformation format. Include question to drive comments. Group-friendly tone.",
  };

  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        {
          role: "system",
          content: "You are an elite direct-response copywriter and viral content strategist. You write content that SELLS, not just entertains."
        },
        {
          role: "user",
          content: `Create ${platform.toUpperCase()} marketing content for:\n\nPRODUCT: ${product.title}\nPRICE: $${product.price}\nDESCRIPTION: ${product.description}\n\nPLATFORM REQUIREMENTS:\n${platformGuides[platform]}\n\nReturn JSON with fields hook, main_content, hashtags, cta, posting_time, target_audience, estimated_reach, content_type.`
        }
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    if (response.status === 402) throw new Error("AI credits depleted. Please add credits in Settings → Workspace → Usage.");
    if (response.status === 429) throw new Error("Rate limited. Retrying in a moment...");
    const err = await response.text();
    throw new Error(`AI generation failed (${response.status}): ${err}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  const match = text.match(/\{[\s\S]*\}/);

  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      return {
        hook: parsed.hook || "",
        main_content: parsed.main_content || text,
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
        cta: parsed.cta || "",
        posting_time: parsed.posting_time || "Best evening slot",
        target_audience: parsed.target_audience || "18-35 buyers",
        estimated_reach: parsed.estimated_reach || "1,000-10,000",
        content_type: parsed.content_type || getContentType(platform),
        engine_mode: "external",
      };
    } catch {
      // fall through to normalized response below
    }
  }

  return {
    hook: text.slice(0, 100),
    main_content: text,
    hashtags: buildHashtags(product, platform),
    cta: "Tap to shop now",
    posting_time: getPostingTime(platform),
    target_audience: getAudience(parsePrice(product.price)),
    estimated_reach: getReach(platform),
    content_type: getContentType(platform),
    engine_mode: "external",
  };
}

async function generateMarketingContent(product: Product, platform: Platform, mode: EngineMode): Promise<MarketingContent> {
  if (mode === "external") {
    return generateExternalMarketingContent(product, platform);
  }
  return generateLocalMarketingContent(product, platform);
}

async function persistCampaign(product: Product, platform: Platform, content: MarketingContent, campaignType: string) {
  const { data: campaign } = await supabase.from("organic_campaigns").insert({
    campaign_name: `${product.title} - ${platform}`,
    campaign_type: campaignType,
    target_platforms: [platform],
    status: "ready",
    generated_content: [{
      id: crypto.randomUUID(),
      type: content.content_type || "post",
      platform,
      content: content.main_content,
      hook: content.hook,
      hashtags: content.hashtags,
      cta: content.cta,
      posting_time: content.posting_time,
      target_audience: content.target_audience,
      status: "ready",
      engine_mode: content.engine_mode,
    }],
    content_strategy: {
      product_handle: product.handle,
      product_price: product.price,
      estimated_reach: content.estimated_reach,
      engine_mode: content.engine_mode,
    },
    assigned_agent: "Marketing Blitz AI",
    started_at: new Date().toISOString(),
  }).select().single();

  await supabase.from("agent_logs").insert({
    agent_name: "Marketing Blitz AI",
    agent_role: "content_creator",
    action: `Generated ${platform} content for ${product.title}`,
    status: "success",
    details: { platform, product: product.title, hook: content.hook, engine_mode: content.engine_mode },
  });

  return campaign;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await requireAuthenticatedUser(req);
    const { action, products, platform, product, mode = "local" } = await req.json();
    const engineMode: EngineMode = mode === "external" ? "external" : "local";

    if (action === "blitz_all") {
      const targetProducts = (products || []).slice(0, 5) as Product[];
      const jobs = targetProducts.flatMap((prod) =>
        PLATFORMS.map((plat) => ({ prod, plat }))
      );

      const results = await Promise.all(
        jobs.map(async ({ prod, plat }) => {
          try {
            const content = await generateMarketingContent(prod, plat, engineMode);
            const campaign = await persistCampaign(prod, plat, content, "content_blitz");
            return { product: prod.title, platform: plat, content, campaign };
          } catch (e) {
            console.error(`Failed for ${prod.title} on ${plat}:`, e);
            return { product: prod.title, platform: plat, error: (e as Error).message };
          }
        })
      );

      return new Response(JSON.stringify({ success: true, results, total: results.length, mode: engineMode }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "single") {
      const resolvedPlatform = (platform || "tiktok") as Platform;
      const content = await generateMarketingContent(product, resolvedPlatform, engineMode);
      const campaign = await persistCampaign(product, resolvedPlatform, content, "single_post");

      return new Response(JSON.stringify({ success: true, content, campaign, mode: engineMode }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error("Marketing blitz error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
