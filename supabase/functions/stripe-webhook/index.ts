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

const normalizeStripeValue = (value: string | Stripe.DeletedCustomer | Stripe.Customer | null | undefined) => {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
};

const upsertStripeTransaction = async ({
  stripePaymentId,
  stripeCustomerId,
  amount,
  currency,
  status,
  customerEmail,
  customerCountry,
  metadata,
}: {
  stripePaymentId: string | null;
  stripeCustomerId?: string | null;
  amount: number;
  currency: string | null;
  status: string;
  customerEmail?: string | null;
  customerCountry?: string | null;
  metadata?: Record<string, unknown> | null;
}) => {
  if (!stripePaymentId) {
    logStep("Skipping transaction upsert without stripe payment id");
    return;
  }

  const { data: existing, error: lookupError } = await supabase
    .from("stripe_transactions")
    .select("id")
    .eq("stripe_payment_id", stripePaymentId)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  const payload = {
    stripe_payment_id: stripePaymentId,
    stripe_customer_id: stripeCustomerId ?? null,
    amount,
    currency,
    status,
    customer_email: customerEmail ?? null,
    customer_country: customerCountry ?? null,
    metadata: metadata ?? {},
  };

  if (existing?.id) {
    const { error } = await supabase
      .from("stripe_transactions")
      .update(payload)
      .eq("id", existing.id);

    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("stripe_transactions").insert(payload);
  if (error) throw error;
};

const upsertOrderFromCheckoutSession = async (session: Stripe.Checkout.Session) => {
  if (session.mode !== "payment") return;

  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;

  if (!paymentIntentId) {
    logStep("Skipping order upsert without payment intent", { sessionId: session.id });
    return;
  }

  const { data: lineItemsResponse, error: lineItemsError } = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price.product"],
  });

  if (lineItemsError) {
    throw lineItemsError;
  }

  const items = lineItemsResponse.data.map((item: any) => ({
    product_id: item.price?.id ?? item.description ?? "unknown",
    title: item.description ?? (typeof item.price?.product !== "string" ? item.price?.product?.name : "Product"),
    price: item.amount_total ? item.amount_total / 100 / Math.max(item.quantity ?? 1, 1) : 0,
    quantity: item.quantity ?? 1,
  }));

  const payload = {
    user_id: session.metadata?.user_id ?? null,
    stripe_payment_id: paymentIntentId,
    stripe_customer_id: normalizeStripeValue(session.customer),
    customer_email: session.customer_details?.email ?? session.customer_email ?? "unknown@example.com",
    customer_name: session.customer_details?.name ?? null,
    customer_phone: session.customer_details?.phone ?? null,
    shipping_address: session.shipping_details?.address ?? null,
    billing_address: session.customer_details?.address ?? null,
    items,
    subtotal: ((session.amount_subtotal ?? session.amount_total ?? 0) / 100),
    shipping_cost: 0,
    tax_amount: ((session.total_details?.amount_tax ?? 0) / 100),
    discount_amount: ((session.total_details?.amount_discount ?? 0) / 100),
    total_amount: ((session.amount_total ?? 0) / 100),
    currency: session.currency ?? "usd",
    status: "paid",
    fulfillment_status: "pending",
    metadata: {
      ...session.metadata,
      checkout_session_id: session.id,
      payment_status: session.payment_status,
    },
  };

  const { data: existing, error: lookupError } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_payment_id", paymentIntentId)
    .maybeSingle();

  if (lookupError) throw lookupError;

  if (existing?.id) {
    const { error } = await supabase.from("orders").update(payload).eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { data: inserted, error } = await supabase.from("orders").insert(payload).select("id").single();
  if (error) throw error;

  // 🚀 Auto-dispatch to CJ Dropshipping fulfillment
  if (inserted?.id) {
    try {
      const cjRes = await fetch(`${SUPABASE_URL}/functions/v1/cj-dropshipping`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ action: "create_order", order_id: inserted.id }),
      });
      const cjJson = await cjRes.json();
      logStep("CJ fulfillment dispatched", { order_id: inserted.id, ok: cjJson?.success });
    } catch (cjErr) {
      logStep("CJ fulfillment dispatch failed", { error: (cjErr as Error).message });
    }
  }
};

const upsertSubscriptionRecord = async (subscription: Stripe.Subscription) => {
  const customerId = normalizeStripeValue(subscription.customer);
  const userId = subscription.metadata?.user_id ?? null;
  const tierId = subscription.metadata?.tier_id ?? null;
  const productId = subscription.items.data[0]?.price?.product;

  const payload = {
    user_id: userId,
    tier: tierId ?? (typeof productId === "string" ? productId : "unknown"),
    status: subscription.status,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    current_period_start: subscription.items.data[0]?.current_period_start
      ? new Date(subscription.items.data[0].current_period_start * 1000).toISOString()
      : null,
    current_period_end: subscription.items.data[0]?.current_period_end
      ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: lookupError } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  if (lookupError) throw lookupError;

  if (existing?.id) {
    const { error } = await supabase
      .from("subscriptions")
      .update(payload)
      .eq("id", existing.id);

    if (error) throw error;
    return;
  }

  if (!payload.user_id) {
    logStep("Skipping subscription insert because user_id metadata is missing", { subscriptionId: subscription.id });
    return;
  }

  const { error } = await supabase.from("subscriptions").insert({
    ...payload,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
};

const markSubscriptionCanceled = async (subscription: Stripe.Subscription) => {
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      updated_at: new Date().toISOString(),
      current_period_end: subscription.items.data[0]?.current_period_end
        ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
        : null,
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) throw error;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: "Stripe webhook secrets not configured" }), {
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
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET,
        undefined,
        Stripe.createSubtleCryptoProvider(),
      );
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
        await upsertStripeTransaction({
          stripePaymentId: paymentIntent.id,
          stripeCustomerId: normalizeStripeValue(paymentIntent.customer),
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: "succeeded",
          customerEmail: paymentIntent.receipt_email,
          metadata: paymentIntent.metadata,
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await upsertStripeTransaction({
          stripePaymentId: paymentIntent.id,
          stripeCustomerId: normalizeStripeValue(paymentIntent.customer),
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: "failed",
          metadata: {
            failure_message: paymentIntent.last_payment_error?.message ?? null,
            ...paymentIntent.metadata,
          },
        });
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await upsertStripeTransaction({
          stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
          stripeCustomerId: normalizeStripeValue(session.customer),
          amount: (session.amount_total ?? 0) / 100,
          currency: session.currency ?? "usd",
          status: session.payment_status === "paid" ? "succeeded" : session.payment_status,
          customerEmail: session.customer_details?.email ?? session.customer_email,
          customerCountry: session.customer_details?.address?.country ?? null,
          metadata: {
            ...session.metadata,
            checkout_session_id: session.id,
            mode: session.mode,
          },
        });

        await upsertOrderFromCheckoutSession(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await upsertSubscriptionRecord(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await markSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await upsertStripeTransaction({
          stripePaymentId: typeof invoice.payment_intent === "string" ? invoice.payment_intent : invoice.payment_intent?.id ?? null,
          stripeCustomerId: normalizeStripeValue(invoice.customer),
          amount: invoice.amount_paid / 100,
          currency: invoice.currency,
          status: "succeeded",
          customerEmail: invoice.customer_email,
          metadata: {
            invoice_id: invoice.id,
            subscription_id: typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id ?? null,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await upsertStripeTransaction({
          stripePaymentId: typeof invoice.payment_intent === "string" ? invoice.payment_intent : invoice.payment_intent?.id ?? null,
          stripeCustomerId: normalizeStripeValue(invoice.customer),
          amount: invoice.amount_due / 100,
          currency: invoice.currency,
          status: "failed",
          customerEmail: invoice.customer_email,
          metadata: {
            invoice_id: invoice.id,
            subscription_id: typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id ?? null,
            failure_reason: "invoice_payment_failed",
          },
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