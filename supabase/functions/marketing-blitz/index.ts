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

const PLATFORMS = ["tiktok", "instagram", "twitter", "facebook"];

interface Product {
  title: string;
  description: string;
  price: string;
  handle: string;
}

async function generateMarketingContent(product: Product, platform: string): Promise<any> {
  const platformGuides: Record<string, string> = {
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
          content: `You are an elite direct-response copywriter and viral content strategist. You write content that SELLS, not just entertains. Every piece must drive clicks and purchases. You understand psychology, urgency, social proof, and platform-specific algorithms. Write like a human, not a brand. Be authentic, relatable, and persuasive.`
        },
        {
          role: "user",
          content: `Create ${platform.toUpperCase()} marketing content for:

PRODUCT: ${product.title}
PRICE: $${product.price}
DESCRIPTION: ${product.description}
STORE LINK: trendvault store (link in bio / link below)

PLATFORM REQUIREMENTS:
${platformGuides[platform]}

MANDATORY ELEMENTS:
- Emotional hook that stops scrolling
- Pain point that resonates with target demo (18-35)
- Product as the unexpected solution
- Social proof language ("everyone's talking about", "sold out 3x")
- Urgency ("limited stock", "price going up")
- Clear CTA driving to purchase

Return JSON with these exact fields:
{
  "hook": "the opening line/hook",
  "main_content": "the full post/script content",
  "hashtags": ["relevant", "hashtags"],
  "cta": "call to action text",
  "posting_time": "best time to post (e.g. 7pm EST Tuesday)",
  "target_audience": "who this targets",
  "estimated_reach": "estimated organic reach range",
  "content_type": "reel/carousel/thread/story/post"
}`
        }
      ],
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`AI error for ${platform}:`, err);
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return { main_content: content, hook: content.slice(0, 100) };
    }
  }
  return { main_content: content, hook: content.slice(0, 100) };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, products, platform, product } = await req.json();

    if (action === "blitz_all") {
      // Generate content for ALL products across ALL platforms
      const results: any[] = [];
      const targetProducts = (products || []).slice(0, 5); // Top 5 products max per blitz

      for (const prod of targetProducts) {
        for (const plat of PLATFORMS) {
          try {
            const content = await generateMarketingContent(prod, plat);
            
            // Save to organic_campaigns
            const { data: campaign } = await supabase.from("organic_campaigns").insert({
              campaign_name: `${prod.title} - ${plat}`,
              campaign_type: "content_blitz",
              target_platforms: [plat],
              status: "ready",
              generated_content: [{
                id: crypto.randomUUID(),
                type: content.content_type || "post",
                platform: plat,
                content: content.main_content,
                hook: content.hook,
                hashtags: content.hashtags,
                cta: content.cta,
                posting_time: content.posting_time,
                target_audience: content.target_audience,
                status: "ready",
              }],
              content_strategy: {
                product_handle: prod.handle,
                product_price: prod.price,
                estimated_reach: content.estimated_reach,
              },
              assigned_agent: "Marketing Blitz AI",
              started_at: new Date().toISOString(),
            }).select().single();

            // Log agent action
            await supabase.from("agent_logs").insert({
              agent_name: "Marketing Blitz AI",
              agent_role: "content_creator",
              action: `Generated ${plat} content for ${prod.title}`,
              status: "success",
              details: { platform: plat, product: prod.title, hook: content.hook },
            });

            results.push({ product: prod.title, platform: plat, content, campaign });
          } catch (e) {
            console.error(`Failed for ${prod.title} on ${plat}:`, e);
            results.push({ product: prod.title, platform: plat, error: (e as Error).message });
          }
        }
      }

      return new Response(JSON.stringify({ success: true, results, total: results.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "single") {
      const content = await generateMarketingContent(product, platform || "tiktok");

      const { data: campaign } = await supabase.from("organic_campaigns").insert({
        campaign_name: `${product.title} - ${platform}`,
        campaign_type: "single_post",
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
          status: "ready",
        }],
        assigned_agent: "Marketing Blitz AI",
        started_at: new Date().toISOString(),
      }).select().single();

      await supabase.from("agent_logs").insert({
        agent_name: "Marketing Blitz AI",
        agent_role: "content_creator",
        action: `Generated ${platform} content for ${product.title}`,
        status: "success",
        details: { platform, product: product.title },
      });

      return new Response(JSON.stringify({ success: true, content, campaign }), {
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
