import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const log = (step: string, details?: unknown) => {
  console.log(`[VIRAL-RESEARCH] ${step}`, details ? JSON.stringify(details) : "");
};

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

async function callAI(messages: Array<{ role: string; content: string }>, tools?: any[], tool_choice?: any) {
  const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
  if (!XAI_API_KEY) throw new Error("XAI_API_KEY not configured");

  const body: any = { model: "grok-3-mini-fast", messages };
  if (tools) body.tools = tools;
  if (tool_choice) body.tool_choice = tool_choice;

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${XAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI gateway error [${response.status}]: ${errText}`);
  }

  return await response.json();
}

async function researchViralProducts(apiKey: string, niches: string[]) {
  log("Researching viral products", { niches });

  const nicheList = niches.join(", ");
  const data = await callAI([
    {
      role: "system",
      content: "You are a viral product research expert with deep knowledge of TikTok, Instagram Reels, and YouTube Shorts trends. Provide detailed, actionable product research."
    },
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
7. Key hashtags driving discovery
8. Target demographic
9. A video script idea

Focus on products with HIGH profit margins (50%+) and LOW competition. Prioritize products that can be dropshipped or sourced cheaply.`,
    },
  ]);

  return {
    content: data.choices?.[0]?.message?.content || "",
    citations: [],
  };
}

async function structureProductData(apiKey: string, rawResearch: string) {
  log("Structuring product data with AI");

  const data = await callAI(
    apiKey,
    [
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
    [
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
    { type: "function", function: { name: "structure_products" } }
  );

  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    return JSON.parse(toolCall.function.arguments);
  }

  const content = data.choices?.[0]?.message?.content || "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return { products: [] };
}

async function generateVideoScript(apiKey: string, product: any) {
  log("Generating video script for", { product: product.name });

  const data = await callAI([
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
  ]);

  return data.choices?.[0]?.message?.content || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await requireAuthenticatedUser(req);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { action, niches, product } = await req.json();
    log("Request", { action });

    if (action === "research") {
      const defaultNiches = ["beauty & skincare", "health & fitness", "home gadgets", "tech accessories", "office supplies", "cutting-edge technology"];
      const research = await researchViralProducts(LOVABLE_API_KEY, niches || defaultNiches);
      const structured = await structureProductData(LOVABLE_API_KEY, research.content);

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
      const script = await generateVideoScript(LOVABLE_API_KEY, product);
      return new Response(JSON.stringify({ success: true, script }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    if (error instanceof Response) return error;
    log("Error", { message: (error as Error).message });
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});