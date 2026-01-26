import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TRACK-ANALYTICS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { 
      event_type, 
      event_name, 
      event_data, 
      page_url, 
      referrer,
      session_id 
    } = await req.json();

    if (!event_type || !event_name) {
      throw new Error("event_type and event_name are required");
    }

    // Try to get user from auth header (optional)
    let userId = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData } = await supabaseClient.auth.getUser(token);
        userId = userData.user?.id || null;
      } catch {
        // Ignore auth errors - allow anonymous tracking
      }
    }

    // Get user agent and approximate country from headers
    const userAgent = req.headers.get("user-agent") || null;
    const cfCountry = req.headers.get("cf-ipcountry") || null;

    const { error } = await supabaseClient.from("analytics_events").insert({
      user_id: userId,
      session_id,
      event_type,
      event_name,
      event_data: event_data || {},
      page_url,
      referrer,
      user_agent: userAgent,
      ip_country: cfCountry,
    });

    if (error) {
      logStep("Error inserting analytics event", { error: error.message });
      throw error;
    }

    logStep("Analytics event tracked", { event_type, event_name, userId });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in track-analytics", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
