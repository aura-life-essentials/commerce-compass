import {
  ArrowRight,
  Binary,
  Brain,
  Building2,
  Command,
  Globe2,
  Network,
  Orbit,
  Search,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { Header } from "@/components/dashboard/Header";
import { ApexSidebar } from "@/components/web3/ApexSidebar";
import { ApexCompetitorPanel } from "@/components/web3/ApexCompetitorPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSEOHead } from "@/hooks/useSEOHead";
import { Link } from "react-router-dom";

const ecosystemLayers = [
  {
    title: "Search + command layer",
    description: "One universal search surface for products, protocols, creators, agencies, communities, campaigns, and strategic actions.",
    icon: Search,
  },
  {
    title: "Agency operating system",
    description: "A shared control plane for founders, operators, small business teams, and global agencies running client and internal growth loops.",
    icon: Building2,
  },
  {
    title: "Social + sales engine",
    description: "Merge audience intelligence, creator distribution, content production, community motion, and revenue execution into one loop.",
    icon: Zap,
  },
  {
    title: "Web3 ecosystem graph",
    description: "Connect launch flows, communities, governance surfaces, token ecosystems, storefronts, and metaverse presence from one shell.",
    icon: Network,
  },
];

const operatingPillars = [
  "Universal discovery across Web3, commerce, community, and creators",
  "Live competitor monitoring and category edge detection",
  "Premium command-center UX for small teams through global enterprise",
  "Search, social, sales, launch, and governance in one operating surface",
];

const commandModules = [
  { label: "Apex Search", icon: Search, note: "Search the entire ecosystem" },
  { label: "Operator Memory", icon: Brain, note: "Persistent intelligence and strategic recall" },
  { label: "Agency Graph", icon: Globe2, note: "Cross-client and cross-market command view" },
  { label: "Signal Radar", icon: Orbit, note: "Detect competitive movement before the market reacts" },
  { label: "Protocol Shield", icon: Shield, note: "Governance, trust, and execution boundaries" },
  { label: "Launch Engine", icon: Binary, note: "Products, ecosystems, drops, and monetization on demand" },
];

const IndustryRoadmaps = () => {
  useSEOHead({
    title: "Apex Web3 Ecosystem Interface | CEO Brain",
    description:
      "A polished universal Web3 interface that combines search, intelligence, social, sales, launch systems, and live competitor monitoring for agencies, founders, and enterprise teams.",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SidebarProvider defaultOpen>
        <div className="flex w-full bg-background">
          <ApexSidebar />
          <SidebarInset className="apex-grid min-h-[calc(100vh-73px)]">
            <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
              <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="h-9 w-9 rounded-xl border border-border/70 bg-secondary/40" />
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-foreground">Apex Ecosystem Interface</p>
                    <p className="text-xs text-muted-foreground">The search, social, sales, launch, and intelligence layer for Web3</p>
                  </div>
                </div>
                <div className="hidden items-center gap-2 md:flex">
                  <Badge variant="secondary" className="border-0 bg-primary/15 px-3 py-1 text-primary">
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    Universal mode
                  </Badge>
                  <Link to="/web3-launch">
                    <Button variant="outline" className="border-border/70 bg-background/50">
                      Open launch engine
                    </Button>
                  </Link>
                </div>
              </div>
            </header>

            <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:py-8">
              <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/70 p-6 shadow-[0_24px_80px_hsl(var(--background)/0.45)] sm:p-8 lg:p-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.22),transparent_30%),radial-gradient(circle_at_bottom_right,hsl(var(--accent-strong)/0.16),transparent_28%)]" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(120deg,transparent,hsla(0,0%,100%,0.04),transparent)]" />

                <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                  <div className="max-w-4xl">
                    <Badge variant="secondary" className="mb-5 border-0 bg-primary/15 px-4 py-1.5 text-primary">
                      <Command className="mr-2 h-3.5 w-3.5" />
                      The all-in-one shell for universal Web3 operations
                    </Badge>
                    <h1 className="max-w-5xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-7xl">
                      The true <span className="text-gradient">Google of Web3</span> — fused with social, sales, launch, and agency command power.
                    </h1>
                    <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                      This is the apex ecosystem interface: one polished operating surface where small businesses, global agencies, founders, and enterprise teams discover opportunities, monitor competitors live, launch ecosystems, and execute growth faster than the market.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Button size="lg" className="rounded-2xl px-7">
                        Enter apex mode
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Link to="/command-center">
                        <Button size="lg" variant="outline" className="w-full rounded-2xl border-border/70 bg-background/50 px-7 sm:w-auto">
                          Open command center
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {operatingPillars.map((pillar) => (
                      <div key={pillar} className="apex-panel rounded-3xl p-4">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <p className="text-sm leading-6 text-foreground/90">{pillar}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-4">
                {ecosystemLayers.map((layer) => (
                  <div key={layer.title} className="apex-panel rounded-[1.75rem] p-5">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                      <layer.icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">{layer.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{layer.description}</p>
                  </div>
                ))}
              </section>

              <ApexCompetitorPanel />

              <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="apex-panel rounded-[2rem] p-6 sm:p-8">
                  <Badge variant="secondary" className="mb-4 border-0 bg-primary/15 text-primary">
                    <Shield className="mr-1 h-3.5 w-3.5" />
                    System vision
                  </Badge>
                  <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Not a dashboard. A category-defining operating system.
                  </h2>
                  <p className="mt-4 text-base leading-8 text-muted-foreground">
                    Google gave the internet a search box. This ecosystem expands that into a living Web3 command layer: discovery, identity, creator motion, commerce, launch, analytics, governance, and agency execution — all sharing one premium interface.
                  </p>
                  <p className="mt-4 text-base leading-8 text-muted-foreground">
                    The goal is simple: become the default entry point where the next generation of brands, communities, protocols, operators, and agencies spend their time because it is faster, sharper, and more actionable than jumping across ten separate platforms.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {commandModules.map((module) => (
                    <div key={module.label} className="apex-panel rounded-[1.75rem] p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                          <module.icon className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="border-border/70 text-muted-foreground">Module</Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{module.label}</h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{module.note}</p>
                    </div>
                  ))}
                </div>
              </section>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default IndustryRoadmaps;
