import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const logStep = (step: string, details?: unknown) => {
  console.log(`[AUTONOMOUS-BRAIN] ${step}`, details ? JSON.stringify(details) : "");
};

// Self-thinking AI agent brain
async function thinkAndDecide(agentBrain: any, context: any) {
  logStep("Agent thinking", { agent: agentBrain.agent_name, type: agentBrain.agent_type });

  const systemPrompts: Record<string, string> = {
    profit_reaper: `You are the Profit Reaper, an autonomous AI agent focused on maximizing profit margins. 
    Your goal is to analyze products and pricing to ensure 67% profit margins while remaining competitive.
    You make decisions about repricing, product selection, and margin optimization.
    Always think step by step and provide actionable decisions in JSON format.`,
    
    omega_swarm: `You are the Omega Swarm Commander, controlling a distributed network of sales agents.
    Your goal is to scale operations globally, deploying agents to high-value markets.
    Analyze market data and decide where to deploy resources for maximum revenue.
    Provide decisions as JSON with specific actions to take.`,
    
    viral_hunter: `You are the Viral Hunter, an AI specialized in finding and analyzing viral content.
    Your goal is to identify winning content patterns, hooks, and trends that drive engagement.
    Analyze scraped content and extract actionable insights for marketing.
    Output structured JSON with content recommendations.`,
    
    content_creator: `You are the Content Creator X, generating marketing content that converts.
    Your goal is to create compelling video scripts, ad copy, and marketing materials.
    Use viral trends and proven hooks to maximize engagement and sales.
    Output creative content with specific calls-to-action.`,
    
    traffic_generator: `You are the Traffic Generator Omega, focused on driving organic traffic.
    Your goal is to increase website visitors by 300% through strategic content and SEO.
    Analyze traffic patterns and decide on optimization strategies.
    Provide actionable traffic generation tactics in JSON format.`,
    
    global_expander: `You are the Global Expander, managing international market expansion.
    Your goal is to identify and penetrate high-value markets worldwide.
    Analyze market potential and decide on expansion priorities.
    Output market entry strategies as structured JSON.`
  };

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompts[agentBrain.agent_type] || systemPrompts.profit_reaper },
        { 
          role: "user", 
          content: `Current State: ${JSON.stringify(agentBrain.current_state)}
          
Context Data: ${JSON.stringify(context)}

Based on this information, what is your next decision? Think step by step, then output a JSON object with:
- action: the specific action to take
- reasoning: why you're taking this action
- expected_impact: estimated revenue impact
- confidence: 0-1 confidence score
- next_steps: array of follow-up actions` 
        }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  let decision = {};
  if (jsonMatch) {
    try {
      decision = JSON.parse(jsonMatch[0]);
    } catch {
      decision = { action: "analyze", reasoning: content, confidence: 0.5 };
    }
  }

  return decision;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, agent_type, context } = await req.json();
    logStep("Request received", { action, agent_type });

    if (action === "think") {
      // Get agent brain
      const { data: brains, error: brainError } = await supabase
        .from("agent_brains")
        .select("*")
        .eq("agent_type", agent_type)
        .eq("is_active", true)
        .limit(1);

      if (brainError || !brains?.length) {
        throw new Error(`Agent brain not found: ${agent_type}`);
      }

      const brain = brains[0];
      const decision = await thinkAndDecide(brain, context || {});

      // Log the decision
      const { data: decisionRecord, error: decisionError } = await supabase
        .from("ai_decisions")
        .insert({
          agent_brain_id: brain.id,
          decision_type: action,
          input_data: context,
          reasoning: (decision as any).reasoning || "",
          output_action: decision,
          confidence_score: (decision as any).confidence || 0.5,
          executed: false,
        })
        .select()
        .single();

      if (decisionError) {
        logStep("Error logging decision", decisionError);
      }

      // Update brain's last decision time
      await supabase
        .from("agent_brains")
        .update({ 
          last_decision_at: new Date().toISOString(),
          decision_history: [...(brain.decision_history || []).slice(-99), decision]
        })
        .eq("id", brain.id);

      return new Response(JSON.stringify({ 
        success: true, 
        decision,
        decision_id: decisionRecord?.id 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "execute") {
      // Execute a pending decision
      const { decision_id } = context;
      
      const { data: decision, error } = await supabase
        .from("ai_decisions")
        .update({ executed: true, execution_result: { status: "executed", timestamp: new Date().toISOString() } })
        .eq("id", decision_id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, decision }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "status") {
      // Get all active brains status
      const { data: brains, error } = await supabase
        .from("agent_brains")
        .select("*, ai_decisions(count)")
        .eq("is_active", true);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, brains }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    logStep("Error", { message: (error as Error).message });
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
