// Grok-first AI helper. Tries xAI (Grok) directly, falls back to Lovable AI Gateway.
// Used to "unleash Grok" across the autonomous stack.

const XAI_URL = "https://api.x.ai/v1/chat/completions";
const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type GrokMessage = { role: "system" | "user" | "assistant"; content: string };

export interface GrokCallOptions {
  messages: GrokMessage[];
  temperature?: number;
  max_tokens?: number;
  // Default Grok model. Override per-call if you want grok-4-1-fast-reasoning, etc.
  grokModel?: string;
  // Lovable fallback model (only used if XAI key missing or call fails).
  fallbackModel?: string;
  responseFormat?: "json_object" | "text";
}

export interface GrokCallResult {
  content: string;
  provider: "xai" | "lovable";
  model: string;
  raw?: unknown;
}

export async function callGrok(opts: GrokCallOptions): Promise<GrokCallResult> {
  const xaiKey = Deno.env.get("XAI_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const grokModel = opts.grokModel ?? "grok-4-1-fast-non-reasoning";
  const fallbackModel = opts.fallbackModel ?? "google/gemini-2.5-flash";

  // Primary: xAI Grok direct
  if (xaiKey) {
    try {
      const body: Record<string, unknown> = {
        model: grokModel,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.6,
      };
      if (opts.max_tokens) body.max_tokens = opts.max_tokens;
      if (opts.responseFormat === "json_object") {
        body.response_format = { type: "json_object" };
      }
      const res = await fetch(XAI_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${xaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content ?? "";
        if (content) return { content, provider: "xai", model: grokModel, raw: data };
      } else {
        console.warn(`[grok] xAI ${res.status} — falling back to Lovable AI`);
      }
    } catch (e) {
      console.warn("[grok] xAI threw, falling back:", e);
    }
  }

  // Fallback: Lovable AI Gateway
  if (!lovableKey) {
    throw new Error("Both XAI_API_KEY and LOVABLE_API_KEY are unavailable.");
  }
  const body: Record<string, unknown> = {
    model: fallbackModel,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.6,
    stream: false,
  };
  if (opts.max_tokens) body.max_tokens = opts.max_tokens;
  if (opts.responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }
  const res = await fetch(LOVABLE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Lovable AI fallback failed [${res.status}]: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? "";
  return { content, provider: "lovable", model: fallbackModel, raw: data };
}