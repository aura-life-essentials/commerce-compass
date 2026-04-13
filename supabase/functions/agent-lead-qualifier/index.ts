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
    const { lead_name, company, email, industry, message } = await req.json();
    if (!lead_name || !email) {
      return new Response(JSON.stringify({ error: "lead_name and email are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("XAI_API_KEY");
    if (!apiKey) throw new Error("XAI_API_KEY not configured");

    const prompt = `You are a lead qualification agent. Score this lead from 0-100 and explain why.
Lead: ${lead_name}
Company: ${company || "Unknown"}
Email: ${email}
Industry: ${industry || "Unknown"}
Message: ${message || "No message"}

Respond in JSON: { "score": number, "tier": "hot"|"warm"|"cold", "reasoning": "string", "next_action": "string" }`;

    const aiResponse = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    let qualification;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      qualification = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 50, tier: "warm", reasoning: content, next_action: "Manual review" };
    } catch {
      qualification = { score: 50, tier: "warm", reasoning: content, next_action: "Manual review" };
    }

    // Log to agent_logs
    await supabase.from("agent_logs").insert({
      agent_name: "Lead Qualifier",
      agent_role: "lead_qualification",
      action: "qualify_lead",
      status: "completed",
      details: { lead_name, email, company, qualification },
    });

    return new Response(JSON.stringify({ success: true, qualification }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[AGENT-LEAD-QUALIFIER] Error:", msg);

    await supabase.from("agent_logs").insert({
      agent_name: "Lead Qualifier",
      agent_role: "lead_qualification",
      action: "qualify_lead",
      status: "error",
      error_message: msg,
    }).catch(() => {});

    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
