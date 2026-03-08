import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const XAI_API_BASE = "https://api.x.ai/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
  if (!XAI_API_KEY) {
    return new Response(JSON.stringify({ error: "XAI_API_KEY is not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { action, prompt, request_id, model, duration, aspect_ratio, resolution, image_url } = await req.json();

    // Action: "generate" - Start video generation
    // Action: "poll" - Check status of a generation request
    if (action === "generate") {
      if (!prompt) {
        return new Response(JSON.stringify({ error: "Prompt is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body: Record<string, unknown> = {
        model: model || "grok-imagine-video",
        prompt,
        duration: duration || 10,
        aspect_ratio: aspect_ratio || "16:9",
        resolution: resolution || "720p",
      };

      // Support image-to-video if image_url provided
      if (image_url) {
        body.image_url = image_url;
      }

      console.log("[XAI-VIDEO] Starting generation:", { prompt: prompt.substring(0, 100), model: body.model });

      const response = await fetch(`${XAI_API_BASE}/videos/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${XAI_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("[XAI-VIDEO] Generation error:", response.status, JSON.stringify(data));
        return new Response(JSON.stringify({ error: `xAI API error [${response.status}]: ${JSON.stringify(data)}` }), {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("[XAI-VIDEO] Generation started:", data.request_id);

      return new Response(JSON.stringify({
        success: true,
        request_id: data.request_id,
        message: "Video generation started. Poll with action: 'poll' and the request_id to check status.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "poll") {
      if (!request_id) {
        return new Response(JSON.stringify({ error: "request_id is required for polling" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("[XAI-VIDEO] Polling status for:", request_id);

      const response = await fetch(`${XAI_API_BASE}/videos/${request_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${XAI_API_KEY}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("[XAI-VIDEO] Poll error:", response.status, JSON.stringify(data));
        return new Response(JSON.stringify({ error: `xAI API error [${response.status}]: ${JSON.stringify(data)}` }), {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("[XAI-VIDEO] Poll result:", { status: data.status });

      return new Response(JSON.stringify({
        success: true,
        status: data.status,
        video: data.video || null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      return new Response(JSON.stringify({ error: "Invalid action. Use 'generate' or 'poll'." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("[XAI-VIDEO] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
