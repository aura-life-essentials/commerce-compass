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
    const { lead_name, company, industry, pain_points, sequence_length } = await req.json();
    if (!lead_name) {
      return new Response(JSON.stringify({ error: "lead_name is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("XAI_API_KEY");
    if (!apiKey) throw new Error("XAI_API_KEY not configured");

    const steps = sequence_length || 3;
    const prompt = `You are a nurture sequence agent. Create a ${steps}-step personalized follow-up email sequence.
Lead: ${lead_name}
Company: ${company || "Unknown"}
Industry: ${industry || "General"}
Pain Points: ${pain_points || "Not specified"}

Respond in JSON: { "sequence": [{ "step": number, "subject": "string", "body": "string", "delay_days": number, "cta": "string" }] }`;

    const aiResponse = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    let sequence;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      sequence = jsonMatch ? JSON.parse(jsonMatch[0]) : { sequence: [{ step: 1, subject: "Follow up", body: content, delay_days: 1, cta: "Reply" }] };
    } catch {
      sequence = { sequence: [{ step: 1, subject: "Follow up", body: content, delay_days: 1, cta: "Reply" }] };
    }

    await supabase.from("agent_logs").insert({
      agent_name: "Nurture Agent",
      agent_role: "nurture_sequences",
      action: "generate_sequence",
      status: "completed",
      details: { lead_name, company, steps_generated: sequence.sequence?.length || 0 },
    });

    return new Response(JSON.stringify({ success: true, ...sequence }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[AGENT-NURTURE] Error:", msg);

    await supabase.from("agent_logs").insert({
      agent_name: "Nurture Agent",
      agent_role: "nurture_sequences",
      action: "generate_sequence",
      status: "error",
      error_message: msg,
    }).catch(() => {});

    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
