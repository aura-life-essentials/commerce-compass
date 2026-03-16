import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CJ_API_BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const PROFIT_MARGIN = 0.67; // 67% profit margin
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function requireAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await authClient.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return data.claims.sub;
}

// CJ API returns different structures for different endpoints
interface CJProductV1 {
  pid: string;
  productNameEn: string;
  productImage: string;
  sellPrice: number;
  categoryName: string;
  description: string;
  variants: any[];
}

interface CJProductV2 {
  id: string;
  sku: string;
  nameEn: string;
  bigImage: string;
  sellPrice: string;
  categoryName?: string;
  description?: string;
}

interface CJVariant {
  vid: string;
  variantNameEn: string;
  variantSellPrice: number;
  variantImage: string;
}

// Normalize different CJ API response structures
function normalizeCJProduct(raw: any): { pid: string; productNameEn: string; productImage: string; sellPrice: number; categoryName: string; description: string; variants: any[] } {
  // Handle listV2 response structure
  if (raw.id && raw.nameEn) {
    // Parse sell price - can be "0.80" or "2.13 -- 7.21" (price range)
    let price = 0;
    if (typeof raw.sellPrice === 'string') {
      const priceStr = raw.sellPrice.split('--')[0].trim();
      price = parseFloat(priceStr) || 0;
    } else {
      price = raw.sellPrice || 0;
    }
    
    return {
      pid: raw.id,
      productNameEn: raw.nameEn,
      productImage: raw.bigImage || '',
      sellPrice: price,
      categoryName: raw.categoryName || 'General',
      description: raw.description || '',
      variants: [],
    };
  }
  
  // Handle v1 list response structure
  return {
    pid: raw.pid,
    productNameEn: raw.productNameEn,
    productImage: raw.productImage,
    sellPrice: parseFloat(raw.sellPrice) || 0,
    categoryName: raw.categoryName || 'General',
    description: raw.description || '',
    variants: raw.variants || [],
  };
}

interface ProductWithPricing {
  cj_product_id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  base_cost: number;
  shipping_cost: number;
  total_cost: number;
  customer_price: number;
  profit: number;
  profit_margin: number;
  variants: VariantWithPricing[];
}

interface VariantWithPricing {
  cj_variant_id: string;
  name: string;
  base_cost: number;
  customer_price: number;
  profit: number;
}

// Calculate customer price with 67% profit margin
function calculatePricing(baseCost: number, shippingCost: number = 0) {
  const totalCost = baseCost + shippingCost;
  const customerPrice = totalCost * (1 + PROFIT_MARGIN);
  const profit = customerPrice - totalCost;
  
  return {
    totalCost: Math.round(totalCost * 100) / 100,
    customerPrice: Math.round(customerPrice * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    profitMargin: PROFIT_MARGIN * 100,
  };
}

// Get access token from CJ API (required before making other calls)
async function getAccessToken(apiKey: string): Promise<string> {
  console.log("[CJ] Exchanging API key for access token...");
  
  const response = await fetch(`${CJ_API_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ apiKey }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[CJ] Token exchange failed:", errorText);
    throw new Error(`CJ Token Exchange Error: ${response.status}`);
  }

  const data = await response.json();
  console.log("[CJ] Token response:", JSON.stringify(data));
  
  if (!data.data?.accessToken) {
    throw new Error(`CJ Token Error: ${data.message || "No access token returned"}`);
  }
  
  return data.data.accessToken;
}

// Fetch products from Aura Dropshipping API using listV2 (better search)
async function fetchCJProducts(accessToken: string, categoryId?: string, pageNum: number = 1, pageSize: number = 20, keyword?: string) {
  // Try listV2 first (better for keyword search), fallback to list
  const useV2 = Boolean(keyword);
  const endpoint = useV2 ? `${CJ_API_BASE}/product/listV2` : `${CJ_API_BASE}/product/list`;
  
  const url = new URL(endpoint);
  url.searchParams.set("page", pageNum.toString());
  url.searchParams.set("size", pageSize.toString());
  
  if (categoryId) {
    url.searchParams.set("categoryId", categoryId);
  }
  if (keyword) {
    url.searchParams.set("keyWord", keyword);
  }

  console.log("[CJ] Fetching products from:", url.toString());
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "CJ-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[CJ] Product list error:", errorText);
    throw new Error(`CJ API Error: ${response.status}`);
  }

  const data = await response.json();
  console.log("[CJ] API Response:", JSON.stringify(data).slice(0, 500));
  
  // Handle different response structures
  if (useV2 && data.data?.content?.[0]?.productList) {
    return { data: { list: data.data.content[0].productList, total: data.data.total || 0 } };
  }
  
  console.log("[CJ] Fetched", data.data?.list?.length || 0, "products");
  return data;
}

// Get product details with variants
async function getProductDetails(accessToken: string, productId: string) {
  const response = await fetch(`${CJ_API_BASE}/product/query`, {
    method: "POST",
    headers: {
      "CJ-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pid: productId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch product details: ${response.status}`);
  }

  return await response.json();
}

// Get shipping cost estimate
async function getShippingCost(accessToken: string, productId: string, countryCode: string = "US") {
  try {
    const response = await fetch(`${CJ_API_BASE}/logistic/freightCalculate`, {
      method: "POST",
      headers: {
        "CJ-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startCountryCode: "CN",
        endCountryCode: countryCode,
        products: [{ pid: productId, quantity: 1 }],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const cheapest = data.data.reduce((min: any, curr: any) => 
          curr.logisticPrice < min.logisticPrice ? curr : min
        );
        return cheapest.logisticPrice || 0;
      }
    }
    return 3.50;
  } catch (error) {
    console.error("Error fetching shipping cost:", error);
    return 3.50;
  }
}

// Transform CJ product to our format with pricing
async function transformProduct(accessToken: string, rawProduct: any): Promise<ProductWithPricing> {
  const product = normalizeCJProduct(rawProduct);
  const shippingCost = await getShippingCost(accessToken, product.pid);
  const pricing = calculatePricing(product.sellPrice, shippingCost);

  const variants: VariantWithPricing[] = (product.variants || []).map((variant: CJVariant) => {
    const variantPricing = calculatePricing(variant.variantSellPrice, shippingCost);
    return {
      cj_variant_id: variant.vid,
      name: variant.variantNameEn,
      base_cost: variant.variantSellPrice,
      customer_price: variantPricing.customerPrice,
      profit: variantPricing.profit,
    };
  });

  return {
    cj_product_id: product.pid,
    title: product.productNameEn,
    description: product.description || "",
    category: product.categoryName || "General",
    images: [product.productImage],
    base_cost: product.sellPrice,
    shipping_cost: shippingCost,
    total_cost: pricing.totalCost,
    customer_price: pricing.customerPrice,
    profit: pricing.profit,
    profit_margin: pricing.profitMargin,
    variants,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await requireAuthenticatedUser(req);
    const CJ_API_KEY = Deno.env.get("CJ_DROPSHIPPING_API_KEY");
    
    if (!CJ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Aura Dropshipping API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, storeId, categoryId, productId, pageNum, pageSize, keyword } = await req.json();

    // Get access token first (required for all CJ API calls)
    const accessToken = await getAccessToken(CJ_API_KEY);
    console.log("[CJ] Got access token successfully");

    switch (action) {
      case "list_products": {
        // Fetch products from CJ
        const cjResponse = await fetchCJProducts(accessToken, categoryId, pageNum || 1, pageSize || 20, keyword);
        
        if (!cjResponse.data || !cjResponse.data.list) {
          return new Response(
            JSON.stringify({ products: [], total: 0 }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Transform products with pricing (normalize the CJ API response)
        const productsWithPricing = await Promise.all(
          cjResponse.data.list.map((product: any) => transformProduct(accessToken, product))
        );

        return new Response(
          JSON.stringify({
            products: productsWithPricing,
            total: cjResponse.data.total,
            pageNum: pageNum || 1,
            pageSize: pageSize || 20,
            profitMargin: PROFIT_MARGIN * 100,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "import_product": {
        if (!storeId || !productId) {
          return new Response(
            JSON.stringify({ error: "storeId and productId are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get product details
        const productDetails = await getProductDetails(accessToken, productId);
        
        if (!productDetails.data) {
          return new Response(
            JSON.stringify({ error: "Product not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const transformedProduct = await transformProduct(accessToken, productDetails.data);

        // Insert into our products table
        const { data: insertedProduct, error: insertError } = await supabase
          .from("products")
          .insert({
            store_id: storeId,
            title: transformedProduct.title,
            description: transformedProduct.description,
            category: transformedProduct.category,
            price: transformedProduct.customer_price,
            compare_at_price: transformedProduct.customer_price * 1.2, // Show "discount"
            images: transformedProduct.images,
            variants: transformedProduct.variants,
            status: "active",
            tags: ["aura-dropshipping", "auto-sourced"],
          })
          .select()
          .single();

        if (insertError) {
          console.error("Insert error:", insertError);
          return new Response(
            JSON.stringify({ error: "Failed to import product" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Log the agent action
        await supabase.from("agent_logs").insert({
          store_id: storeId,
          agent_name: "Profit Reaper",
          agent_role: "Product Sourcing",
          action: `Imported product: ${transformedProduct.title}`,
          status: "completed",
          details: {
            cj_product_id: productId,
            base_cost: transformedProduct.base_cost,
            customer_price: transformedProduct.customer_price,
            profit: transformedProduct.profit,
            profit_margin: transformedProduct.profit_margin,
          },
        });

        return new Response(
          JSON.stringify({
            success: true,
            product: insertedProduct,
            pricing: {
              baseCost: transformedProduct.base_cost,
              shippingCost: transformedProduct.shipping_cost,
              customerPrice: transformedProduct.customer_price,
              profit: transformedProduct.profit,
              profitMargin: transformedProduct.profit_margin,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "sync_all_stores": {
        // Get all connected stores
        const { data: stores, error: storesError } = await supabase
          .from("stores")
          .select("id, name")
          .eq("status", "connected");

        if (storesError || !stores) {
          return new Response(
            JSON.stringify({ error: "Failed to fetch stores" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Fetch trending products
        const cjResponse = await fetchCJProducts(accessToken, undefined, 1, 10);
        const products = cjResponse.data?.list || [];

        const results = [];
        
        for (const store of stores) {
          // Import top products to each store
          for (const product of products.slice(0, 5)) {
            const transformed = await transformProduct(accessToken, product);
            
            const { error } = await supabase.from("products").upsert({
              store_id: store.id,
              title: transformed.title,
              description: transformed.description,
              category: transformed.category,
              price: transformed.customer_price,
              images: transformed.images,
              status: "active",
              tags: ["aura-dropshipping", "auto-sourced"],
            }, {
              onConflict: "store_id,title",
            });

            if (!error) {
              results.push({
                store: store.name,
                product: transformed.title,
                price: transformed.customer_price,
                profit: transformed.profit,
              });
            }
          }

          // Update store sync timestamp
          await supabase
            .from("stores")
            .update({ last_synced_at: new Date().toISOString() })
            .eq("id", store.id);

          // Log sync activity
          await supabase.from("agent_logs").insert({
            store_id: store.id,
            agent_name: "Omega Sync",
            agent_role: "Store Synchronization",
            action: `Synced products from Aura Dropshipping`,
            status: "completed",
            details: { productsImported: 5, profitMargin: PROFIT_MARGIN * 100 },
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            storesSynced: stores.length,
            productsImported: results.length,
            results,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "calculate_price": {
        const { baseCost, shippingCost } = await req.json();
        const pricing = calculatePricing(baseCost || 0, shippingCost || 0);
        
        return new Response(
          JSON.stringify(pricing),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
