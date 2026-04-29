import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles, Copy, ExternalLink, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSEOHead } from "@/hooks/useSEOHead";
import { useLaunchConsents } from "@/hooks/useLaunchConsents";
import { APP_PRODUCTS } from "@/lib/appProducts";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formatCurrency";

interface Deal {
  id: string;
  influencer_id: string;
  app_id: string;
  status: string;
  commission_rate: number;
  outreach_message: string | null;
  affiliate_code: string | null;
  affiliate_url: string | null;
  clicks: number;
  conversions: number;
  revenue_attributed: number;
  commission_owed: number;
  contacted_at: string | null;
  influencers: {
    handle: string;
    platform: string;
    display_name: string | null;
    follower_count: number | null;
    contact_url: string | null;
  } | null;
}

export default function Influencers() {
  useSEOHead({
    title: "Influencer program — AuraOmega",
    description: "Auto-discover creators, draft outreach, and track partner revenue.",
  });
  const { user } = useAuthContext();
  const { consents } = useLaunchConsents();
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [appId, setAppId] = useState("pro");
  const [niche, setNiche] = useState("AI builders, indie hackers, founders");
  const [count, setCount] = useState(8);
  const [commission, setCommission] = useState(20);
  const [running, setRunning] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("influencer_deals")
      .select("*, influencers(handle,platform,display_name,follower_count,contact_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setDeals((data as any) ?? []);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 6000);
    return () => clearInterval(t);
  }, [user]);

  const runAgents = async () => {
    if (!consents["influencer"]) {
      toast.error("Approve the Influencer channel in Launch settings first.");
      return;
    }
    setRunning(true);
    const t = toast.loading("Agents are scouting creators…");
    try {
      const { data, error } = await supabase.functions.invoke("influencer-outreach", {
        body: {
          app_id: appId,
          niche,
          count,
          commission_rate: commission / 100,
          origin: window.location.origin,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Drafted ${data.created} outreach messages`, { id: t });
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Agent run failed", { id: t });
    } finally {
      setRunning(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("influencer_deals").update({ status }).eq("id", id);
    toast.success(`Marked ${status}`);
    load();
  };

  const totals = (deals ?? []).reduce(
    (acc, d) => ({
      revenue: acc.revenue + Number(d.revenue_attributed || 0),
      commission: acc.commission + Number(d.commission_owed || 0),
      conversions: acc.conversions + (d.conversions || 0),
      active: acc.active + (d.status === "agreed" || d.status === "active" ? 1 : 0),
    }),
    { revenue: 0, commission: 0, conversions: 0, active: 0 },
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <header className="mb-6 space-y-2">
          <Badge className="bg-primary/10 text-primary border-primary/30">
            <Users className="w-3 h-3 mr-1" /> Influencer program
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold">Auto-partner with creators</h1>
          <p className="text-muted-foreground">
            Agents discover relevant influencers, generate personalized outreach, and track every deal — you take a small commission and they grow your distribution.
          </p>
          {!consents["influencer"] && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-200">
              Influencer outreach is disabled. <Link to="/launch-settings" className="underline">Enable it in Launch settings</Link>.
            </div>
          )}
        </header>

        <div className="grid gap-3 sm:grid-cols-4 mb-6">
          <Card className="oro-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Revenue attributed</div><div className="text-2xl font-bold">{formatCurrency(totals.revenue)}</div></CardContent></Card>
          <Card className="oro-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Commission owed</div><div className="text-2xl font-bold">{formatCurrency(totals.commission)}</div></CardContent></Card>
          <Card className="oro-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Conversions</div><div className="text-2xl font-bold">{totals.conversions}</div></CardContent></Card>
          <Card className="oro-card"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Active partners</div><div className="text-2xl font-bold">{totals.active}</div></CardContent></Card>
        </div>

        <Card className="oro-card border-primary/20 mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Run discovery agent
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-5">
            <div className="md:col-span-2">
              <Label className="text-xs">Niche</Label>
              <Input value={niche} onChange={(e) => setNiche(e.target.value)} maxLength={200} />
            </div>
            <div>
              <Label className="text-xs">Product</Label>
              <Select value={appId} onValueChange={setAppId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APP_PRODUCTS.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Count</Label>
              <Input type="number" min={1} max={15} value={count} onChange={(e) => setCount(Math.max(1, Math.min(15, Number(e.target.value))))} />
            </div>
            <div>
              <Label className="text-xs">Commission %</Label>
              <Input type="number" min={5} max={50} value={commission} onChange={(e) => setCommission(Math.max(5, Math.min(50, Number(e.target.value))))} />
            </div>
            <div className="md:col-span-5">
              <Button onClick={runAgents} disabled={running || !consents["influencer"]} className="bg-gradient-to-r from-primary to-cyan-500">
                {running ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Discovering…</> : "Find & draft outreach"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mb-3">Deals ({deals?.length ?? 0})</h2>
        {deals === null ? (
          <div className="flex justify-center p-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : deals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No deals yet. Run the agent to discover partners.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {deals.map((d) => (
              <Card key={d.id} className="oro-card border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between gap-2">
                    <span className="truncate">@{d.influencers?.handle ?? "unknown"} <span className="text-muted-foreground font-normal">· {d.influencers?.platform}</span></span>
                    <Badge variant={d.status === "agreed" ? "default" : "outline"} className="text-[10px]">{d.status}</Badge>
                  </CardTitle>
                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                    <span><DollarSign className="w-3 h-3 inline" /> {(d.commission_rate * 100).toFixed(0)}%</span>
                    {d.influencers?.follower_count ? <span>{d.influencers.follower_count.toLocaleString()} followers</span> : null}
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  {d.outreach_message && (
                    <div className="rounded-md bg-muted/30 p-2 text-xs whitespace-pre-wrap line-clamp-6 text-muted-foreground">
                      {d.outreach_message}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {d.affiliate_url && (
                      <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(d.affiliate_url!); toast.success("Affiliate link copied"); }}>
                        <Copy className="w-3 h-3 mr-1" /> Link
                      </Button>
                    )}
                    {d.outreach_message && (
                      <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(d.outreach_message!); toast.success("Outreach copied"); }}>
                        <Copy className="w-3 h-3 mr-1" /> Message
                      </Button>
                    )}
                    {d.influencers?.contact_url && (
                      <a href={d.influencers.contact_url} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="ghost"><ExternalLink className="w-3 h-3 mr-1" /> Profile</Button>
                      </a>
                    )}
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    {d.status !== "agreed" && <Button size="sm" variant="outline" onClick={() => updateStatus(d.id, "agreed")}>Mark agreed</Button>}
                    {d.status !== "declined" && <Button size="sm" variant="ghost" onClick={() => updateStatus(d.id, "declined")}>Declined</Button>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}