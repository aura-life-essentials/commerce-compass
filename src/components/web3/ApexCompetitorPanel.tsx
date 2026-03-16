import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  AudioWaveform,
  BrainCircuit,
  Loader2,
  Radar,
  ScanSearch,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Waves,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type IntelSignal = {
  title: string;
  url: string;
  snippet: string;
  source: string;
};

type IntelMeta = {
  searchQueries: string[];
  sourcesScanned: number;
  partialFailure: boolean;
  warnings: string[];
  generatedAt: string;
};

type IntelResponse = {
  summary: string;
  themes: string[];
  opportunities: string[];
  threats: string[];
  watchlist: string[];
  signals: IntelSignal[];
  meta?: IntelMeta;
};

const seedBrands = ["OpenSea", "Coinbase", "Zora", "Base", "Mirror", "Shopify"];
const queryPresets = [
  "web3 social commerce growth platform",
  "creator economy protocol community monetization",
  "onchain marketplace discovery and distribution",
];

export function ApexCompetitorPanel() {
  const [brands, setBrands] = useState(seedBrands.join(", "));
  const [query, setQuery] = useState("web3 growth platform ai commerce social community marketplace");
  const [loading, setLoading] = useState(false);
  const [intel, setIntel] = useState<IntelResponse | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

  const brandList = useMemo(
    () => brands.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 8),
    [brands],
  );

  const runScan = async () => {
    if (!query.trim()) {
      toast.error("Add a market query first.");
      return;
    }

    setLoading(true);
    setErrorState(null);
    try {
      const { data, error } = await supabase.functions.invoke("apex-intelligence", {
        body: {
          query: query.trim(),
          brands: brandList,
        },
      });

      if (error) throw error;
      if ((data as { error?: string })?.error) {
        throw new Error((data as { error: string }).error);
      }

      setIntel(data as IntelResponse);
      toast.success("Competitor radar updated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to scan competitors.";
      setErrorState(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="apex-panel overflow-hidden border-border/70">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Badge variant="secondary" className="mb-3 border-0 bg-primary/15 text-primary">
                <Radar className="mr-1 h-3.5 w-3.5" />
                Live competitor intelligence
              </Badge>
              <CardTitle className="text-2xl">Stay ahead of the market in real time</CardTitle>
              <CardDescription>
                Scan the web for product, platform, growth, community, and commerce signals powering the next Web3 leaders.
              </CardDescription>
            </div>
            <Button onClick={runScan} disabled={loading} className="min-w-36 rounded-2xl">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
              {loading ? "Scanning" : "Run live scan"}
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Market query</label>
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                maxLength={180}
                placeholder="Search the frontier of web3, social, sales, creator and community platforms"
                className="bg-background/60"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Track these brands</label>
              <Input
                value={brands}
                onChange={(event) => setBrands(event.target.value)}
                maxLength={160}
                placeholder="OpenSea, Base, Coinbase, Zora"
                className="bg-background/60"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {queryPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setQuery(preset)}
                className="rounded-full border border-border/70 bg-secondary/35 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {preset}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="grid gap-4">
          {loading ? (
            <div className="grid gap-4">
              <div className="rounded-3xl border border-border/60 bg-secondary/30 p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
                  <Waves className="h-4 w-4 animate-pulse" />
                  Live scan in progress
                </div>
                <p className="text-sm leading-7 text-muted-foreground">
                  Sweeping live sources, deduplicating results, and synthesizing the strongest platform signals into one operator readout.
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="rounded-3xl border border-border/60 bg-secondary/25 p-4">
                    <div className="mb-3 h-4 w-24 rounded-full bg-muted/70" />
                    <div className="space-y-2">
                      <div className="h-10 rounded-2xl bg-muted/50" />
                      <div className="h-10 rounded-2xl bg-muted/40" />
                      <div className="h-10 rounded-2xl bg-muted/30" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : errorState ? (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-destructive">
                <ShieldAlert className="h-4 w-4" />
                Live scan blocked
              </div>
              <p className="text-sm leading-7 text-foreground/90">{errorState}</p>
            </div>
          ) : intel ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-border/60 bg-secondary/30 p-5"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <BrainCircuit className="h-4 w-4" />
                    Strategic readout
                  </div>
                  {intel.meta?.sourcesScanned ? (
                    <Badge variant="outline" className="border-border/70 text-muted-foreground">
                      {intel.meta.sourcesScanned} live sources
                    </Badge>
                  ) : null}
                </div>
                <p className="text-base leading-7 text-foreground/90">{intel.summary}</p>
                {intel.meta?.partialFailure ? (
                  <p className="mt-4 text-xs uppercase tracking-[0.2em] text-warning">
                    Partial scan recovery active
                  </p>
                ) : null}
              </motion.div>

              <div className="grid gap-4 lg:grid-cols-3">
                <InsightList title="Themes" icon={Sparkles} items={intel.themes} />
                <InsightList title="Opportunities" icon={TrendingUp} items={intel.opportunities} />
                <InsightList title="Threats" icon={Target} items={intel.threats} />
              </div>

              <InsightList title="Watchlist" icon={Radar} items={intel.watchlist} />
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-border/70 bg-secondary/20 p-10 text-center">
              <AudioWaveform className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">No scan yet</h3>
              <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground">
                Launch the live scan to map competitor moves, identify attack surfaces, and spot where this ecosystem can outrun social, sales, and Web3 incumbents.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="apex-panel border-border/70">
        <CardHeader>
          <Badge variant="secondary" className="mb-3 w-fit border-0 bg-primary/15 text-primary">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            Signal stream
          </Badge>
          <CardTitle className="text-2xl">External signals shaping the category</CardTitle>
          <CardDescription>
            The strongest live pages discovered for your current market thesis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {intel?.signals?.length ? (
            intel.signals.map((signal) => (
              <a
                key={`${signal.url}-${signal.title}`}
                href={signal.url}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-2xl border border-border/60 bg-secondary/25 p-4 transition-all hover:border-primary/40 hover:bg-secondary/40"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary">{signal.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{signal.source}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{signal.snippet}</p>
              </a>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 p-8 text-sm text-muted-foreground">
              Run a scan to populate the live signal stream.
            </div>
          )}

          {intel?.meta?.warnings?.length ? (
            <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-warning">Scan warnings</p>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-foreground/85">
                {intel.meta.warnings.map((warning) => (
                  <li key={warning}>• {warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

type InsightListProps = {
  title: string;
  icon: typeof Sparkles;
  items: string[];
};

function InsightList({ title, icon: Icon, items }: InsightListProps) {
  return (
    <div className="rounded-3xl border border-border/60 bg-secondary/25 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      <div className="space-y-2">
        {items?.length ? (
          items.map((item) => (
            <div key={item} className="rounded-2xl bg-background/40 px-3 py-2 text-sm leading-6 text-foreground/85">
              {item}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No signals yet.</p>
        )}
      </div>
    </div>
  );
}
