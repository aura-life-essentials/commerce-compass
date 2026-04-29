import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const log = (msg: string, meta?: unknown) =>
  console.log(`[grant-app-entitlements] ${msg}`, meta ? JSON.stringify(meta) : "");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY);
const stripe = new Stripe(STRIPE_KEY, { apiVersion: "2025-08-27.basil" });

/**
 * Maps a Stripe price/product/tier id to the list of app modules
 * the customer should be entitled to. This is the single source of truth.
 * Keep this in sync with src/lib/subscriptionTiers.ts and src/lib/appProducts.ts
 */
const APPS_PER_TIER: Record<string, string[]> = {
  // SaaS tiers
  core: [
    "lead-qualifier",
    "nurture-agent",
    "analytics",
  ],
  pro: [
    "lead-qualifier",
    "nurture-agent",
    "analytics",
    "closer-agent",
    "onboarding-agent",
    "orchestrator",
    "ceo-brain",
    "profit-reaper",
    "crm",
    "marketing",
  ],
  enterprise: [
    "lead-qualifier",
    "nurture-agent",
    "analytics",
    "closer-agent",
    "onboarding-agent",
    "orchestrator",
    "ceo-brain",
    "profit-reaper",
    "crm",
    "marketing",
    "white-glove",
  ],

  // Standalone app products
  "ceo-brain-starter": ["ceo-brain"],
  "ceo-brain-pro": ["ceo-brain", "orchestrator", "marketing"],
  "ceo-brain-godmode": [
    "ceo-brain",
    "orchestrator",
    "marketing",
    "profit-reaper",
    "crm",
    "analytics",
  ],
  "profit-reaper": ["profit-reaper", "analytics"],
};

const PRICE_TO_TIER: Record<string, string> = {
  // SaaS
  price_1TLtK0Fpvr5YnJS74uUhKJAU: "core",
  price_1TLtK2Fpvr5YnJS743sxV1Cj: "pro",
  // Apps
  price_1TPzQMFpvr5YnJS77Y1wgbzM: "ceo-brain-starter",
  price_1TPzQMFpvr5YnJS7feiqMetX: "ceo-brain-pro",
  price_1TPzQLFpvr5YnJS7DexY4Z8V: "ceo-brain-godmode",
  price_1TPzQKFpvr5YnJS7wdOEY27A: "profit-reaper",
};

function appsForTier(tierId: string | null | undefined): string[] {
  if (!tierId) return [];
  return APPS_PER_TIER[tierId] ?? [];
}

async function getAuthedUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  if (token === SERVICE_KEY) return null; // service role, no user
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

async function grantFromSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (!userId) {
    log("subscription missing user_id metadata", { id: subscription.id });
    return { granted: 0 };
  }

  const item = subscription.items.data[0];
  const priceId = item?.price?.id;
  const productId =
    typeof item?.price?.product === "string"
      ? item.price.product
      : item?.price?.product?.id;

  // Resolve tier id: prefer metadata.tier_id, fall back to PRICE_TO_TIER
  let tierId = subscription.metadata?.tier_id;
  if (!tierId && priceId) tierId = PRICE_TO_TIER[priceId];

  const apps = appsForTier(tierId);
  if (apps.length === 0) {
    log("no apps mapped for tier", { tierId, priceId });
    return { granted: 0, tierId };
  }

  const status =
    subscription.status === "trialing" || subscription.status === "active"
      ? "active"
      : subscription.status;

  const expiresAt = item?.current_period_end
    ? new Date(item.current_period_end * 1000).toISOString()
    : null;

  const rows = apps.map((app_id) => ({
    user_id: userId,
    app_id,
    source: "stripe",
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId ?? null,
    stripe_product_id: productId ?? null,
    status,
    expires_at: expiresAt,
    metadata: { tier_id: tierId, subscription_status: subscription.status },
  }));

  const { error } = await admin
    .from("app_entitlements")
    .upsert(rows, {
      onConflict: "user_id,app_id,stripe_subscription_id",
    });

  if (error) {
    log("upsert error", { error: error.message });
    throw error;
  }

  log("granted entitlements", { userId, tierId, apps });
  return { granted: apps.length, tierId, apps };
}

async function revokeForSubscription(subscriptionId: string) {
  const { error } = await admin
    .from("app_entitlements")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscriptionId);
  if (error) throw error;
}

/**
 * Self-heal endpoint: called from /subscription-success page so the user gets
 * instant access even if the webhook is delayed.
 */
async function syncForUser(userId: string, userEmail: string | null) {
  if (!userEmail) return { granted: 0 };
  const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
  if (!customers.data.length) return { granted: 0 };
  const customer = customers.data[0];

  const subs = await stripe.subscriptions.list({
    customer: customer.id,
    status: "all",
    limit: 20,
  });

  let total = 0;
  for (const sub of subs.data) {
    if (!sub.metadata?.user_id) {
      // Backfill metadata to the right user
      try {
        await stripe.subscriptions.update(sub.id, {
          metadata: { ...sub.metadata, user_id: userId },
        });
        sub.metadata = { ...sub.metadata, user_id: userId };
      } catch (e) {
        log("could not patch sub metadata", { id: sub.id });
      }
    }
    if (sub.status === "active" || sub.status === "trialing") {
      const r = await grantFromSubscription(sub);
      total += r.granted ?? 0;
    } else {
      await revokeForSubscription(sub.id);
    }
  }
  return { granted: total };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action ?? "sync_self";

    // ===== Webhook-style: granted by stripe-webhook (service role auth) =====
    if (action === "grant_from_subscription") {
      const subscriptionId = body?.subscription_id;
      if (!subscriptionId) throw new Error("subscription_id required");
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const result = await grantFromSubscription(sub);
      return new Response(JSON.stringify({ ok: true, ...result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "revoke_subscription") {
      const subscriptionId = body?.subscription_id;
      if (!subscriptionId) throw new Error("subscription_id required");
      await revokeForSubscription(subscriptionId);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== User-initiated sync (success page, manual refresh) =====
    const userId = await getAuthedUserId(req);
    if (!userId) throw new Error("Unauthorized");

    const { data: userData } = await admin.auth.admin.getUserById(userId);
    const result = await syncForUser(userId, userData.user?.email ?? null);

    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    log("ERROR", { message: (e as Error).message });
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});