import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const XAI_BASE = "https://api.x.ai/v1";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const logStep = (step: string, details?: unknown) => {
  console.log(`[CONTENT-GENERATOR] ${step}`, details ? JSON.stringify(details) : "");
};

function getXAIKey(): string {
  const key = Deno.env.get("XAI_API_KEY");
  if (!key) throw new Error("XAI_API_KEY not configured");
  return key;
}

async function requireAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const token = authHeader.replace("Bearer ", "");
  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
  const { data, error } = await authClient.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  return data.claims.sub;
}

async function generateVideoScript(product: any, viralPatterns: any, channel: string) {
  logStep("Generating video script via xAI", { product: product.title, channel });

  const res = await fetch(`${XAI_BASE}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getXAIKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "grok-3-mini-fast",
      messages: [
        {
          role: "system",
          content: `You are a viral video scriptwriter who creates engaging, high-converting marketing content.
          Your scripts are designed for ${channel} and follow viral patterns that drive sales.
          You write punchy, emotional hooks and clear calls-to-action.`
        },
        {
          role: "user",
          content: `Create a viral ${channel} video script for this product:

Product: ${product.title}
Description: ${product.description || "Premium quality product"}
Price: $${product.price}
Target Profit Margin: 67%

Use these viral patterns for inspiration:
${JSON.stringify(viralPatterns, null, 2)}

Requirements:
1. Hook in first 3 seconds
2. Problem-agitation-solution structure
3. Social proof elements
4. Urgency/scarcity
5. Clear CTA with link mention
6. Optimal length: 15-60 seconds for ${channel}

Return as JSON with:
- hook: the opening hook text
- script: full script with timings
- visual_cues: array of visual directions
- audio_cues: background music/sound suggestions
- hashtags: array of recommended hashtags
- estimated_engagement: expected engagement rate`
        }
      ],
      temperature: 0.8,
    }),
  });

  if (!res.ok) throw new Error(`Script generation failed: ${res.status}`);

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) { try { return JSON.parse(jsonMatch[0]); } catch { return { script: content }; } }
  return { script: content };
}

function extractScriptText(script: unknown): string {
  if (typeof script === "string") return script;
  if (Array.isArray(script)) return script.map((item: { text?: string; dialogue?: string }) => item.text || item.dialogue || "").join(" ");
  return "";
}

async function generateVoiceover(text: string, voiceId: string = "JBFqnCBsd6RMkjVDRZzb") {
  // Try ElevenLabs first, fall back to xAI TTS
  if (ELEVENLABS_API_KEY) {
    logStep("Generating voiceover via ElevenLabs", { voiceId, textLength: text.length });
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ text, model_id: "eleven_turbo_v2_5", voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.5, use_speaker_boost: true } }),
    });
    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      return { audio_base64: base64Encode(audioBuffer), format: "mp3", duration_estimate: Math.ceil(text.length / 15) };
    }
    logStep("ElevenLabs failed, falling back to xAI TTS", { status: response.status });
  }

  // xAI TTS fallback
  logStep("Generating voiceover via xAI TTS", { textLength: text.length });
  const res = await fetch(`${XAI_BASE}/tts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getXAIKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice_id: "eve" }),
  });
  if (!res.ok) throw new Error(`TTS failed: ${res.status}`);
  const audioBuffer = await res.arrayBuffer();
  return { audio_base64: base64Encode(audioBuffer), format: "mp3", duration_estimate: Math.ceil(text.length / 15) };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    await requireAuthenticatedUser(req);
    const { action, product, channel, store_id, script_text, voice_id } = await req.json();
    logStep("Request received", { action, channel });

    if (action === "generate_script") {
      const { data: viralContent } = await supabase.from("viral_content").select("extracted_hooks, audio_trends").order("engagement_score", { ascending: false }).limit(5);
      const viralPatterns = viralContent?.map(v => v.extracted_hooks).flat() || [];
      const script = await generateVideoScript(product, viralPatterns, channel || "tiktok");
      const { data: campaign, error } = await supabase.from("marketing_campaigns").insert({
        store_id, campaign_name: `${product.title} - ${channel} Campaign`, channel: channel || "tiktok",
        status: "draft", ai_generated_content: script, video_script: script.script,
      }).select().single();
      if (error) logStep("Error saving campaign", error);
      return new Response(JSON.stringify({ success: true, script, campaign }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "generate_voiceover") {
      if (!script_text) throw new Error("Script text is required");
      const voiceover = await generateVoiceover(script_text, voice_id);
      return new Response(JSON.stringify({ success: true, voiceover }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "full_campaign") {
      const { data: viralContent } = await supabase.from("viral_content").select("extracted_hooks, audio_trends").order("engagement_score", { ascending: false }).limit(5);
      const viralPatterns = viralContent?.map(v => v.extracted_hooks).flat() || [];
      const script = await generateVideoScript(product, viralPatterns, channel || "tiktok");
      let voiceover = null;
      const scriptForVoiceover = extractScriptText(script.script);
      if (scriptForVoiceover) { try { voiceover = await generateVoiceover(scriptForVoiceover, voice_id); } catch (e) { logStep("Voiceover failed", e); } }
      const { data: campaign, error } = await supabase.from("marketing_campaigns").insert({
        store_id, campaign_name: `${product.title} - ${channel} Full Campaign`, channel: channel || "tiktok",
        status: "draft", ai_generated_content: { ...script, voiceover_generated: !!voiceover },
        video_script: script.script, voiceover_url: voiceover ? "generated" : null,
        target_countries: ["US", "GB", "CA", "AU"],
      }).select().single();
      if (error) logStep("Error saving campaign", error);
      return new Response(JSON.stringify({ success: true, script, voiceover, campaign }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    if (error instanceof Response) return error;
    logStep("Error", { message: (error as Error).message });
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
