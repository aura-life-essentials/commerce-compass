import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaunchConsentPanel } from "@/components/launch/LaunchConsentPanel";
import { AiActionAuditLog } from "@/components/launch/AiActionAuditLog";
import { useSEOHead } from "@/hooks/useSEOHead";

export default function LaunchSettings() {
  useSEOHead({
    title: "Launch settings — AuraOmega",
    description: "Approve which channels your AI agents can act on, and audit every action they take.",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <header className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs text-primary">
            <ShieldCheck className="w-3.5 h-3.5" /> Governance
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Launch settings & AI audit</h1>
          <p className="text-muted-foreground">
            Per-channel consent controls + a live ledger of every action your agents take.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link to="/influencers"><Button variant="outline" size="sm">Influencer program</Button></Link>
            <Link to="/my-apps"><Button variant="outline" size="sm">My apps</Button></Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <LaunchConsentPanel />
          <AiActionAuditLog />
        </div>
      </div>
    </div>
  );
}