import { CheckCircle2, Loader2, Circle, Sparkles, Megaphone, FileText, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export type LaunchStatus = "pending" | "generating" | "ready" | "failed";

interface Step {
  key: string;
  label: string;
  icon: any;
  done: boolean;
  active: boolean;
}

export function LaunchStatusTracker({
  status,
  postsGenerated,
  pagesGenerated,
}: {
  status: LaunchStatus;
  postsGenerated: number;
  pagesGenerated: number;
}) {
  const isReady = status === "ready";
  const isGenerating = status === "generating" || status === "pending";
  const isFailed = status === "failed";

  const steps: Step[] = [
    { key: "init", label: "Launch initiated", icon: Rocket, done: true, active: false },
    { key: "social", label: `Social posts (${postsGenerated})`, icon: Megaphone, done: postsGenerated > 0, active: isGenerating && postsGenerated === 0 },
    { key: "seo", label: `SEO landing pages (${pagesGenerated})`, icon: FileText, done: pagesGenerated > 0, active: isGenerating && postsGenerated > 0 && pagesGenerated === 0 },
    { key: "ready", label: isFailed ? "Launch failed" : "Ready to publish", icon: Sparkles, done: isReady, active: isReady },
  ];

  return (
    <ol className="space-y-3">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        return (
          <li key={step.key} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border transition",
                step.done
                  ? "border-primary bg-primary/10 text-primary"
                  : step.active
                    ? "border-primary/50 text-primary animate-pulse"
                    : "border-border text-muted-foreground",
              )}
            >
              {step.done ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : step.active ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className={cn(step.done ? "text-foreground" : "text-muted-foreground")}>{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className="ml-3 h-3 w-px bg-border absolute" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}