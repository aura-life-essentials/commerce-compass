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
    const { lead_name, objection, context, product_info } = await req.json();
    if (!objection) {
      return new Response(JSON.stringify({ error: "objection is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("XAI_API_KEY");
    if (!apiKey) throw new Error("XAI_API_KEY not configured");

    const prompt = `You are a sales closer agent. Handle this objection and provide a persuasive response that moves toward closing.
Lead: ${lead_name || "Prospect"}
Objection: ${objection}
Context: ${context || "Sales conversation"}
Product: ${product_info || "AuraOmega autonomous revenue system"}

Respond in JSON: { "response": "string", "strategy": "string", "confidence": number (0-100), "suggested_offer": "string", "next_step": "string" }`;

    const aiResponse = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      }),
    });

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    let closerResponse;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      closerResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { response: content, strategy: "direct", confidence: 50, suggested_offer: "", next_step: "Follow up" };
    } catch {
      closerResponse = { response: content, strategy: "direct", confidence: 50, suggested_offer: "", next_step: "Follow up" };
    }

    await supabase.from("agent_logs").insert({
      agent_name: "Closer Agent",
      agent_role: "sales_closing",
      action: "handle_objection",
      status: "completed",
      details: { lead_name, objection_type: objection.substring(0, 50), confidence: closerResponse.confidence },
    });

    return new Response(JSON.stringify({ success: true, ...closerResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[AGENT-CLOSER] Error:", msg);

    await supabase.from("agent_logs").insert({
      agent_name: "Closer Agent",
      agent_role: "sales_closing",
      action: "handle_objection",
      status: "error",
      error_message: msg,
    }).catch(() => {});

    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
