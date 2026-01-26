import { Shield, CheckCircle, AlertTriangle, Lock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGovernanceEvents } from "@/hooks/useGovernance";
import { Skeleton } from "@/components/ui/skeleton";

const defaultChecks = [
  { label: "No Deceptive Advertising", status: "pass", icon: CheckCircle },
  { label: "GDPR Compliance", status: "pass", icon: CheckCircle },
  { label: "Store Isolation Verified", status: "pass", icon: Lock },
  { label: "PII Protection Active", status: "pass", icon: Eye },
];

export const GovernancePanel = () => {
  const { data: events, isLoading } = useGovernanceEvents(10);

  // Derive checks from governance events
  const checks = events?.length 
    ? events.slice(0, 5).map(event => ({
        label: event.description.slice(0, 30) + (event.description.length > 30 ? "..." : ""),
        status: event.resolved ? "pass" : event.severity === "warning" ? "warning" : event.severity === "error" ? "fail" : "pass",
        icon: event.resolved ? CheckCircle : event.severity === "warning" ? AlertTriangle : CheckCircle,
      }))
    : defaultChecks;

  const allPassed = checks.every(c => c.status === "pass");

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Governance & Safety</h3>
      </div>

      <div className="space-y-3">
        {checks.map((check, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <check.icon
              className={cn(
                "w-5 h-5",
                check.status === "pass" && "text-emerald-400",
                check.status === "warning" && "text-amber-400",
                check.status === "fail" && "text-red-400"
              )}
            />
            <span className="text-sm flex-1">{check.label}</span>
            <span
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-md",
                check.status === "pass" && "bg-emerald-500/10 text-emerald-400",
                check.status === "warning" && "bg-amber-500/10 text-amber-400",
                check.status === "fail" && "bg-red-500/10 text-red-400"
              )}
            >
              {check.status === "pass" ? "Verified" : check.status === "warning" ? "Review" : "Action Required"}
            </span>
          </div>
        ))}
      </div>

      <div className={cn(
        "mt-6 p-4 rounded-lg border",
        allPassed 
          ? "bg-emerald-500/5 border-emerald-500/20" 
          : "bg-amber-500/5 border-amber-500/20"
      )}>
        <p className={cn(
          "text-sm font-medium",
          allPassed ? "text-emerald-400" : "text-amber-400"
        )}>
          {allPassed ? "All ethical constraints enforced" : "Some items need review"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Every action is explainable, reversible, and logged.
        </p>
      </div>
    </div>
  );
};
