import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const log = (step: string, details?: unknown) => {
  console.log(`[CONTENT-FACTORY] ${step}`, details ? JSON.stringify(details) : "");
};

async function callAI(apiKey: string, messages: Array<{ role: string; content: string }>) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI gateway error [${response.status}]: ${err}`);
  }
  return await response.json();
}

async function updatePipeline(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase.from("content_pipeline").update(updates).eq("id", id);
  if (error) log("DB update error", error);
}

// Stage 1: Generate viral video script
async function generateScript(apiKey: string, product: any): Promise<string> {
  const data = await callAI(apiKey, [
    {
      role: "system",
      content: `You are TrendVault's viral video scriptwriter for YouTube Shorts. 
Create punchy 15-30 second scripts that hook in 0.5 seconds and convert viewers into buyers.
Format: plain text script with [VISUAL] cues and [AUDIO] cues inline.
End with a natural CTA mentioning "link in bio" or "link in description".`,
    },
    {
      role: "user",
      content: `Write a viral YouTube Shorts script for:
Product: ${product.name || product.title}
Category: ${product.category || "trending"}
Price: $${product.sell_price || product.price || "24.99"}
Why viral: ${product.why_viral || "trending on social media"}
Target: ${product.target_demo || "Gen Z & Millennials"}

Include: scroll-stopping hook, wow moment, natural CTA, hashtag suggestions.`,
    },
  ]);
  return data.choices?.[0]?.message?.content || "";
}

// Stage 2: Generate video via xAI
async function generateVideo(xaiKey: string, product: any, script: string): Promise<string> {
  const prompt = `Create a viral YouTube Shorts product video for "${product.name || product.title}". 
Style: fast-paced, trendy, aesthetic, eye-catching. 
Scene: Product showcase with dynamic camera movement, soft lighting, clean background.
${script.substring(0, 200)}`;

  const response = await fetch("https://api.x.ai/v1/videos/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${xaiKey}`,
    },
    body: JSON.stringify({
      model: "grok-imagine-video",
      prompt,
      duration: 10,
      aspect_ratio: "9:16",
      resolution: "720p",
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`xAI video error [${response.status}]: ${JSON.stringify(data)}`);
  return data.request_id;
}

// Stage 3: Poll video status
async function pollVideoStatus(xaiKey: string, requestId: string) {
  const response = await fetch(`https://api.x.ai/v1/videos/${requestId}`, {
    headers: { Authorization: `Bearer ${xaiKey}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`xAI poll error: ${response.status}`);
  return data;
}

// Stage 4: Generate YouTube metadata
async function generateYouTubeMetadata(apiKey: string, product: any, script: string) {
  const data = await callAI(apiKey, [
    {
      role: "system",
      content: "You generate YouTube Shorts metadata. Return JSON only with: title (max 100 chars, emoji-rich), description (with hashtags and link placeholder), tags (array of 10-15 tags).",
    },
    {
      role: "user",
      content: `Generate YouTube Shorts metadata for:
Product: ${product.name || product.title}
Script: ${script.substring(0, 300)}

Return JSON: { "title": "...", "description": "...", "tags": [...] }`,
    },
  ]);
  
  const content = data.choices?.[0]?.message?.content || "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch { /* fall through */ }
  }
  return {
    title: `🔥 ${product.name || product.title} - Must Have!`,
    description: `Get yours now! Link in description 👇\n\n#viral #trending #musthave`,
    tags: ["viral", "trending", "musthave", "tiktok", "shorts"],
  };
}

// Full pipeline orchestrator
async function runPipeline(pipelineId: string, product: any) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const XAI_API_KEY = Deno.env.get("XAI_API_KEY");

  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
  if (!XAI_API_KEY) throw new Error("XAI_API_KEY not configured");

  // Stage 1: Script
  log("Stage 1: Generating script", { id: pipelineId });
  await updatePipeline(pipelineId, { stage: "scripting", status: "processing" });
  
  const script = await generateScript(LOVABLE_API_KEY, product);
  await updatePipeline(pipelineId, { script, stage: "scripted" });
  log("Script generated", { length: script.length });

  // Stage 2: Video generation
  log("Stage 2: Generating video", { id: pipelineId });
  await updatePipeline(pipelineId, { stage: "video_generating", status: "processing" });
  
  const requestId = await generateVideo(XAI_API_KEY, product, script);
  await updatePipeline(pipelineId, { video_request_id: requestId, stage: "video_pending" });
  log("Video generation started", { requestId });

  // Stage 3: Generate YouTube metadata while video renders
  const ytMetadata = await generateYouTubeMetadata(LOVABLE_API_KEY, product, script);
  await updatePipeline(pipelineId, { 
    metadata: { youtube: ytMetadata, script_generated_at: new Date().toISOString() } 
  });

  return { script, requestId, ytMetadata };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, product, pipeline_id, products } = await req.json();
    log("Request", { action });

    if (action === "start_single") {
      // Create pipeline entry and start
      const { data: entry, error } = await supabase.from("content_pipeline").insert({
        product_name: product.name || product.title,
        product_data: product,
        source: product.source || "manual",
        platform: "youtube_shorts",
        status: "processing",
        stage: "starting",
      }).select().single();

      if (error) throw new Error(`DB error: ${error.message}`);
      
      const result = await runPipeline(entry.id, product);
      
      return new Response(JSON.stringify({ success: true, pipeline_id: entry.id, ...result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "start_batch") {
      // Start pipeline for multiple products
      const results = [];
      for (const prod of (products || []).slice(0, 5)) {
        const { data: entry, error } = await supabase.from("content_pipeline").insert({
          product_name: prod.name || prod.title,
          product_data: prod,
          source: prod.source || "viral_research",
          platform: "youtube_shorts",
          status: "processing",
          stage: "starting",
        }).select().single();

        if (error) { log("Batch insert error", error); continue; }
        
        try {
          const result = await runPipeline(entry.id, prod);
          results.push({ pipeline_id: entry.id, product: prod.name || prod.title, ...result });
        } catch (e) {
          await updatePipeline(entry.id, { status: "error", error_message: String(e) });
          results.push({ pipeline_id: entry.id, product: prod.name || prod.title, error: String(e) });
        }
      }

      return new Response(JSON.stringify({ success: true, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "poll_video") {
      const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
      if (!XAI_API_KEY) throw new Error("XAI_API_KEY not configured");

      // Get pipeline entry
      const { data: entry } = await supabase.from("content_pipeline")
        .select("*").eq("id", pipeline_id).single();
      
      if (!entry?.video_request_id) throw new Error("No video request found");

      const videoStatus = await pollVideoStatus(XAI_API_KEY, entry.video_request_id);
      
      if (videoStatus.status === "completed" && videoStatus.video) {
        await updatePipeline(pipeline_id, {
          video_url: videoStatus.video.url || videoStatus.video,
          stage: "video_ready",
          status: "ready_to_post",
        });
      }

      return new Response(JSON.stringify({ success: true, ...videoStatus }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_pipeline") {
      const { data, error } = await supabase.from("content_pipeline")
        .select("*").order("created_at", { ascending: false }).limit(50);
      
      return new Response(JSON.stringify({ success: true, items: data || [] }), {
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
