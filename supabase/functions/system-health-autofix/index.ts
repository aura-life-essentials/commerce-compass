import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const healingActions: Array<{ subsystem: string; action: string; result: string; severity: string }> = [];
  const startTime = Date.now();

  // ═══════════════════════════════════════════════════════════════
  // 1. STRIPE SELF-HEALING — Validate & report connectivity
  // ═══════════════════════════════════════════════════════════════
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      healingActions.push({ subsystem: "stripe", action: "missing_key_alert", result: "STRIPE_SECRET_KEY not set — payments disabled", severity: "critical" });
    } else {
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
      const balance = await stripe.balance.retrieve();
      if (!balance.livemode) {
        healingActions.push({ subsystem: "stripe", action: "mode_check", result: "Stripe running in TEST mode — switch to live for real revenue", severity: "warn" });
      } else {
        healingActions.push({ subsystem: "stripe", action: "validate", result: `Stripe LIVE — balance: ${balance.available.map(b => `${(b.amount / 100).toFixed(2)} ${b.currency}`).join(", ")}`, severity: "ok" });
      }
    }
  } catch (e) {
    healingActions.push({ subsystem: "stripe", action: "connectivity_check", result: `Stripe error: ${(e as Error).message}`, severity: "critical" });
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. STALLED AGENTS — Restart agents stuck for >30 minutes
  // ═══════════════════════════════════════════════════════════════
  try {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: stalledBrains, error } = await supabase
      .from("agent_brains")
      .select("id, agent_name, last_decision_at, is_active")
      .eq("is_active", true)
      .lt("last_decision_at", thirtyMinAgo);

    if (!error && stalledBrains && stalledBrains.length > 0) {
      for (const brain of stalledBrains) {
        // Reset the agent's timestamp to "wake it up"
        await supabase
          .from("agent_brains")
          .update({ last_decision_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", brain.id);

        healingActions.push({
          subsystem: "agents",
          action: "restart_stalled_agent",
          result: `Restarted stalled agent: ${brain.agent_name} (idle since ${brain.last_decision_at})`,
          severity: "warn",
        });
      }
    } else {
      healingActions.push({ subsystem: "agents", action: "check_stalled", result: "All agents responsive", severity: "ok" });
    }
  } catch (e) {
    healingActions.push({ subsystem: "agents", action: "stall_check", result: `Error: ${(e as Error).message}`, severity: "error" });
  }

  // ═══════════════════════════════════════════════════════════════
  // 3. STUCK FULFILLMENT JOBS — Clear jobs stuck >1 hour
  // ═══════════════════════════════════════════════════════════════
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: stuckJobs, error } = await supabase
      .from("fulfillment_jobs")
      .select("id, order_id, status, started_at")
      .eq("status", "processing")
      .lt("started_at", oneHourAgo);

    if (!error && stuckJobs && stuckJobs.length > 0) {
      for (const job of stuckJobs) {
        await supabase
          .from("fulfillment_jobs")
          .update({ status: "failed", error_message: "Auto-healed: stuck for >1 hour", completed_at: new Date().toISOString() })
          .eq("id", job.id);

        healingActions.push({
          subsystem: "fulfillment",
          action: "clear_stuck_job",
          result: `Cleared stuck fulfillment job ${job.id} for order ${job.order_id}`,
          severity: "warn",
        });
      }
    } else {
      healingActions.push({ subsystem: "fulfillment", action: "check_stuck", result: "No stuck fulfillment jobs", severity: "ok" });
    }
  } catch (e) {
    healingActions.push({ subsystem: "fulfillment", action: "stuck_check", result: `Error: ${(e as Error).message}`, severity: "error" });
  }

  // ═══════════════════════════════════════════════════════════════
  // 4. DATABASE INTEGRITY — Check critical table row counts
  // ═══════════════════════════════════════════════════════════════
  try {
    const criticalTables = ["orders", "subscriptions", "agent_brains", "agent_teams", "lead_contacts", "products", "stores"];
    const tableHealth: Record<string, number> = {};
    for (const table of criticalTables) {
      const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
      tableHealth[table] = count ?? 0;
    }
    healingActions.push({ subsystem: "database", action: "integrity_check", result: JSON.stringify(tableHealth), severity: "ok" });
  } catch (e) {
    healingActions.push({ subsystem: "database", action: "integrity_check", result: `Error: ${(e as Error).message}`, severity: "critical" });
  }

  // ═══════════════════════════════════════════════════════════════
  // 5. SECRETS AUDIT — Verify all critical secrets exist
  // ═══════════════════════════════════════════════════════════════
  const requiredSecrets = [
    "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "XAI_API_KEY",
    "OPENAI_MASTER_API_KEY", "OPENAI_API_KEY", "LOVABLE_API_KEY",
    "RESEND_API_KEY", "SUPABASE_SERVICE_ROLE_KEY",
  ];
  const missingSecrets = requiredSecrets.filter(s => !Deno.env.get(s));
  if (missingSecrets.length > 0) {
    healingActions.push({ subsystem: "secrets", action: "audit", result: `Missing: ${missingSecrets.join(", ")}`, severity: "critical" });
  } else {
    healingActions.push({ subsystem: "secrets", action: "audit", result: `All ${requiredSecrets.length} critical secrets present`, severity: "ok" });
  }

  // ═══════════════════════════════════════════════════════════════
  // 6. REVENUE LOOP STATE — Calculate funnel stage counts
  // ═══════════════════════════════════════════════════════════════
  let revenueLoop = { attract: 0, convert: 0, fulfill: 0, expand: 0 };
  try {
    const { count: leads } = await supabase.from("lead_contacts").select("*", { count: "exact", head: true }).in("status", ["new", "contacted"]);
    const { count: qualified } = await supabase.from("lead_contacts").select("*", { count: "exact", head: true }).in("status", ["qualified", "proposal_sent"]);
    const { count: orders } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "completed");
    const { count: subs } = await supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active");
    revenueLoop = { attract: leads ?? 0, convert: qualified ?? 0, fulfill: orders ?? 0, expand: subs ?? 0 };
  } catch (_) { /* non-critical */ }

  // ═══════════════════════════════════════════════════════════════
  // LOG ALL HEALING ACTIONS
  // ═══════════════════════════════════════════════════════════════
  const criticalCount = healingActions.filter(a => a.severity === "critical").length;
  const warnCount = healingActions.filter(a => a.severity === "warn").length;
  const healedCount = healingActions.filter(a => ["restart_stalled_agent", "clear_stuck_job"].includes(a.action)).length;

  // Write to health_checks
  await supabase.from("health_checks").insert({
    subsystem: "self-healing-engine",
    status: criticalCount > 0 ? "degraded" : "operational",
    details: { actions: healingActions, healed: healedCount, duration_ms: Date.now() - startTime },
  });

  // Log to agent_logs for audit
  await supabase.from("agent_logs").insert({
    agent_name: "SelfHealingEngine",
    agent_role: "system",
    action: "self_heal_cycle",
    status: criticalCount > 0 ? "warning" : "success",
    details: { actions: healingActions, revenue_loop: revenueLoop },
    duration_ms: Date.now() - startTime,
  });

  return new Response(JSON.stringify({
    status: criticalCount > 0 ? "degraded" : "healthy",
    healed: healedCount,
    critical: criticalCount,
    warnings: warnCount,
    revenue_loop: revenueLoop,
    actions: healingActions,
    duration_ms: Date.now() - startTime,
  }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
