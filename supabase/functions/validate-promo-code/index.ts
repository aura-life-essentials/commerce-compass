import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VALIDATE-PROMO-CODE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { code } = await req.json();
    if (!code) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Promo code is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Look up the promotion code in Stripe
    const promotionCodes = await stripe.promotionCodes.list({
      code: code.toUpperCase().trim(),
      active: true,
      limit: 1,
    });

    if (promotionCodes.data.length === 0) {
      logStep("Promo code not found", { code });
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "Invalid or expired promo code" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const promoCode = promotionCodes.data[0];
    const coupon = promoCode.coupon;

    // Check if coupon is still valid
    if (!coupon.valid) {
      logStep("Coupon no longer valid", { code });
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "This promo code has expired" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check max redemptions
    if (promoCode.max_redemptions && promoCode.times_redeemed >= promoCode.max_redemptions) {
      logStep("Max redemptions reached", { code });
      return new Response(JSON.stringify({ 
        valid: false, 
        error: "This promo code has reached its maximum uses" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Build discount info
    let discountText = "";
    if (coupon.percent_off) {
      discountText = `${coupon.percent_off}% off`;
    } else if (coupon.amount_off) {
      discountText = `$${(coupon.amount_off / 100).toFixed(2)} off`;
    }

    if (coupon.duration === 'repeating' && coupon.duration_in_months) {
      discountText += ` for ${coupon.duration_in_months} months`;
    } else if (coupon.duration === 'forever') {
      discountText += ` forever`;
    } else if (coupon.duration === 'once') {
      discountText += ` (first payment)`;
    }

    logStep("Promo code validated successfully", { 
      code, 
      discount: discountText,
      couponId: coupon.id 
    });

    return new Response(JSON.stringify({ 
      valid: true,
      code: promoCode.code,
      discount: discountText,
      percent_off: coupon.percent_off,
      amount_off: coupon.amount_off ? coupon.amount_off / 100 : null,
      duration: coupon.duration,
      duration_in_months: coupon.duration_in_months,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in validate-promo-code", { message: errorMessage });
    return new Response(JSON.stringify({ 
      valid: false, 
      error: "Failed to validate promo code" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
