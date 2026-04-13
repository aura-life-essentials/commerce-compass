import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AGENTS = {
  "lead_qualification": "agent-lead-qualifier",
  "nurture": "agent-nurture",
  "closing": "agent-closer",
  "onboarding": "agent-onboarding",
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
    const { task_type, payload } = await req.json();
    if (!task_type || !payload) {
      return new Response(JSON.stringify({ error: "task_type and payload are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const agentFunction = AGENTS[task_type as keyof typeof AGENTS];
    if (!agentFunction) {
      return new Response(JSON.stringify({ 
        error: `Unknown task_type: ${task_type}. Valid types: ${Object.keys(AGENTS).join(", ")}` 
      }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Route to the appropriate agent
    const baseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    
    const agentResponse = await fetch(`${baseUrl}/functions/v1/${agentFunction}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${anonKey}`,
      },
      body: JSON.stringify(payload),
    });

    const agentData = await agentResponse.json();

    await supabase.from("agent_logs").insert({
      agent_name: "Orchestrator",
      agent_role: "task_routing",
      action: "route_task",
      status: agentData.success ? "completed" : "error",
      details: { task_type, routed_to: agentFunction, success: !!agentData.success },
    });

    return new Response(JSON.stringify({ 
      success: true, 
      routed_to: agentFunction,
      agent_response: agentData 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[AGENT-ORCHESTRATOR] Error:", msg);

    await supabase.from("agent_logs").insert({
      agent_name: "Orchestrator",
      agent_role: "task_routing",
      action: "route_task",
      status: "error",
      error_message: msg,
    }).catch(() => {});

    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
