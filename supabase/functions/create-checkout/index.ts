import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRODUCT_PRICE_MAP: Record<string, string> = {
  "wireless-earbuds-pro": "price_1StjbfFjshJghowTMCSHB90t",
  "portable-neck-fan-360": "price_1Stjc8FjshJghowTRJA47tX1",
  "led-galaxy-projector": "price_1StjcDFjshJghowTuoy0LUGk",
  "led-strip-lights-rgb": "price_1StjcEFjshJghowT3QrWS8eY",
  "mini-projector-hd": "price_1StjcGFjshJghowTFMPHk6rD",
};

interface CartItem {
  productId: string;
  quantity: number;
  title?: string;
  price?: number;
  compareAtPrice?: number | null;
}

interface CheckoutRequest {
  items?: CartItem[];
  productId?: string;
  quantity?: number;
  customerEmail?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const DEFAULT_MARGIN_MULTIPLIER = 1.28;
const DEFAULT_COMPETITOR_MULTIPLIER = 1.22;
const MAX_UNDERCUT_PERCENT = 0.035;

const roundPsychologicalPrice = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value < 10) return Number((Math.floor(value) + 0.99).toFixed(2));
  return Number((Math.max(Math.round(value) - 0.01, 0.99)).toFixed(2));
};

const getOptimizedPrice = (basePrice: number, compareAtPrice?: number | null) => {
  if (!Number.isFinite(basePrice) || basePrice <= 0) return 0;
  const normalizedCompareAt = compareAtPrice && compareAtPrice > basePrice ? compareAtPrice : null;
  const competitorPrice = normalizedCompareAt ?? Number((basePrice * DEFAULT_COMPETITOR_MULTIPLIER).toFixed(2));
  const targetBelowCompetitor = competitorPrice * (1 - MAX_UNDERCUT_PERCENT);
  const marginFloorPrice = Number((basePrice * DEFAULT_MARGIN_MULTIPLIER).toFixed(2));
  const floor = Math.max(basePrice, marginFloorPrice);
  const ceiling = Math.max(floor, competitorPrice - 0.01);
  return roundPsychologicalPrice(clamp(targetBelowCompetitor, floor, ceiling));
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CheckoutRequest = await req.json();

    if (body.items && body.items.length > 50) {
      throw new Error("Maximum 50 items per checkout");
    }

    if (body.customerEmail && (typeof body.customerEmail !== "string" || body.customerEmail.length > 255)) {
      throw new Error("Invalid customer email");
    }

    console.log("[CREATE-CHECKOUT] Request received:", JSON.stringify({ itemCount: body.items?.length, productId: body.productId }));

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const normalizedItems = body.items ?? [];

    if (normalizedItems.length > 0) {
      for (const item of normalizedItems) {
        const priceId = PRODUCT_PRICE_MAP[item.productId];

        if (priceId) {
          lineItems.push({
            price: priceId,
            quantity: item.quantity,
          });
          continue;
        }

        if (item.price && item.title) {
          const optimizedPrice = getOptimizedPrice(item.price, item.compareAtPrice);
          lineItems.push({
            price_data: {
              currency: "usd",
              product_data: {
                name: item.title,
                metadata: {
                  source_product_id: item.productId,
                  base_price: String(item.price),
                  compare_at_price: item.compareAtPrice ? String(item.compareAtPrice) : '',
                  optimized_price: String(optimizedPrice),
                },
              },
              unit_amount: Math.round(optimizedPrice * 100),
            },
            quantity: item.quantity,
          });
          continue;
        }

        console.warn(`[CREATE-CHECKOUT] Skipping item - no price mapping and no price data:`, item.productId);
      }
    } else if (body.productId) {
      const priceId = PRODUCT_PRICE_MAP[body.productId] || body.productId;
      lineItems.push({
        price: priceId,
        quantity: body.quantity || 1,
      });
    }

    if (lineItems.length === 0) {
      throw new Error("No valid items to checkout");
    }

    let customerId: string | undefined;
    if (body.customerEmail) {
      const customers = await stripe.customers.list({ email: body.customerEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    const origin = req.headers.get("origin") || "https://id-preview--3fac0efa-0c53-4f2d-b77e-e310ba7a0ae5.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : body.customerEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/store?checkout=canceled`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP'],
      },
      metadata: {
        source: "trendvault-store",
        itemCount: String(lineItems.length),
        dynamicPricing: normalizedItems.length > 0 ? 'true' : 'false',
      },
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    await supabase.from("agent_logs").insert({
      agent_name: "Stripe Checkout",
      agent_role: "Payment Processing",
      action: `Created checkout session with ${lineItems.length} items`,
      status: "completed",
      details: {
        sessionId: session.id,
        itemCount: lineItems.length,
        totalItems: normalizedItems.reduce((sum, item) => sum + item.quantity, 0) || body.quantity || 1,
      },
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-CHECKOUT] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
