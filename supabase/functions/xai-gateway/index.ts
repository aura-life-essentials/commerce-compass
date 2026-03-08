import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const XAI_BASE = "https://api.x.ai/v1";

function getApiKey(): string {
  const key = Deno.env.get("XAI_API_KEY");
  if (!key) throw new Error("XAI_API_KEY is not configured");
  return key;
}

function headers(apiKey: string, contentType = "application/json"): Record<string, string> {
  return { Authorization: `Bearer ${apiKey}`, "Content-Type": contentType };
}

function jsonRes(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errRes(msg: string, status = 400) {
  return jsonRes({ error: msg, success: false }, status);
}

// ═══════════════════════════════════════════════════════════════
// CHAT — /v1/chat/completions & /v1/responses (with tools)
// ═══════════════════════════════════════════════════════════════
async function handleChat(apiKey: string, body: any) {
  const {
    messages, input, model = "grok-4-1-fast-reasoning",
    tools, stream = false, temperature, max_tokens,
    response_format, tool_choice
  } = body;

  // Use Responses API if tools are provided or input is used
  if (tools || input) {
    console.log("[xAI-GW] Chat via Responses API with tools:", tools?.map((t: any) => t.type || t.function?.name));
    const payload: any = {
      model,
      input: input || messages,
      stream,
    };
    if (tools) payload.tools = tools;
    if (temperature !== undefined) payload.temperature = temperature;
    if (tool_choice) payload.tool_choice = tool_choice;

    const res = await fetch(`${XAI_BASE}/responses`, {
      method: "POST",
      headers: headers(apiKey),
      body: JSON.stringify(payload),
    });

    if (stream && res.ok) {
      return new Response(res.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const data = await res.json();
    if (!res.ok) return errRes(`xAI Responses API [${res.status}]: ${JSON.stringify(data)}`, res.status);

    // Parse output
    let content = "";
    const citations: any[] = [];
    const toolCalls: any[] = [];

    if (data.output) {
      for (const item of data.output) {
        if (item.type === "message" && item.content) {
          for (const block of item.content) {
            if (block.type === "output_text") content += block.text;
          }
        }
        if (item.type === "tool_call") {
          toolCalls.push({ name: item.name, arguments: item.arguments, id: item.call_id });
        }
      }
    }
    if (data.citations) citations.push(...data.citations);

    return jsonRes({ success: true, content, citations, tool_calls: toolCalls, usage: data.usage, raw: data });
  }

  // Standard Chat Completions API
  console.log("[xAI-GW] Chat via Completions API, model:", model);
  const payload: any = { model, messages, stream };
  if (temperature !== undefined) payload.temperature = temperature;
  if (max_tokens) payload.max_tokens = max_tokens;
  if (response_format) payload.response_format = response_format;

  const res = await fetch(`${XAI_BASE}/chat/completions`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify(payload),
  });

  if (stream && res.ok) {
    return new Response(res.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  }

  const data = await res.json();
  if (!res.ok) return errRes(`xAI Chat [${res.status}]: ${JSON.stringify(data)}`, res.status);

  return jsonRes({ success: true, ...data });
}

// ═══════════════════════════════════════════════════════════════
// IMAGES — /v1/images/generations
// ═══════════════════════════════════════════════════════════════
async function handleImages(apiKey: string, body: any) {
  const { action = "generate" } = body;

  if (action === "generate") {
    const { prompt, model = "grok-imagine-image", n = 1, response_format, image_url, aspect_ratio } = body;
    if (!prompt) return errRes("prompt required");

    console.log("[xAI-GW] Image generation:", prompt.slice(0, 80));
    const payload: any = { model, prompt, n };
    if (response_format) payload.response_format = response_format;
    if (image_url) payload.image_url = image_url; // for editing
    if (aspect_ratio) payload.aspect_ratio = aspect_ratio;

    const res = await fetch(`${XAI_BASE}/images/generations`, {
      method: "POST",
      headers: headers(apiKey),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) return errRes(`xAI Images [${res.status}]: ${JSON.stringify(data)}`, res.status);

    return jsonRes({ success: true, images: data.data, created: data.created });
  }

  return errRes("Invalid image action. Use 'generate'.");
}

// ═══════════════════════════════════════════════════════════════
// VIDEOS — /v1/videos/generations + polling
// ═══════════════════════════════════════════════════════════════
async function handleVideos(apiKey: string, body: any) {
  const { action = "generate" } = body;

  if (action === "generate") {
    const { prompt, model = "grok-imagine-video", duration = 10, aspect_ratio = "16:9", resolution = "720p", image_url } = body;
    if (!prompt) return errRes("prompt required");

    console.log("[xAI-GW] Video generation:", prompt.slice(0, 80));
    const payload: any = { model, prompt, duration, aspect_ratio, resolution };
    if (image_url) payload.image_url = image_url;

    const res = await fetch(`${XAI_BASE}/videos/generations`, {
      method: "POST",
      headers: headers(apiKey),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) return errRes(`xAI Videos [${res.status}]: ${JSON.stringify(data)}`, res.status);

    return jsonRes({ success: true, request_id: data.request_id, message: "Poll with action:'poll'" });
  }

  if (action === "poll") {
    const { request_id } = body;
    if (!request_id) return errRes("request_id required");

    const res = await fetch(`${XAI_BASE}/videos/${request_id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const data = await res.json();
    if (!res.ok) return errRes(`xAI Videos poll [${res.status}]: ${JSON.stringify(data)}`, res.status);

    return jsonRes({ success: true, status: data.status, video: data.video || null });
  }

  return errRes("Invalid video action. Use 'generate' or 'poll'.");
}

// ═══════════════════════════════════════════════════════════════
// VOICE / TTS — /v1/tts
// ═══════════════════════════════════════════════════════════════
async function handleVoice(apiKey: string, body: any) {
  const { action = "tts" } = body;

  if (action === "tts") {
    const { text, voice_id = "eve", output_format } = body;
    if (!text) return errRes("text required");

    console.log("[xAI-GW] TTS:", text.slice(0, 80), "voice:", voice_id);
    const payload: any = { text, voice_id };
    if (output_format) payload.output_format = output_format;

    const res = await fetch(`${XAI_BASE}/tts`, {
      method: "POST",
      headers: headers(apiKey),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return errRes(`xAI TTS [${res.status}]: ${errText.slice(0, 300)}`, res.status);
    }

    // Return raw audio bytes
    const audioBytes = await res.arrayBuffer();
    const contentType = res.headers.get("Content-Type") || "audio/mpeg";

    return new Response(audioBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="tts_output.mp3"`,
      },
    });
  }

  if (action === "voices") {
    // Return available voices
    return jsonRes({
      success: true,
      voices: [
        { id: "eve", name: "Eve", description: "Default female voice" },
        { id: "aria", name: "Aria", description: "Warm female voice" },
        { id: "sage", name: "Sage", description: "Professional male voice" },
        { id: "atlas", name: "Atlas", description: "Deep male voice" },
        { id: "luna", name: "Luna", description: "Soft female voice" },
        { id: "nova", name: "Nova", description: "Energetic female voice" },
        { id: "zephyr", name: "Zephyr", description: "Calm male voice" },
      ]
    });
  }

  return errRes("Invalid voice action. Use 'tts' or 'voices'.");
}

// ═══════════════════════════════════════════════════════════════
// MODELS — /v1/models
// ═══════════════════════════════════════════════════════════════
async function handleModels(apiKey: string, body: any) {
  const { action = "list", model_id } = body;

  if (action === "list") {
    const res = await fetch(`${XAI_BASE}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    if (!res.ok) return errRes(`xAI Models [${res.status}]: ${JSON.stringify(data)}`, res.status);
    return jsonRes({ success: true, models: data.data || data });
  }

  if (action === "get" && model_id) {
    const res = await fetch(`${XAI_BASE}/models/${model_id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    if (!res.ok) return errRes(`xAI Model [${res.status}]: ${JSON.stringify(data)}`, res.status);
    return jsonRes({ success: true, model: data });
  }

  return errRes("Invalid models action. Use 'list' or 'get' with model_id.");
}

// ═══════════════════════════════════════════════════════════════
// FILES — /v1/files
// ═══════════════════════════════════════════════════════════════
async function handleFiles(apiKey: string, body: any, req: Request) {
  const { action = "list", file_id, purpose = "assistants" } = body;

  if (action === "list") {
    const res = await fetch(`${XAI_BASE}/files`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    if (!res.ok) return errRes(`xAI Files [${res.status}]: ${JSON.stringify(data)}`, res.status);
    return jsonRes({ success: true, files: data.data || data });
  }

  if (action === "get" && file_id) {
    const res = await fetch(`${XAI_BASE}/files/${file_id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    if (!res.ok) return errRes(`xAI Files [${res.status}]: ${JSON.stringify(data)}`, res.status);
    return jsonRes({ success: true, file: data });
  }

  if (action === "content" && file_id) {
    const res = await fetch(`${XAI_BASE}/files/${file_id}/content`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return errRes(`xAI File content [${res.status}]`, res.status);
    return new Response(res.body, {
      headers: { ...corsHeaders, "Content-Type": res.headers.get("Content-Type") || "application/octet-stream" },
    });
  }

  if (action === "upload") {
    // For file upload, expect base64 data
    const { filename, data: fileData, content_type = "application/pdf" } = body;
    if (!filename || !fileData) return errRes("filename and data (base64) required");

    const binaryData = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
    const formData = new FormData();
    formData.append("file", new Blob([binaryData], { type: content_type }), filename);
    formData.append("purpose", purpose);

    const res = await fetch(`${XAI_BASE}/files`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) return errRes(`xAI File upload [${res.status}]: ${JSON.stringify(data)}`, res.status);
    return jsonRes({ success: true, file: data });
  }

  if (action === "delete" && file_id) {
    const res = await fetch(`${XAI_BASE}/files/${file_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    if (!res.ok) return errRes(`xAI File delete [${res.status}]: ${JSON.stringify(data)}`, res.status);
    return jsonRes({ success: true, deleted: true, ...data });
  }

  return errRes("Invalid files action. Use 'list', 'get', 'content', 'upload', or 'delete'.");
}

// ═══════════════════════════════════════════════════════════════
// BATCHES — /v1/batches
// ═══════════════════════════════════════════════════════════════
async function handleBatches(apiKey: string, body: any) {
  const { action = "list", batch_id, name, requests: batchRequests } = body;

  if (action === "create") {
    if (!name) return errRes("name required for batch creation");
    console.log("[xAI-GW] Creating batch:", name);

    const res = await fetch(`${XAI_BASE}/batches`, {
      method: "POST",
      headers: headers(apiKey),
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) return errRes(`xAI Batch create [${res.status}]: ${JSON.stringify(data)}`, res.status);
    return jsonRes({ success: true, batch: data });
  }

  if (action === "add_requests" && batch_id) {
    if (!batchRequests || !Array.isArray(batchRequests)) return errRes("requests array required");

    const res = await fetch(`${XAI_BASE}/batches/${batch_id}/requests`, {
      method: "POST",
      headers: headers(apiKey),
      body: JSON.stringify({ batch_requests: batchRequests }),
    });
    const data = await res.json();
    if (!res.ok) return errRes(`xAI Batch add [${res.status}]: ${JSON.stringify(data)}`, res.status);
    return jsonRes({ success: true, added: batchRequests.length, ...data });
  }

  if (action === "start" && batch_id) {
    const res = await fetch(`${XAI_BASE}/batches/${batch_id}/start`, {
      method: "POST",
      headers: headers(apiKey),
    });
    const data = await res.json();
    if (!res.ok) return errRes(`xAI Batch start [${res.status}]: ${JSON.stringify(data)}`, res.status);
    return jsonRes({ success: true, ...data });
  }

  if (action === "status" && batch_id) {
    const res = await fetch(`${XAI_BASE}/batches/${batch_id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    if (!res.ok) return errRes(`xAI Batch status [${res.status}]: ${JSON.stringify(data)}`, res.status);
    return jsonRes({ success: true, ...data });
  }

  if (action === "results" && batch_id) {
    const res = await fetch(`${XAI_BASE}/batches/${batch_id}/results`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    if (!res.ok) return errRes(`xAI Batch results [${res.status}]: ${JSON.stringify(data)}`, res.status);
    return jsonRes({ success: true, ...data });
  }

  if (action === "cancel" && batch_id) {
    const res = await fetch(`${XAI_BASE}/batches/${batch_id}/cancel`, {
      method: "POST",
      headers: headers(apiKey),
    });
    const data = await res.json();
    if (!res.ok) return errRes(`xAI Batch cancel [${res.status}]: ${JSON.stringify(data)}`, res.status);
    return jsonRes({ success: true, ...data });
  }

  if (action === "list") {
    const res = await fetch(`${XAI_BASE}/batches`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    if (!res.ok) return errRes(`xAI Batches [${res.status}]: ${JSON.stringify(data)}`, res.status);
    return jsonRes({ success: true, batches: data.data || data });
  }

  return errRes("Invalid batch action. Use 'create', 'add_requests', 'start', 'status', 'results', 'cancel', or 'list'.");
}

// ═══════════════════════════════════════════════════════════════
// MAIN ROUTER
// ═══════════════════════════════════════════════════════════════
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = getApiKey();
    const body = await req.json();
    const { route } = body;

    if (!route) {
      return jsonRes({
        success: true,
        message: "xAI Gateway — Unified access to all xAI APIs",
        available_routes: {
          chat: "Chat completions & Responses API with tools (web_search, x_search, code_interpreter, function_calling)",
          images: "Image generation & editing (grok-imagine-image)",
          videos: "Video generation & polling (grok-imagine-video)",
          voice: "Text-to-Speech (TTS) with multiple voices",
          models: "List & inspect available models",
          files: "Upload, list, get, delete files",
          batches: "Batch processing for bulk operations"
        },
        example: {
          route: "chat",
          messages: [{ role: "user", content: "Hello" }],
          model: "grok-4-1-fast-reasoning",
          tools: [{ type: "web_search" }, { type: "x_search" }]
        }
      });
    }

    switch (route) {
      case "chat": return await handleChat(apiKey, body);
      case "images": return await handleImages(apiKey, body);
      case "videos": return await handleVideos(apiKey, body);
      case "voice": return await handleVoice(apiKey, body);
      case "models": return await handleModels(apiKey, body);
      case "files": return await handleFiles(apiKey, body, req);
      case "batches": return await handleBatches(apiKey, body);
      default: return errRes(`Unknown route: ${route}. Available: chat, images, videos, voice, models, files, batches`);
    }
  } catch (error) {
    console.error("[xAI-GW] Error:", error);
    return errRes(error instanceof Error ? error.message : "Unknown error", 500);
  }
});
