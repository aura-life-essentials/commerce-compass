import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, AlertTriangle, Ban } from "lucide-react";
import { toast } from "sonner";

/**
 * Aura Omegas Grok CEO Override panel — calls the grok-ceo-override edge function with a
 * proposal (free-form JSON or text). Shows verdict, rationale, and revised
 * actions. Every call is auto-logged to ai_action_audit.
 */
export function GrokCeoOverride() {
  const [proposal, setProposal] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<any | null>(null);

  const submit = async () => {
    if (!proposal.trim()) {
      toast.error("Add a proposal for Grok to review");
      return;
    }
    setLoading(true);
    setDecision(null);
    try {
      let parsedProposal: unknown = proposal;
      try {
        parsedProposal = JSON.parse(proposal);
      } catch {
        // keep as raw string
      }
      const { data, error } = await supabase.functions.invoke("grok-ceo-override", {
        body: { proposal: parsedProposal, context: context || undefined },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Aura Omegas Grok override failed");
      setDecision(data.decision);
      toast.success(`Aura Omegas Grok verdict: ${data.decision.verdict.toUpperCase()}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Override failed");
    } finally {
      setLoading(false);
    }
  };

  const verdictMeta = (v?: string) => {
    if (v === "approve") return { Icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40" };
    if (v === "override") return { Icon: AlertTriangle, color: "bg-amber-500/20 text-amber-200 border-amber-500/40" };
    if (v === "veto") return { Icon: Ban, color: "bg-red-500/20 text-red-200 border-red-500/40" };
    return { Icon: ShieldCheck, color: "bg-muted text-muted-foreground" };
  };

  const meta = verdictMeta(decision?.verdict);

  return (
    <Card className="oro-card p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Aura Omegas Grok — CEO Override</h3>
          <p className="text-sm text-muted-foreground">
            Top-level autonomous decision authority, branded as Aura Omegas Grok. Every call logged to audit trail.
          </p>
        </div>
        <Badge variant="outline" className="border-primary/40 text-primary">Aura Omegas Grok · grok-4-1-fast-reasoning</Badge>
      </header>

      <div className="space-y-2">
        <label className="text-sm font-medium">Proposal for Aura Omegas Grok (JSON or text)</label>
        <Textarea
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          placeholder='{"action":"Launch IG campaign","budget":0,"channels":["instagram","reddit"]}'
          rows={6}
          className="font-mono text-xs"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Context (optional)</label>
        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="What is the consensus engine recommending and why?"
          rows={3}
        />
      </div>

      <Button onClick={submit} disabled={loading} className="w-full glow-oro">
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {loading ? "Aura Omegas Grok reviewing…" : "Submit to Aura Omegas Grok"}
      </Button>

      {decision ? (
        <div className={`rounded-lg border p-4 space-y-3 ${meta.color}`}>
          <div className="flex items-center gap-2 font-semibold uppercase text-sm">
            <meta.Icon className="w-4 h-4" />
            Verdict: {decision.verdict}
            <Badge variant="outline" className="ml-auto">
              confidence {(decision.confidence * 100).toFixed(0)}%
            </Badge>
          </div>
          <p className="text-sm">{decision.rationale}</p>
          {decision.revised_actions?.length ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase opacity-80">Revised actions</p>
              <ul className="text-sm space-y-1">
                {decision.revised_actions.map((a: any, i: number) => (
                  <li key={i} className="flex gap-2">
                    <Badge variant="outline" className="text-[10px]">{a.priority}</Badge>
                    <span className="flex-1">
                      <strong>{a.action}</strong> — {a.reason}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {decision.risks?.length ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase opacity-80">Risks</p>
              <ul className="text-sm list-disc pl-5 space-y-0.5">
                {decision.risks.map((r: string, i: number) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}