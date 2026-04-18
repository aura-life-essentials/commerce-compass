// CJ Dropshipping integration: product catalog + auto-fulfillment
// Docs: https://developers.cjdropshipping.com/
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CJ_API_KEY = Deno.env.get("CJ_DROPSHIPPING_API_KEY");
const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// CJ requires an access token obtained via the API key. We cache it in-memory per cold start.
let cachedToken: { token: string; expires: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now()) return cachedToken.token;
  if (!CJ_API_KEY) throw new Error("CJ_DROPSHIPPING_API_KEY is not configured");

  const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "api", password: CJ_API_KEY }),
  });
  const json = await res.json();
  if (!json?.data?.accessToken) {
    // Some CJ accounts use the API key directly as the token
    cachedToken = { token: CJ_API_KEY, expires: Date.now() + 60 * 60 * 1000 };
    return cachedToken.token;
  }
  cachedToken = { token: json.data.accessToken, expires: Date.now() + 60 * 60 * 1000 };
  return cachedToken.token;
}

async function cjRequest(path: string, options: { method?: string; body?: unknown } = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${CJ_BASE}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": token,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();

    switch (action) {
      case "list_products": {
        const { categoryId, pageNum = 1, pageSize = 20, keyword } = params;
        const qs = new URLSearchParams({
          pageNum: String(pageNum),
          pageSize: String(pageSize),
          ...(categoryId && { categoryId }),
          ...(keyword && { productNameEn: keyword }),
        });
        const data = await cjRequest(`/product/list?${qs}`);
        const products = (data?.data?.list || []).map((p: any) => ({
          cj_product_id: p.pid,
          title: p.productNameEn,
          description: p.description || "",
          category: p.categoryName,
          images: p.productImage ? [p.productImage] : [],
          base_cost: parseFloat(p.sellPrice || "0"),
          shipping_cost: 0,
          total_cost: parseFloat(p.sellPrice || "0"),
        }));
        return new Response(JSON.stringify({ success: true, products, total: data?.data?.total ?? products.length }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "import_product": {
        const { product, store_id } = params;
        if (!product || !store_id) throw new Error("product and store_id are required");
        const { data, error } = await supabase
          .from("products")
          .insert({
            store_id,
            title: product.title,
            description: product.description,
            price: product.suggested_price ?? product.base_cost * 2.5,
            images: product.images,
            category: product.category,
            status: "active",
            variants: [{ cj_product_id: product.cj_product_id, base_cost: product.base_cost }],
          })
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, product: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "create_order": {
        // Create a CJ shipping order from one of our paid orders
        const { order_id } = params;
        if (!order_id) throw new Error("order_id is required");

        const { data: order, error: orderErr } = await supabase
          .from("orders")
          .select("*")
          .eq("id", order_id)
          .single();
        if (orderErr || !order) throw orderErr || new Error("Order not found");

        const items = (order.items as any[]) || [];
        const cjPayload = {
          orderNumber: order.id,
          shippingZip: (order.shipping_address as any)?.postal_code,
          shippingCountryCode: (order.shipping_address as any)?.country,
          shippingCountry: (order.shipping_address as any)?.country,
          shippingProvince: (order.shipping_address as any)?.state,
          shippingCity: (order.shipping_address as any)?.city,
          shippingAddress: (order.shipping_address as any)?.line1,
          shippingCustomerName: order.customer_name,
          shippingPhone: order.customer_phone,
          email: order.customer_email,
          remark: "AuraOmega autonomous fulfillment",
          fromCountryCode: "CN",
          logisticName: "CJPacket",
          products: items.map((it) => ({
            vid: it.cj_variant_id || it.product_id,
            quantity: it.quantity,
          })),
        };

        const cjRes = await cjRequest("/shopping/order/createOrder", { method: "POST", body: cjPayload });

        const success = !!cjRes?.data?.orderId;
        await supabase.from("fulfillment_jobs").insert({
          order_id: order.id,
          store_id: order.store_id,
          provider: "cj_dropshipping",
          status: success ? "submitted" : "failed",
          outbound_payload: cjPayload,
          response_payload: cjRes,
          error_message: success ? null : (cjRes?.message || "CJ rejected order"),
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        });

        if (success) {
          await supabase
            .from("orders")
            .update({ fulfillment_status: "submitted", tracking_number: cjRes?.data?.orderNum })
            .eq("id", order.id);
        }

        return new Response(JSON.stringify({ success, cj_response: cjRes }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "track_order": {
        const { cj_order_id } = params;
        const data = await cjRequest(`/logistic/trackInfo?orderId=${cj_order_id}`);
        return new Response(JSON.stringify({ success: true, tracking: data }), {
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
    console.error("[cj-dropshipping]", err);
    return new Response(JSON.stringify({ success: false, error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
