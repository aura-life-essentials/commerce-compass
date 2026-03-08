import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const log = (step: string, details?: unknown) => {
  console.log(`[VIRAL-RESEARCH] ${step}`, details ? JSON.stringify(details) : "");
};

async function researchViralProducts(niches: string[]) {
  log("Researching viral products", { niches });

  const nicheList = niches.join(", ");
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        {
          role: "user",
          content: `Find the top 15 most viral selling products on TikTok, Instagram Reels, and YouTube Shorts right now in these niches: ${nicheList}.

For each product, provide:
1. Product name and category
2. Estimated profit margin percentage
3. Competition level (low/medium/high)
4. Why it's going viral (hooks, trends, emotional triggers)
5. Best platforms it's trending on
6. Estimated selling price and cost price
7. Top viral video URLs or creators promoting it
8. Key hashtags driving discovery
9. Target demographic

Focus on products with HIGH profit margins (50%+) and LOW competition. Prioritize products that can be dropshipped or sourced cheaply.`,
        },
      ],
      search_recency_filter: "week",
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity research failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || "",
    citations: data.citations || [],
  };
}

async function structureProductData(rawResearch: string) {
  log("Structuring product data with AI");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: "You extract structured product data from research. Return valid JSON only.",
        },
        {
          role: "user",
          content: `Extract structured product data from this research. Return a JSON array of products:

${rawResearch}

Return JSON with this schema:
{
  "products": [
    {
      "name": "string",
      "category": "string",
      "sell_price": number,
      "cost_price": number,
      "profit_margin": number,
      "competition": "low" | "medium" | "high",
      "viral_score": number (1-100),
      "platforms": ["tiktok", "instagram", "youtube"],
      "why_viral": "string",
      "hooks": ["string"],
      "hashtags": ["string"],
      "target_demo": "string",
      "source_urls": ["string"],
      "video_script_idea": "string"
    }
  ]
}`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "structure_products",
            description: "Return structured viral product data",
            parameters: {
              type: "object",
              properties: {
                products: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      category: { type: "string" },
                      sell_price: { type: "number" },
                      cost_price: { type: "number" },
                      profit_margin: { type: "number" },
                      competition: { type: "string", enum: ["low", "medium", "high"] },
                      viral_score: { type: "number" },
                      platforms: { type: "array", items: { type: "string" } },
                      why_viral: { type: "string" },
                      hooks: { type: "array", items: { type: "string" } },
                      hashtags: { type: "array", items: { type: "string" } },
                      target_demo: { type: "string" },
                      source_urls: { type: "array", items: { type: "string" } },
                      video_script_idea: { type: "string" },
                    },
                    required: ["name", "category", "sell_price", "profit_margin", "competition", "viral_score", "platforms", "why_viral", "hooks"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["products"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "structure_products" } },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    log("AI structuring error", { status: response.status, error: errText });
    throw new Error(`AI structuring failed: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    return JSON.parse(toolCall.function.arguments);
  }

  // Fallback: try to parse content as JSON
  const content = data.choices?.[0]?.message?.content || "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return { products: [] };
}

async function generateVideoScript(product: any) {
  log("Generating video script for", { product: product.name });

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are a viral video scriptwriter for TrendVault, a cutting-edge e-commerce brand. 
Your brand voice: confident, authentic, slightly edgy, never fake. 
You create scripts that hook in 0.5 seconds and convert viewers into buyers.
The brand is ethical — no fake urgency, no deceptive claims.`,
        },
        {
          role: "user",
          content: `Write a 15-30 second viral video script for this product:

Product: ${product.name}
Category: ${product.category}
Price: $${product.sell_price}
Why it's viral: ${product.why_viral}
Hooks that work: ${product.hooks?.join(", ")}
Target audience: ${product.target_demo || "Gen Z & Millennials"}

Create:
1. A scroll-stopping hook (first 1-2 seconds)
2. The "wow" demonstration moment
3. A natural CTA that doesn't feel forced
4. Suggested music/audio style
5. Visual direction notes
6. 3 caption variations with hashtags

Make it feel native to TikTok/Reels — not an ad.`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Script gen failed: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, niches, product } = await req.json();
    log("Request", { action });

    if (action === "research") {
      const defaultNiches = ["beauty & skincare", "health & fitness", "home gadgets", "tech accessories", "office supplies", "cutting-edge technology"];
      const research = await researchViralProducts(niches || defaultNiches);
      const structured = await structureProductData(research.content);

      // Sort by profit margin and viral score, filter low competition
      const ranked = (structured.products || [])
        .sort((a: any, b: any) => {
          const scoreA = (a.profit_margin || 0) * 0.4 + (a.viral_score || 0) * 0.4 + (a.competition === "low" ? 20 : a.competition === "medium" ? 10 : 0);
          const scoreB = (b.profit_margin || 0) * 0.4 + (b.viral_score || 0) * 0.4 + (b.competition === "low" ? 20 : b.competition === "medium" ? 10 : 0);
          return scoreB - scoreA;
        });

      return new Response(JSON.stringify({
        success: true,
        products: ranked,
        raw_research: research.content,
        citations: research.citations,
        researched_at: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "generate_script") {
      if (!product) throw new Error("Product data required");
      const script = await generateVideoScript(product);
      return new Response(JSON.stringify({ success: true, script }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    log("Error", { message: (error as Error).message });
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
