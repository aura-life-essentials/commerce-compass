import { Shield, CheckCircle, AlertTriangle, Lock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const checks = [
  { label: "No Deceptive Advertising", status: "pass", icon: CheckCircle },
  { label: "GDPR Compliance", status: "pass", icon: CheckCircle },
  { label: "Store Isolation Verified", status: "pass", icon: Lock },
  { label: "PII Protection Active", status: "pass", icon: Eye },
  { label: "Rate Limits Healthy", status: "warning", icon: AlertTriangle },
];

export const GovernancePanel = () => {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Governance & Safety</h3>
      </div>

      <div className="space-y-3">
        {checks.map((check) => (
          <div
            key={check.label}
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

      <div className="mt-6 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
        <p className="text-sm text-emerald-400 font-medium">
          All ethical constraints enforced
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Every action is explainable, reversible, and logged.
        </p>
      </div>
    </div>
  );
};
