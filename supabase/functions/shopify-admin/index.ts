// Shopify Admin API command router
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SHOPIFY_ACCESS_TOKEN = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const API_VERSION = "2025-07";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function getStoreDomain(): Promise<string> {
  const { data } = await supabase.from("stores").select("domain").limit(1).single();
  if (!data?.domain) throw new Error("No connected Shopify store found in database");
  return data.domain;
}

async function shopifyRequest(path: string, options: { method?: string; body?: unknown } = {}) {
  if (!SHOPIFY_ACCESS_TOKEN) throw new Error("SHOPIFY_ACCESS_TOKEN is not configured");
  const domain = await getStoreDomain();
  const url = `https://${domain}/admin/api/${API_VERSION}${path}`;
  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.errors ? JSON.stringify(json.errors) : `Shopify ${res.status}`);
  return json;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();

    switch (action) {
      case "shop_info": {
        const data = await shopifyRequest("/shop.json");
        return new Response(JSON.stringify({ success: true, data: data.shop }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "status_report": {
        const [shop, products, orders] = await Promise.all([
          shopifyRequest("/shop.json"),
          shopifyRequest("/products/count.json"),
          shopifyRequest("/orders/count.json?status=any"),
        ]);
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              shop: shop.shop,
              product_count: products.count,
              order_count: orders.count,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      case "list_products": {
        const limit = params.limit ?? 50;
        const data = await shopifyRequest(`/products.json?limit=${limit}`);
        return new Response(JSON.stringify({ success: true, data: data.products }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "list_orders": {
        const status = params.status ?? "any";
        const limit = params.limit ?? 20;
        const data = await shopifyRequest(`/orders.json?status=${status}&limit=${limit}`);
        return new Response(JSON.stringify({ success: true, data: data.orders }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "create_product": {
        const data = await shopifyRequest("/products.json", { method: "POST", body: { product: params.product } });
        return new Response(JSON.stringify({ success: true, data: data.product }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "list_collections": {
        const data = await shopifyRequest("/custom_collections.json?limit=50");
        return new Response(JSON.stringify({ success: true, data: data.custom_collections }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "bulk_price_adjust": {
        const products = await shopifyRequest("/products.json?limit=250");
        let updated = 0;
        for (const p of products.products) {
          for (const v of p.variants) {
            const current = parseFloat(v.price);
            const next =
              params.adjustment_type === "percentage_increase"
                ? current * (1 + params.value / 100)
                : current * (1 - params.value / 100);
            await shopifyRequest(`/variants/${v.id}.json`, {
              method: "PUT",
              body: { variant: { id: v.id, price: next.toFixed(2) } },
            });
            updated++;
          }
        }
        return new Response(JSON.stringify({ success: true, data: { variants_updated: updated } }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "create_discount": {
        const rule = await shopifyRequest("/price_rules.json", { method: "POST", body: { price_rule: params.price_rule } });
        const code = await shopifyRequest(`/price_rules/${rule.price_rule.id}/discount_codes.json`, {
          method: "POST",
          body: { discount_code: { code: params.code } },
        });
        return new Response(JSON.stringify({ success: true, data: { rule: rule.price_rule, code: code.discount_code } }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      default:
        return new Response(JSON.stringify({ success: false, error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    console.error("[shopify-admin]", err);
    return new Response(JSON.stringify({ success: false, error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
