import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const j = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const err = (m: string, s = 400) => j({ success: false, error: m }, s);

// ─── Capability map for the enabled / key-auth-compatible Google APIs ───
// Only services that accept ?key=API_KEY (no OAuth/service account) work here.
const CAPABILITIES: Record<string, { url: (params: any) => string; method: string }> = {
  // Gemini (Generative Language) — text + multimodal
  "gemini.generate": {
    method: "POST",
    url: ({ model = "gemini-2.5-flash" }) =>
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  },
  "gemini.models": {
    method: "GET",
    url: () => `https://generativelanguage.googleapis.com/v1beta/models`,
  },
  // YouTube Data API v3 (public reads only with API key)
  "youtube.search": {
    method: "GET",
    url: ({ q, maxResults = 10 }) =>
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(q)}&maxResults=${maxResults}`,
  },
  "youtube.videos": {
    method: "GET",
    url: ({ id }) => `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${encodeURIComponent(id)}`,
  },
  // Translate v2
  "translate.text": {
    method: "POST",
    url: () => `https://translation.googleapis.com/language/translate/v2`,
  },
  // Maps Geocoding
  "maps.geocode": {
    method: "GET",
    url: ({ address }) => `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}`,
  },
  // Custom Search (requires a configured CX — pass it in params)
  "search.web": {
    method: "GET",
    url: ({ q, cx }) => `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(q)}&cx=${encodeURIComponent(cx)}`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth: super_admin only
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return err("unauthorized", 401);
    const supaUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supaUrl, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: claims, error: cErr } = await authClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (cErr || !claims?.claims?.sub) return err("unauthorized", 401);
    const svc = createClient(supaUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isSuper } = await svc.rpc("has_role", { _user_id: claims.claims.sub, _role: "super_admin" });
    if (!isSuper) return err("forbidden", 403);

    const apiKey = Deno.env.get("GOOGLE_DEVELOPER_API_KEY");
    if (!apiKey) return err("GOOGLE_DEVELOPER_API_KEY not configured", 500);

    const body = await req.json();
    const { capability, params = {}, body: payload } = body as { capability?: string; params?: any; body?: any };

    if (!capability || capability === "list") {
      return j({
        success: true,
        capabilities: Object.keys(CAPABILITIES),
        note: "Limited to key-auth APIs. IAM / Logging / Storage / TTS need a service-account JSON.",
      });
    }

    const cap = CAPABILITIES[capability];
    if (!cap) return err(`unknown capability: ${capability}`);

    const base = cap.url(params);
    const url = base + (base.includes("?") ? "&" : "?") + "key=" + apiKey;

    const init: RequestInit = { method: cap.method, headers: { "Content-Type": "application/json" } };
    if (cap.method === "POST") init.body = JSON.stringify(payload ?? params);

    const res = await fetch(url, init);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return err(`google[${res.status}]: ${JSON.stringify(data).slice(0, 400)}`, res.status);
    return j({ success: true, capability, data });
  } catch (e) {
    return err(e instanceof Error ? e.message : "unknown", 500);
  }
});