import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Stripe product/price mappings
const PRODUCT_PRICES: Record<string, string> = {
  "wireless-earbuds-pro": "price_1StjbfFjshJghowTMCSHB90t",
  "portable-neck-fan-360": "price_1Stjc8FjshJghowTRJA47tX1",
  "led-galaxy-projector": "price_1StjcDFjshJghowTuoy0LUGk",
  "led-strip-lights-rgb": "price_1StjcEFjshJghowT3QrWS8eY",
  "mini-projector-hd": "price_1StjcGFjshJghowTFMPHk6rD",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, quantity = 1, customerEmail } = await req.json();
    console.log("[CREATE-CHECKOUT] Request received:", { productId, quantity, customerEmail });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get price ID from product mapping or use provided price ID
    const priceId = PRODUCT_PRICES[productId] || productId;
    console.log("[CREATE-CHECKOUT] Using price ID:", priceId);

    // Check for existing customer
    let customerId: string | undefined;
    if (customerEmail) {
      const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log("[CREATE-CHECKOUT] Found existing customer:", customerId);
      }
    }

    const origin = req.headers.get("origin") || "https://id-preview--3fac0efa-0c53-4f2d-b77e-e310ba7a0ae5.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=canceled`,
      metadata: {
        source: "ceo-brain-dashboard",
        productId: productId,
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
      action: `Created checkout session for ${productId}`,
      status: "completed",
      details: { sessionId: session.id, priceId, quantity },
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
