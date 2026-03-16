import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  AudioWaveform,
  BrainCircuit,
  Loader2,
  Radar,
  ScanSearch,
  Sparkles,
  Target,
  TrendingUp,
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

type IntelResponse = {
  summary: string;
  themes: string[];
  opportunities: string[];
  threats: string[];
  signals: IntelSignal[];
};

const seedBrands = ["OpenSea", "Coinbase", "Zora", "Base", "Mirror", "Shopify"];

export function ApexCompetitorPanel() {
  const [brands, setBrands] = useState(seedBrands.join(", "));
  const [query, setQuery] = useState("web3 growth platform ai commerce social community marketplace");
  const [loading, setLoading] = useState(false);
  const [intel, setIntel] = useState<IntelResponse | null>(null);

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
    try {
      const { data, error } = await supabase.functions.invoke("apex-intelligence", {
        body: {
          query: query.trim(),
          brands: brandList,
        },
      });

      if (error) throw error;
      setIntel(data as IntelResponse);
      toast.success("Competitor radar updated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to scan competitors.";
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
            <Button onClick={runScan} disabled={loading} className="min-w-36">
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
        </CardHeader>

        <CardContent className="grid gap-4">
          {intel ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-border/60 bg-secondary/30 p-5"
              >
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
                  <BrainCircuit className="h-4 w-4" />
                  Strategic readout
                </div>
                <p className="text-base leading-7 text-foreground/90">{intel.summary}</p>
              </motion.div>

              <div className="grid gap-4 lg:grid-cols-3">
                <InsightList
                  title="Themes"
                  icon={Sparkles}
                  items={intel.themes}
                />
                <InsightList
                  title="Opportunities"
                  icon={TrendingUp}
                  items={intel.opportunities}
                />
                <InsightList
                  title="Threats"
                  icon={Target}
                  items={intel.threats}
                />
              </div>
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
