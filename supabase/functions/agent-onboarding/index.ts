import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { customer_name, email, plan, industry, goals } = await req.json();
    if (!customer_name || !email) {
      return new Response(JSON.stringify({ error: "customer_name and email are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("XAI_API_KEY");
    if (!apiKey) throw new Error("XAI_API_KEY not configured");

    const prompt = `You are an onboarding agent. Create a personalized welcome and setup sequence for a new customer.
Customer: ${customer_name}
Email: ${email}
Plan: ${plan || "Core"}
Industry: ${industry || "General"}
Goals: ${goals || "Grow revenue with AI automation"}

Respond in JSON: { "welcome_message": "string", "setup_steps": [{ "step": number, "title": "string", "description": "string", "estimated_minutes": number }], "first_week_goals": ["string"], "personalized_tips": ["string"] }`;

    const aiResponse = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
      }),
    });

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    let onboarding;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      onboarding = jsonMatch ? JSON.parse(jsonMatch[0]) : { welcome_message: content, setup_steps: [], first_week_goals: [], personalized_tips: [] };
    } catch {
      onboarding = { welcome_message: content, setup_steps: [], first_week_goals: [], personalized_tips: [] };
    }

    await supabase.from("agent_logs").insert({
      agent_name: "Onboarding Agent",
      agent_role: "customer_onboarding",
      action: "create_onboarding",
      status: "completed",
      details: { customer_name, email, plan, steps_created: onboarding.setup_steps?.length || 0 },
    });

    return new Response(JSON.stringify({ success: true, ...onboarding }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[AGENT-ONBOARDING] Error:", msg);

    await supabase.from("agent_logs").insert({
      agent_name: "Onboarding Agent",
      agent_role: "customer_onboarding",
      action: "create_onboarding",
      status: "error",
      error_message: msg,
    }).catch(() => {});

    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
