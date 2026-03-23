import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type FirecrawlSearchResult = {
  url?: string;
  title?: string;
  description?: string;
  markdown?: string;
};

type IntelligenceSynthesis = {
  summary: string;
  themes: string[];
  opportunities: string[];
  threats: string[];
  watchlist: string[];
};

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizeBrands(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return value
    .map((item) => sanitizeText(item, 40))
    .filter(Boolean)
    .slice(0, 8);
}

async function searchFirecrawl(apiKey: string, query: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit: 4,
        scrapeOptions: {
          formats: ["markdown"],
        },
      }),
      signal: controller.signal,
    });

    const data = await response.json();
    if (response.status === 402) {
      throw new Error("Firecrawl credits required for live scanning.");
    }
    if (response.status === 429) {
      throw new Error("Firecrawl rate limit reached. Try again shortly.");
    }
    if (!response.ok) {
      throw new Error(data?.error || `Firecrawl search failed with status ${response.status}`);
    }

    return (data?.data || []) as FirecrawlSearchResult[];
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Firecrawl scan timed out. Please retry.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function summarizeWithLovable(query: string, brands: string[], signals: FirecrawlSearchResult[]) {
  const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
  if (!XAI_API_KEY) throw new Error("XAI_API_KEY not configured");
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const compactSignals = signals.slice(0, 8).map((signal) => ({
    title: sanitizeText(signal.title, 120),
    url: sanitizeText(signal.url, 240),
    description: sanitizeText(signal.description, 280),
    markdown: sanitizeText(signal.markdown, 1200),
  }));

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a market intelligence strategist for an all-in-one Web3 operating system. Analyze live competitor signals and return concise executive output for platform, social, creator, commerce, community, and growth positioning. Keep every item sharp, specific, and action-oriented.",
        },
        {
          role: "user",
          content: JSON.stringify({ query, brands, signals: compactSignals }),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "apex_intelligence",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: { type: "string" },
              themes: {
                type: "array",
                items: { type: "string" },
                maxItems: 5,
              },
              opportunities: {
                type: "array",
                items: { type: "string" },
                maxItems: 5,
              },
              threats: {
                type: "array",
                items: { type: "string" },
                maxItems: 5,
              },
              watchlist: {
                type: "array",
                items: { type: "string" },
                maxItems: 4,
              },
            },
            required: ["summary", "themes", "opportunities", "threats", "watchlist"],
          },
        },
      },
    }),
  });

  if (response.status === 402) {
    throw new Error("AI credits required for competitor synthesis.");
  }
  if (response.status === 429) {
    throw new Error("AI rate limit reached. Try again shortly.");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Failed to synthesize intelligence");
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No intelligence summary returned");
  }

  return JSON.parse(content) as IntelligenceSynthesis;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY is not configured");
    }

    const body = await req.json();
    const query = sanitizeText(body?.query, 180);
    const brands = normalizeBrands(body?.brands);

    if (query.length < 8) {
      return new Response(JSON.stringify({ error: "Query must be at least 8 characters." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const searchQueries = [
      query,
      ...brands.map((brand) => `${brand} web3 platform social commerce growth`),
    ].slice(0, 5);

    const settledResults = await Promise.allSettled(searchQueries.map((item) => searchFirecrawl(FIRECRAWL_API_KEY, item)));
    const failures = settledResults
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => result.reason instanceof Error ? result.reason.message : "Search failed");

    const searchResults = settledResults
      .filter((result): result is PromiseFulfilledResult<FirecrawlSearchResult[]> => result.status === "fulfilled")
      .flatMap((result) => result.value)
      .filter((result) => result.url && result.title)
      .filter((result, index, array) => array.findIndex((item) => item.url === result.url) === index)
      .slice(0, 10);

    if (!searchResults.length && failures.length) {
      throw new Error(failures[0]);
    }

    const synthesis = await summarizeWithLovable(query, brands, searchResults);

    const signals = searchResults.slice(0, 6).map((result) => ({
      title: sanitizeText(result.title, 120),
      url: sanitizeText(result.url, 240),
      snippet: sanitizeText(result.description || result.markdown || "", 240),
      source: (() => {
        try {
          const parsed = new URL(String(result.url));
          return parsed.hostname.replace(/^www\./, "");
        } catch {
          return "web";
        }
      })(),
    }));

    return new Response(
      JSON.stringify({
        ...synthesis,
        signals,
        meta: {
          searchQueries,
          sourcesScanned: searchResults.length,
          partialFailure: failures.length > 0,
          warnings: failures.slice(0, 3),
          generatedAt: new Date().toISOString(),
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
