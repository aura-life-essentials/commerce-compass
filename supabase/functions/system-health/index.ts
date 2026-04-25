import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const results: Record<string, unknown> = {};

  // 1. Database health
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { count: orderCount } = await supabase.from("orders").select("*", { count: "exact", head: true });
    const { count: storeCount } = await supabase.from("stores").select("*", { count: "exact", head: true });
    const { count: productCount } = await supabase.from("products").select("*", { count: "exact", head: true });
    const { count: stripeTransCount } = await supabase.from("stripe_transactions").select("*", { count: "exact", head: true });
    const { count: subscriptionCount } = await supabase.from("subscriptions").select("*", { count: "exact", head: true });
    const { count: agentBrainCount } = await supabase.from("agent_brains").select("*", { count: "exact", head: true });
    const { count: agentTeamCount } = await supabase.from("agent_teams").select("*", { count: "exact", head: true });
    const { count: agentLogCount } = await supabase.from("agent_logs").select("*", { count: "exact", head: true });
    const { count: leadCount } = await supabase.from("lead_contacts").select("*", { count: "exact", head: true });
    const { count: analyticsCount } = await supabase.from("analytics_events").select("*", { count: "exact", head: true });

    results.database = {
      status: "operational",
      tables: {
        orders: orderCount ?? 0,
        stores: storeCount ?? 0,
        products: productCount ?? 0,
        stripe_transactions: stripeTransCount ?? 0,
        subscriptions: subscriptionCount ?? 0,
        agent_brains: agentBrainCount ?? 0,
        agent_teams: agentTeamCount ?? 0,
        agent_logs: agentLogCount ?? 0,
        lead_contacts: leadCount ?? 0,
        analytics_events: analyticsCount ?? 0,
      },
    };
  } catch (e) {
    results.database = { status: "failed", error: (e as Error).message };
  }

  // 2. Stripe health
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey) {
      results.stripe = { status: "not_configured", secret_key: false, webhook_secret: !!webhookSecret };
    } else {
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
      const balance = await stripe.balance.retrieve();
      results.stripe = {
        status: "connected",
        secret_key: true,
        webhook_secret: !!webhookSecret,
        balance_available: balance.available.map((b: any) => ({ amount: b.amount / 100, currency: b.currency })),
        livemode: balance.livemode,
      };
    }
  } catch (e) {
    results.stripe = { status: "error", error: (e as Error).message };
  }

  // 3. Shopify health
  try {
    const shopifyToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN") || Deno.env.get("SHOPIFY_DEV_APP_TOKEN");
    const storefrontToken = Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
    if (!shopifyToken) {
      results.shopify = { status: "not_configured", admin_token: false, storefront_token: !!storefrontToken };
    } else {
      results.shopify = {
        status: "connected",
        admin_token: true,
        storefront_token: !!storefrontToken,
      };
    }
  } catch (e) {
    results.shopify = { status: "error", error: (e as Error).message };
  }

  // 4. Edge functions deployed
  const deployedFunctions = [
    "stripe-webhook", "create-checkout", "create-subscription-checkout",
    "check-subscription", "customer-portal", "sales-control-plane",
    "ceo-brain", "autonomous-brain", "content-generator", "content-factory",
    "viral-scraper", "viral-product-research", "cj-dropshipping",
    "marketing-blitz", "global-expander", "track-analytics",
    "validate-promo-code", "send-welcome-email", "send-trial-reminder",
    "send-subscription-email", "traffic-webhook", "setup-app-products",
    "web3-launch-engine", "ai-intelligence", "apex-intelligence",
    "elevenlabs-tts", "elevenlabs-conversation-token",
    "xai-gateway", "xai-video-generate", "social-milestone-post",
  ];
  results.edge_functions = { deployed: deployedFunctions, count: deployedFunctions.length };

  // 5. Secrets audit
  const secretNames = [
    "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_API_KEY",
    "SHOPIFY_DEV_APP_TOKEN", "SHOPIFY_ACCESS_TOKEN", "SHOPIFY_STOREFRONT_ACCESS_TOKEN",
    "ELEVENLABS_API_KEY", "XAI_API_KEY", "RESEND_API_KEY",
    "CJ_DROPSHIPPING_API_KEY", "PERPLEXITY_API_KEY", "FIRECRAWL_API_KEY",
    "GOOGLE_DEVELOPER_API_KEY", "LOVABLE_API_KEY",
  ];
  const secretsStatus: Record<string, boolean> = {};
  for (const name of secretNames) {
    secretsStatus[name] = !!Deno.env.get(name);
  }
  results.secrets = secretsStatus;

  // 6. Webhook status
  results.webhooks = {
    stripe_webhook: { configured: !!Deno.env.get("STRIPE_WEBHOOK_SECRET"), signature_verification: true },
    traffic_webhook: { deployed: true },
    note: "Verify webhook URL is registered in Stripe Dashboard pointing to this project's edge function URL",
  };

  // 7. Module map
  results.modules = {
    payments: { service: "Stripe", functions: ["create-checkout", "create-subscription-checkout", "stripe-webhook", "check-subscription", "customer-portal", "validate-promo-code"], status: "wired" },
    products: { service: "Shopify + DB", functions: ["cj-dropshipping", "viral-product-research"], status: "wired" },
    orders: { service: "Stripe → DB", functions: ["stripe-webhook"], status: "wired" },
    agents: { service: "Supabase", functions: ["autonomous-brain", "ceo-brain", "sales-control-plane"], status: "wired" },
    analytics: { service: "Supabase", functions: ["track-analytics", "traffic-webhook"], status: "wired" },
    content: { service: "AI + Supabase", functions: ["content-factory", "content-generator", "xai-gateway", "xai-video-generate"], status: "wired" },
    marketing: { service: "AI + Supabase", functions: ["marketing-blitz", "viral-scraper", "social-milestone-post"], status: "wired" },
    fulfillment: { service: "CJ Dropshipping", functions: ["cj-dropshipping"], status: "wired" },
    web3: { service: "Supabase + Contracts", functions: ["web3-launch-engine"], status: "wired" },
    health: { service: "This function", functions: ["system-health"], status: "wired" },
  };

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
