import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map product IDs to Stripe price IDs
const PRODUCT_PRICE_MAP: Record<string, string> = {
  // Existing mapped products
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
}

interface CheckoutRequest {
  items?: CartItem[];
  productId?: string;
  quantity?: number;
  customerEmail?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CheckoutRequest = await req.json();
    
    // Input validation
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

    // Handle both single product and cart checkout
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (body.items && body.items.length > 0) {
      // Multi-item cart checkout
      console.log("[CREATE-CHECKOUT] Processing cart with", body.items.length, "items");
      
      for (const item of body.items) {
        const priceId = PRODUCT_PRICE_MAP[item.productId];
        
        if (priceId) {
          // Use existing Stripe price
          lineItems.push({
            price: priceId,
            quantity: item.quantity,
          });
        } else if (item.price && item.title) {
          // Create price_data for products not in Stripe
          lineItems.push({
            price_data: {
              currency: "usd",
              product_data: {
                name: item.title,
              },
              unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity,
          });
        } else {
          console.warn(`[CREATE-CHECKOUT] Skipping item - no price mapping and no price data:`, item.productId);
        }
      }
    } else if (body.productId) {
      // Single product checkout (backward compatibility)
      const priceId = PRODUCT_PRICE_MAP[body.productId] || body.productId;
      lineItems.push({
        price: priceId,
        quantity: body.quantity || 1,
      });
    }

    if (lineItems.length === 0) {
      throw new Error("No valid items to checkout");
    }

    console.log("[CREATE-CHECKOUT] Line items:", JSON.stringify(lineItems));

    // Check for existing Stripe customer
    let customerId: string | undefined;
    if (body.customerEmail) {
      const customers = await stripe.customers.list({ email: body.customerEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log("[CREATE-CHECKOUT] Found existing customer:", customerId);
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
      },
    });

    console.log("[CREATE-CHECKOUT] Session created:", session.id);

    // Log to database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabase.from("agent_logs").insert({
      agent_name: "Stripe Checkout",
      agent_role: "Payment Processing",
      action: `Created checkout session with ${lineItems.length} items`,
      status: "completed",
      details: { 
        sessionId: session.id, 
        itemCount: lineItems.length,
        totalItems: body.items?.reduce((sum, item) => sum + item.quantity, 0) || body.quantity || 1,
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
