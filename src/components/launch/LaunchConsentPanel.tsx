import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LAUNCH_CHANNELS } from "@/lib/launchChannels";
import { useLaunchConsents } from "@/hooks/useLaunchConsents";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LaunchConsentPanel({ compact = false }: { compact?: boolean }) {
  const { consents, setConsent, loading } = useLaunchConsents();

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await setConsent(key, value);
      toast.success(`${value ? "Approved" : "Disabled"} ${key.replace("social_", "")}`);
    } catch (e: any) {
      toast.error(e.message ?? "Could not save consent");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  const groups = {
    social: LAUNCH_CHANNELS.filter((c) => c.category === "social"),
    direct: LAUNCH_CHANNELS.filter((c) => c.category === "direct"),
    partner: LAUNCH_CHANNELS.filter((c) => c.category === "partner"),
  };

  return (
    <Card className="oro-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Launch consents
          <Badge variant="outline" className="ml-2 text-xs">
            You control every channel
          </Badge>
        </CardTitle>
        {!compact && (
          <p className="text-xs text-muted-foreground">
            Agents only act on channels you've explicitly approved here. Toggle off anytime to instantly stop new activity.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        {(["social", "direct", "partner"] as const).map((cat) => (
          <div key={cat}>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {cat === "social" ? "Social channels" : cat === "direct" ? "Direct outreach" : "Partner program"}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {groups[cat].map((c) => (
                <label
                  key={c.key}
                  className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/40 p-3 cursor-pointer hover:border-primary/40 transition"
                >
                  <Switch
                    checked={!!consents[c.key]}
                    onCheckedChange={(v) => handleToggle(c.key, v)}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{c.label}</div>
                    <div className="text-xs text-muted-foreground">{c.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}