import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
const XAI_CHAT_URL = "https://api.x.ai/v1/chat/completions";
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const logStep = (step: string, details?: unknown) => {
  console.log(`[VIRAL-SCRAPER] ${step}`, details ? JSON.stringify(details) : "");
};

async function searchViralContent(query: string, platform: string) {
  logStep("Searching viral content", { query, platform });

  if (!XAI_API_KEY) throw new Error("XAI_API_KEY is not configured");

  const response = await fetch(XAI_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${XAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-3-mini-fast",
      messages: [
        {
          role: "system",
          content: "You are a viral content research expert specializing in social media trends. Provide detailed, actionable insights about viral content."
        },
        { 
          role: "user", 
          content: `Find the top 10 most viral ${platform} videos/posts about "${query}" from the past week. 
          For each, provide: estimated views, likes, shares, key hooks used, hashtags, and why it went viral.
          Focus on content with high engagement rates that could be replicated for e-commerce marketing.`
        }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || "",
    citations: [],
  };
}

async function scrapeAndAnalyze(url: string) {
  logStep("Scraping URL", { url });

  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown", "html"],
      onlyMainContent: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logStep("Firecrawl error", { status: response.status, error: errorText });
    return null;
  }

  const data = await response.json();
  return data.data || data;
}

async function analyzeViralPatterns(content: string) {
  logStep("Analyzing viral patterns");

  if (!XAI_API_KEY) throw new Error("XAI_API_KEY is not configured");

  const response = await fetch(XAI_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${XAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-3-mini-fast",
      messages: [
        { 
          role: "system", 
          content: `You are a viral content analyst. Extract actionable insights from viral content that can be used to create marketing videos for e-commerce products.` 
        },
        { 
          role: "user", 
          content: `Analyze this viral content and extract:
1. Hook patterns (first 3 seconds)
2. Emotional triggers used
3. Call-to-action techniques
4. Audio/music trends
5. Visual patterns
6. Hashtag strategies
7. Optimal posting times
8. Engagement tactics

Content: ${content}

Return as structured JSON.`
        }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.status}`);
  }

  const data = await response.json();
  const analysisContent = data.choices?.[0]?.message?.content || "";
  
  const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return { raw_analysis: analysisContent };
    }
  }
  return { raw_analysis: analysisContent };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, platform, url } = await req.json();
    logStep("Request received", { action, query, platform });

    if (action === "search") {
      const searchResults = await searchViralContent(query, platform || "tiktok");
      const analysis = await analyzeViralPatterns(searchResults.content);

      return new Response(JSON.stringify({ 
        success: true, 
        results: searchResults,
        analysis,
        saved_count: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "scrape") {
      if (!url) throw new Error("URL is required");
      
      const scraped = await scrapeAndAnalyze(url);
      if (!scraped) {
        throw new Error("Failed to scrape URL");
      }

      const analysis = await analyzeViralPatterns(scraped.markdown || scraped.html || "");

      const { data: saved, error } = await supabase.from("viral_content").insert({
        source_url: url,
        platform: platform || "unknown",
        content_type: "video",
        extracted_hooks: analysis.hook_patterns || [],
        audio_trends: analysis.audio_trends || {},
        analyzed_at: new Date().toISOString(),
      }).select().single();

      if (error) logStep("Error saving", error);

      return new Response(JSON.stringify({ 
        success: true, 
        scraped,
        analysis,
        saved
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "trending") {
      const { data: trending, error } = await supabase
        .from("viral_content")
        .select("*")
        .order("engagement_score", { ascending: false })
        .limit(20);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, trending }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    logStep("Error", { message: (error as Error).message });
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
