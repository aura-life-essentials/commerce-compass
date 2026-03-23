import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const logStep = (step: string, details?: unknown) => {
  console.log(`[AUTONOMOUS-BRAIN] ${step}`, details ? JSON.stringify(details) : "");
};

async function requireAdminUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const token = authHeader.replace("Bearer ", "");

  // Allow service-role key for internal edge-function-to-edge-function calls
  if (token === SUPABASE_SERVICE_ROLE_KEY) {
    return { userId: "service-role" };
  }

  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await authClient.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !userId) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: isAdmin, error: roleError } = await supabase.rpc("is_admin", { _user_id: userId });
  if (roleError || !isAdmin) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return userId;
}

const rolePrompts: Record<string, string> = {
  team_lead: `You are a Sales Team Lead AI. You coordinate your team of 5, assign priorities, and ensure the full sales pipeline runs smoothly. You decide which products to push, which markets to target, and how to allocate team resources. Output JSON with: action, assignments (array of role+task), priority, expected_revenue.`,
  content_creator: `You are a Content Creator AI on an autonomous sales team. You generate viral marketing scripts, ad copy, social media posts, and video hooks that convert. Your content must be platform-optimized (TikTok, Instagram, YouTube Shorts). Output JSON with: action, content_pieces (array), platforms, hooks_used, estimated_engagement.`,
  marketer: `You are a Digital Marketer AI on an autonomous sales team. You plan and execute marketing campaigns across organic and paid channels. You optimize for ROI, manage ad spend, and drive traffic. Output JSON with: action, campaigns (array), channels, budget_allocation, projected_roi.`,
  closer: `You are a Sales Closer AI on an autonomous sales team. You handle lead qualification, objection handling, and deal closing. You craft persuasive follow-ups and automate the checkout funnel. Output JSON with: action, leads_processed, follow_ups (array), deals_status, revenue_closed.`,
  analyst: `You are a Data Analyst AI on an autonomous sales team. You monitor KPIs, track conversion funnels, identify bottlenecks, and provide actionable insights. Output JSON with: action, metrics_analyzed, insights (array), recommendations, risk_flags.`,
};

const brainModifiers: Record<string, string> = {
  strategic: "Apply strategic long-term thinking. Prioritize sustainable growth over quick wins.",
  creative: "Think outside the box. Use unconventional approaches and viral-worthy ideas.",
  aggressive: "Be aggressive in pursuit of revenue. Push hard on high-value opportunities.",
  persuasive: "Use psychological triggers and persuasion techniques. Focus on conversion optimization.",
  analytical: "Be data-driven. Base every decision on metrics and statistical evidence.",
};

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
    Output market entry strategies as structured JSON.`,
};

async function thinkAndDecide(agentBrain: any, context: any) {
  logStep("Agent thinking", { agent: agentBrain.agent_name, type: agentBrain.agent_type, role: agentBrain.agent_role });

  // Build system prompt based on role + brain template
  let systemPrompt = "";
  if (agentBrain.agent_role && rolePrompts[agentBrain.agent_role]) {
    systemPrompt = rolePrompts[agentBrain.agent_role];
    if (agentBrain.brain_template && brainModifiers[agentBrain.brain_template]) {
      systemPrompt += `\n\nBRAIN MODE: ${brainModifiers[agentBrain.brain_template]}`;
    }
    if (context?.niche) {
      systemPrompt += `\n\nYour niche focus: ${context.niche}. Tailor all decisions to this market.`;
    }
  } else {
    systemPrompt = systemPrompts[agentBrain.agent_type] || systemPrompts.profit_reaper;
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Current State: ${JSON.stringify(agentBrain.current_state)}
          
Context Data: ${JSON.stringify(context)}

Based on this information, what is your next decision? Think step by step, then output a JSON object with:
- action: the specific action to take
- reasoning: why you're taking this action
- expected_impact: estimated revenue impact
- confidence: 0-1 confidence score
- next_steps: array of follow-up actions`,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 429) throw new Error("Rate limited - too many requests");
    if (status === 402) throw new Error("Payment required - add credits");
    throw new Error(`AI request failed: ${status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  let decision: any = {};
  if (jsonMatch) {
    try { decision = JSON.parse(jsonMatch[0]); } catch {
      decision = { action: "analyze", reasoning: content, confidence: 0.5 };
    }
  }
  return decision;
}

async function deployTeamWorkflow(teamId: string) {
  logStep("Deploying full team workflow", { teamId });

  // Get team
  const { data: team } = await supabase.from("agent_teams").select("*").eq("id", teamId).single();
  if (!team) throw new Error("Team not found");

  // Get team agents
  const { data: agents } = await supabase.from("agent_brains").select("*").eq("team_id", teamId).eq("is_active", true);
  if (!agents?.length) throw new Error("No active agents in team");

  // Update team workflow status
  await supabase.from("agent_teams").update({ current_workflow: "executing", last_active_at: new Date().toISOString() }).eq("id", teamId);

  const results: any[] = [];

  // Execute agents in pipeline order: Lead → Analyst → Content → Marketer → Closer
  const pipelineOrder = ["team_lead", "analyst", "content_creator", "marketer", "closer"];
  let previousOutput: any = { team: team.team_name, niche: team.niche };

  for (const role of pipelineOrder) {
    const agent = agents.find((a: any) => a.agent_role === role);
    if (!agent) continue;

    try {
      const decision = await thinkAndDecide(agent, { ...previousOutput, pipeline_stage: role, team_context: team });

      // Log decision
      await supabase.from("ai_decisions").insert({
        agent_brain_id: agent.id,
        decision_type: "team_workflow",
        input_data: previousOutput,
        reasoning: decision.reasoning || "",
        output_action: decision,
        confidence_score: decision.confidence || 0.5,
        executed: true,
        execution_result: { pipeline_stage: role, team: team.team_name },
      });

      // Log activity
      await supabase.from("agent_logs").insert({
        agent_name: agent.agent_name,
        agent_role: role,
        action: `${role}: ${decision.action || "processing"}`,
        status: "completed",
        details: { team: team.team_name, decision },
      });

      // Update agent
      await supabase.from("agent_brains").update({
        last_decision_at: new Date().toISOString(),
        tasks_completed: (agent.tasks_completed || 0) + 1,
      }).eq("id", agent.id);

      previousOutput = { ...previousOutput, [`${role}_output`]: decision };
      results.push({ role, agent: agent.agent_name, decision });
    } catch (e) {
      logStep(`Agent ${role} failed`, { error: (e as Error).message });
      results.push({ role, agent: agent.agent_name, error: (e as Error).message });
    }
  }

  // Update team status
  await supabase.from("agent_teams").update({
    current_workflow: "completed",
    campaigns_run: (team.campaigns_run || 0) + 1,
    last_active_at: new Date().toISOString(),
  }).eq("id", teamId);

  return { team: team.team_name, results };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await requireAdminUser(req);
    const body = await req.json();
    const { action, agent_type, context, team_id } = body;

    const validActions = ["think", "execute", "status", "deploy_team", "deploy_all"];
    if (!action || !validActions.includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action. Must be: think, execute, status, deploy_team, or deploy_all" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Request received", { action, agent_type, team_id });

    if (action === "deploy_team") {
      if (!team_id) {
        return new Response(JSON.stringify({ error: "team_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const result = await deployTeamWorkflow(team_id);
      return new Response(JSON.stringify({ success: true, ...result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "deploy_all") {
      const { data: teams } = await supabase.from("agent_teams").select("id, team_name").eq("is_active", true).limit(40);
      const results: any[] = [];
      // Process teams in batches of 5 to avoid rate limits
      for (let i = 0; i < (teams?.length || 0); i += 5) {
        const batch = teams!.slice(i, i + 5);
        const batchResults = await Promise.allSettled(
          batch.map((t: any) => deployTeamWorkflow(t.id))
        );
        results.push(...batchResults.map((r, idx) => ({
          team: batch[idx].team_name,
          status: r.status,
          result: r.status === "fulfilled" ? r.value : (r as any).reason?.message,
        })));
      }
      return new Response(JSON.stringify({ success: true, teams_deployed: results.length, results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "think") {
      if (!agent_type || typeof agent_type !== "string" || agent_type.length > 100) {
        return new Response(JSON.stringify({ error: "Valid agent_type required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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

      if (decisionError) logStep("Error logging decision", decisionError);

      await supabase
        .from("agent_brains")
        .update({
          last_decision_at: new Date().toISOString(),
          decision_history: [...(brain.decision_history || []).slice(-99), decision],
        })
        .eq("id", brain.id);

      return new Response(JSON.stringify({ success: true, decision, decision_id: decisionRecord?.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "execute") {
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
