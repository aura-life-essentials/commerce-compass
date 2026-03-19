import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const APP_PRODUCTS = [
  { name: "CEO Brain Pro", description: "Runs strategic decisions and agent orchestration. Standalone monthly tool.", price: 72500, interval: "month" as const },
  { name: "Autonomous Sales Network Pro", description: "Automates the full sales cycle from research to close. Standalone monthly tool.", price: 120000, interval: "month" as const },
  { name: "200-Agent Autonomous Sales Network Pro", description: "Deploys 40 teams with interchangeable brains across research, content, market, close, and analysis.", price: 360000, interval: "month" as const },
  { name: "Checkout Conversion Engine Pro", description: "Lifts conversion rate with upsells and cart optimization. Standalone monthly tool.", price: 36000, interval: "month" as const },
  { name: "Web3 Launch Engine Pro", description: "Launches communities, tokens, NFTs, and investor-ready assets. Standalone monthly tool.", price: 60000, interval: "month" as const },
  { name: "Content Factory Pro", description: "Produces videos, scripts, voiceovers, and presentations fast. Standalone monthly tool.", price: 43000, interval: "month" as const },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);

    // Verify super_admin
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "super_admin")
      .single();
    if (!roleData) throw new Error("Unauthorized: super_admin required");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const results = [];

    for (const app of APP_PRODUCTS) {
      // Check if product already exists
      const existing = await stripe.products.search({ query: `name:"${app.name}"`, limit: 1 });
      
      let product;
      let price;

      if (existing.data.length > 0) {
        product = existing.data[0];
        // Get active price
        const prices = await stripe.prices.list({ product: product.id, active: true, limit: 1 });
        price = prices.data[0];
        if (!price) {
          price = await stripe.prices.create({
            product: product.id,
            unit_amount: app.price,
            currency: "usd",
            recurring: { interval: app.interval },
          });
        }
      } else {
        product = await stripe.products.create({
          name: app.name,
          description: app.description,
          metadata: { source: "app_store", category: "saas_tool" },
        });
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: app.price,
          currency: "usd",
          recurring: { interval: app.interval },
        });
      }

      results.push({
        name: app.name,
        productId: product.id,
        priceId: price.id,
        amount: app.price,
      });
    }

    return new Response(JSON.stringify({ success: true, products: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
