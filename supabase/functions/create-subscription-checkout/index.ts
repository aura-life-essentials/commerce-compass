import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { priceId, tierId, promoCode } = await req.json();
    if (!priceId) throw new Error("Price ID is required");
    logStep("Received request", { priceId, tierId, promoCode });

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    const origin = req.headers.get("origin") || "https://lovable.dev";
    
    // Build checkout session config with 5-day free trial (card required upfront)
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      payment_method_collection: 'always',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 5,
        metadata: {
          user_id: user.id,
          tier_id: tierId,
        },
      },
      success_url: `${origin}/subscription-success?tier=${tierId}&trial=true`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        user_id: user.id,
        tier_id: tierId,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
      custom_text: {
        submit: {
          message: 'Start your 5-day free trial. Your card will be charged after the trial ends.',
        },
        terms_of_service_acceptance: {
          message: 'I agree to the [Terms of Service](https://profitreaper.com/terms)',
        },
      },
      consent_collection: {
        terms_of_service: 'required',
      },
    };

    // Apply promo code if provided
    if (promoCode) {
      try {
        const promotionCodes = await stripe.promotionCodes.list({
          code: promoCode,
          active: true,
          limit: 1,
        });
        
        if (promotionCodes.data.length > 0) {
          sessionConfig.discounts = [{ promotion_code: promotionCodes.data[0].id }];
          // Remove allow_promotion_codes when using discounts
          delete sessionConfig.allow_promotion_codes;
          logStep("Applied promo code", { promoCode, promotionCodeId: promotionCodes.data[0].id });
        } else {
          logStep("Promo code not found or inactive", { promoCode });
        }
      } catch (promoError) {
        logStep("Error looking up promo code", { error: (promoError as Error).message });
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created with 5-day trial", { 
      sessionId: session.id, 
      url: session.url,
      trialDays: 5,
      hasPromo: !!promoCode 
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-subscription-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
