import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const stripe = new Stripe(STRIPE_SECRET_KEY || "", { apiVersion: "2025-08-27.basil" });

const logStep = (step: string, details?: unknown) => {
  console.log(`[STRIPE-WEBHOOK] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    if (!STRIPE_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: (err as Error).message });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment succeeded", {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          customer: paymentIntent.customer
        });

        const { error } = await supabase.from("stripe_transactions").insert({
          stripe_payment_id: paymentIntent.id,
          stripe_customer_id: paymentIntent.customer as string,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: "succeeded",
          customer_email: paymentIntent.receipt_email,
          metadata: paymentIntent.metadata,
        });

        if (error) logStep("Error saving transaction", error);

        if (paymentIntent.metadata?.utm_source) {
          await supabase.from("traffic_webhooks").insert({
            webhook_type: "purchase",
            source: paymentIntent.metadata.utm_source,
            country: paymentIntent.metadata.country,
            revenue: paymentIntent.amount / 100,
            utm_data: paymentIntent.metadata,
            processed: true,
          });
        }

        await supabase.from("ai_decisions").insert({
          decision_type: "payment_received",
          input_data: { payment_id: paymentIntent.id, amount: paymentIntent.amount / 100 },
          output_action: { status: "success", revenue_added: paymentIntent.amount / 100 },
          revenue_impact: paymentIntent.amount / 100,
          executed: true,
        });

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment failed", { id: paymentIntent.id });

        await supabase.from("stripe_transactions").insert({
          stripe_payment_id: paymentIntent.id,
          stripe_customer_id: paymentIntent.customer as string,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: "failed",
          metadata: { failure_message: paymentIntent.last_payment_error?.message },
        });

        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", {
          id: session.id,
          amount: session.amount_total,
          customer_email: session.customer_email
        });

        await supabase.from("stripe_transactions").insert({
          stripe_payment_id: session.payment_intent as string,
          stripe_customer_id: session.customer as string,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || "usd",
          status: "succeeded",
          customer_email: session.customer_email,
          customer_country: session.customer_details?.address?.country,
          metadata: session.metadata,
        });

        await supabase.from("traffic_webhooks").insert({
          webhook_type: "conversion",
          source: session.metadata?.source || "direct",
          country: session.customer_details?.address?.country,
          revenue: (session.amount_total || 0) / 100,
          utm_data: session.metadata,
          processed: true,
        });

        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription created", { id: subscription.id, customer: subscription.customer });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice paid", { id: invoice.id, amount: invoice.amount_paid });

        await supabase.from("stripe_transactions").insert({
          stripe_payment_id: invoice.payment_intent as string,
          stripe_customer_id: invoice.customer as string,
          amount: invoice.amount_paid / 100,
          currency: invoice.currency,
          status: "succeeded",
          customer_email: invoice.customer_email,
          metadata: { invoice_id: invoice.id, subscription_id: invoice.subscription },
        });

        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    logStep("Error processing webhook", { message: (error as Error).message });
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});