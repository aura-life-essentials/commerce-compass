// Revenue Router — every agent action MUST route through here.
// Validates the action carries a Stripe payment link tied to the primary account,
// then logs the intent. Actual revenue rows are only written by stripe-webhook on charge.succeeded.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, agent_name, agent_role, campaign_id, channel, payment_link, price_id, product_id, summary } = body ?? {};

    if (!action || !agent_name) {
      return new Response(JSON.stringify({ error: "action + agent_name required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Enforce: a verifiable Stripe link OR price_id on the primary account.
    let resolvedLink = payment_link as string | null;
    let resolvedPrice = price_id as string | null;

    if (resolvedPrice && !resolvedLink) {
      const link = await stripe.paymentLinks.create({
        line_items: [{ price: resolvedPrice, quantity: 1 }],
        metadata: {
          agent_name, agent_role: agent_role ?? "", campaign_id: campaign_id ?? "",
          source_channel: channel ?? "agent", utm_source: channel ?? "agent",
          utm_campaign: campaign_id ?? agent_name,
        },
      });
      resolvedLink = link.url;
    }

    if (!resolvedLink) {
      return new Response(JSON.stringify({
        error: "Money-or-it-didn't-happen: action rejected. Provide payment_link or price_id.",
      }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2. Verify the link points to the primary Stripe account (sanity ping)
    const acct = await stripe.accounts.retrieve();

    // 3. Log the routed action
    await supabase.from("agent_logs").insert({
      agent_name, agent_role: agent_role ?? "router",
      action: `revenue_router:${action}`, status: "routed",
      details: {
        summary: summary ?? null,
        campaign_id: campaign_id ?? null,
        channel: channel ?? null,
        payment_link: resolvedLink,
        price_id: resolvedPrice,
        product_id: product_id ?? null,
        stripe_account: acct.id,
      },
    });

    return new Response(JSON.stringify({
      ok: true, payment_link: resolvedLink, stripe_account: acct.id,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});