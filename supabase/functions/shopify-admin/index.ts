import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SHOPIFY_STORE = "ceo-brain-orchestra-bozfu.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const ADMIN_API_URL = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}`;

function logStep(step: string, data?: any) {
  console.log(`[Shopify Admin] ${step}`, data ? JSON.stringify(data).slice(0, 300) : "");
}

async function shopifyRequest(endpoint: string, method = "GET", body?: any) {
  const token = Deno.env.get("SHOPIFY_ACCESS_TOKEN") || Deno.env.get("SHOPIFY_DEV_APP_TOKEN");
  if (!token) throw new Error("SHOPIFY_ACCESS_TOKEN not configured");

  const url = `${ADMIN_API_URL}${endpoint}`;
  logStep(`${method} ${endpoint}`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": token,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Shopify ${response.status}: ${errText.slice(0, 500)}`);
  }

  if (response.status === 204) return { success: true };
  return await response.json();
}

// ═══════════════════════════════════════════════════════
// Product Operations
// ═══════════════════════════════════════════════════════

async function listProducts(limit = 50) {
  return await shopifyRequest(`/products.json?limit=${limit}&status=active`);
}

async function getProduct(productId: string) {
  return await shopifyRequest(`/products/${productId}.json`);
}

async function createProduct(productData: any) {
  return await shopifyRequest("/products.json", "POST", { product: productData });
}

async function updateProduct(productId: string, updates: any) {
  return await shopifyRequest(`/products/${productId}.json`, "PUT", { product: { id: Number(productId), ...updates } });
}

async function deleteProduct(productId: string) {
  return await shopifyRequest(`/products/${productId}.json`, "DELETE");
}

// ═══════════════════════════════════════════════════════
// Inventory & Variant Operations
// ═══════════════════════════════════════════════════════

async function updateVariantPrice(variantId: string, price: string, compareAtPrice?: string) {
  const body: any = { variant: { id: Number(variantId), price } };
  if (compareAtPrice) body.variant.compare_at_price = compareAtPrice;
  return await shopifyRequest(`/variants/${variantId}.json`, "PUT", body);
}

async function getInventoryLevels(inventoryItemIds: string[]) {
  return await shopifyRequest(`/inventory_levels.json?inventory_item_ids=${inventoryItemIds.join(",")}`);
}

// ═══════════════════════════════════════════════════════
// Order Operations
// ═══════════════════════════════════════════════════════

async function listOrders(status = "any", limit = 50) {
  return await shopifyRequest(`/orders.json?status=${status}&limit=${limit}`);
}

async function getOrder(orderId: string) {
  return await shopifyRequest(`/orders/${orderId}.json`);
}

// ═══════════════════════════════════════════════════════
// Discount Operations
// ═══════════════════════════════════════════════════════

async function createPriceRule(ruleData: any) {
  return await shopifyRequest("/price_rules.json", "POST", { price_rule: ruleData });
}

async function createDiscountCode(priceRuleId: string, code: string) {
  return await shopifyRequest(`/price_rules/${priceRuleId}/discount_codes.json`, "POST", {
    discount_code: { code },
  });
}

// ═══════════════════════════════════════════════════════
// Collection Operations
// ═══════════════════════════════════════════════════════

async function listCollections() {
  const [smart, custom] = await Promise.all([
    shopifyRequest("/smart_collections.json?limit=50"),
    shopifyRequest("/custom_collections.json?limit=50"),
  ]);
  return {
    smart_collections: smart.smart_collections || [],
    custom_collections: custom.custom_collections || [],
  };
}

// ═══════════════════════════════════════════════════════
// Store Info
// ═══════════════════════════════════════════════════════

async function getShopInfo() {
  return await shopifyRequest("/shop.json");
}

// ═══════════════════════════════════════════════════════
// Bulk Pricing
// ═══════════════════════════════════════════════════════

async function bulkPriceAdjust(adjustmentType: string, value: number, productIds?: string[]) {
  const productsResp = productIds?.length
    ? await Promise.all(productIds.map(id => getProduct(id)))
    : await listProducts(250);

  const products = productIds?.length
    ? productsResp.map((r: any) => r.product)
    : (productsResp as any).products || [];

  const results = [];
  for (const product of products) {
    for (const variant of (product.variants || [])) {
      const oldPrice = parseFloat(variant.price);
      let newPrice: number;
      if (adjustmentType === "percentage_increase") newPrice = oldPrice * (1 + value / 100);
      else if (adjustmentType === "percentage_decrease") newPrice = oldPrice * (1 - value / 100);
      else newPrice = value;

      newPrice = Math.round(newPrice * 100) / 100;

      try {
        await updateVariantPrice(String(variant.id), String(newPrice));
        results.push({ product: product.title, variant: variant.title, old: oldPrice, new: newPrice, success: true });
      } catch (e: any) {
        results.push({ product: product.title, variant: variant.title, error: e.message });
      }
    }
  }
  return { adjustments: results, total: results.length };
}

// ═══════════════════════════════════════════════════════
// Main Router
// ═══════════════════════════════════════════════════════

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    logStep("Action received", { action });

    let result: any;

    switch (action) {
      // Products
      case "list_products":
        result = await listProducts(params.limit);
        break;
      case "get_product":
        result = await getProduct(params.product_id);
        break;
      case "create_product":
        result = await createProduct(params.product);
        break;
      case "update_product":
        result = await updateProduct(params.product_id, params.updates);
        break;
      case "delete_product":
        result = await deleteProduct(params.product_id);
        break;

      // Pricing
      case "update_price":
        result = await updateVariantPrice(params.variant_id, params.price, params.compare_at_price);
        break;
      case "bulk_price_adjust":
        result = await bulkPriceAdjust(params.adjustment_type, params.value, params.product_ids);
        break;

      // Orders
      case "list_orders":
        result = await listOrders(params.status, params.limit);
        break;
      case "get_order":
        result = await getOrder(params.order_id);
        break;

      // Discounts
      case "create_discount":
        const rule = await createPriceRule(params.price_rule);
        const discount = await createDiscountCode(String(rule.price_rule.id), params.code);
        result = { price_rule: rule.price_rule, discount_code: discount.discount_code };
        break;

      // Collections
      case "list_collections":
        result = await listCollections();
        break;

      // Inventory
      case "get_inventory":
        result = await getInventoryLevels(params.inventory_item_ids);
        break;

      // Store Info
      case "shop_info":
        result = await getShopInfo();
        break;

      // Full Status Report
      case "status_report": {
        const shopPromise = getShopInfo();
        const productsPromise = listProducts(250);
        const collectionsPromise = listCollections();
        const ordersPromise = listOrders("any", 10).catch(() => ({ orders: [] }));

        const [shop, products, collections, orders] = await Promise.all([
          shopPromise, productsPromise, collectionsPromise, ordersPromise,
        ]);
        result = {
          shop: shop.shop,
          product_count: (products.products || []).length,
          products: (products.products || []).map((p: any) => ({
            id: p.id, title: p.title, status: p.status,
            variants: (p.variants || []).map((v: any) => ({
              id: v.id, title: v.title, price: v.price, inventory: v.inventory_quantity,
            })),
          })),
          recent_orders: (orders.orders || []).length,
          collections: {
            smart: (collections.smart_collections || []).length,
            custom: (collections.custom_collections || []).length,
          },
        };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
