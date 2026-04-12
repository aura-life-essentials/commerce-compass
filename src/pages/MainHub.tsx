import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Globe2,
  Layers3,
  LineChart,
  Package,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSEOHead } from "@/hooks/useSEOHead";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { useStores } from "@/hooks/useStores";
import { ShopifyProductCard } from "@/components/store/ShopifyProductCard";
import { ShopifyCartDrawer } from "@/components/store/ShopifyCartDrawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuraOmegaLogo } from "@/components/branding/AuraOmegaLogo";
import { getOfferSummary, parseApps, generateOffers } from "@/lib/appMonetization";

const platformApps = parseApps(`CEO Brain | AI Agents | Runs executive orchestration across growth, pricing, and offers | 299
Autonomous Sales Network | AI Agents | Activates specialized sales teams across research, content, and closing | 499
200-Agent Autonomous Sales Network | AI Agents | Deploys 40 teams of 5 for enterprise sales execution | 1499
Checkout Conversion Engine | E-commerce | Lifts checkout conversion and average order value | 149
Content Factory | Media / Content | Produces campaigns, creative, scripts, and assets at speed | 179
Web3 Launch Engine | Web3 | Launches token, NFT, and community-ready growth systems | 249`);

const monetizationSummary = getOfferSummary(generateOffers(platformApps, "enterprise"));

const capabilityCards = [
  {
    icon: Globe2,
    title: "Global revenue command",
    description: "Run product sales, subscription offers, and enterprise deal surfaces from one commercial front door.",
  },
  {
    icon: Store,
    title: "Store sync visibility",
    description: "Surface connected store infrastructure here as the main commerce layer with room for broader aggregation.",
  },
  {
    icon: Bot,
    title: "Autonomous sales execution",
    description: "Position the CEO Brain and agent swarm as premium operating systems that move from insight into action.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-ready packaging",
    description: "Present tools, bundles, subscriptions, and physical products with stronger trust and higher-ticket framing.",
  },
];

const offerPillars = [
  "Physical product catalog",
  "Autonomous sales systems",
  "Operator bundles & suites",
  "High-ticket enterprise offers",
];

export default function MainHub() {
  useSEOHead({
    title: "Aura Omega Enterprise Sales Hub",
    description: "Aura Omega unifies products, agent systems, subscriptions, and enterprise offers into one polished global sales hub.",
  });

  const { data: products, isLoading: productsLoading } = useShopifyProducts(8);
  const { data: stores } = useStores();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.18),transparent_58%)]" />
        <div className="absolute -left-24 top-40 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/50 blur-[150px]" />
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4 md:px-6">
            <Link to="/" className="min-w-0">
              <AuraOmegaLogo subtitle="Global Enterprise Sales Hub" className="max-w-[15rem]" />
            </Link>

            <div className="flex items-center gap-2 md:gap-3">
              <Link to="/auth">
                <Button variant="ghost">Admin login</Button>
              </Link>
              <Link to="/command-center">
                <Button variant="outline">Command center</Button>
              </Link>
              <ShopifyCartDrawer />
            </div>
          </div>
        </header>

        <main>
          <section className="container mx-auto px-4 pb-16 pt-10 md:px-6 md:pb-24 md:pt-16">
            <div className="grid items-end gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <Badge className="border-primary/30 bg-primary/10 text-primary">Unified commerce + enterprise operating layer</Badge>
                <div className="space-y-5">
                  <AuraOmegaLogo
                    variant="hero"
                    subtitle="Global enterprise sales hub"
                    className="max-w-full"
                  />
                  <div className="space-y-4">
                    <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
                      The global sales system for every store, tool, and flagship offer you sell.
                    </h1>
                    <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
                      Aura Omega turns this app into the main commercial surface: products, subscriptions, agent systems, enterprise services, and live store intelligence in one polished revenue engine.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to="/store">
                    <Button size="lg" className="gap-2">
                      Shop products <ShoppingBag className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button size="lg" variant="outline" className="gap-2">
                      Explore offers <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {offerPillars.map((pillar) => (
                    <Badge key={pillar} variant="outline" className="border-border/80 bg-card/40 px-3 py-1 text-muted-foreground">
                      {pillar}
                    </Badge>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <Card className="border-primary/20 bg-card/70 backdrop-blur-xl sm:col-span-2">
                  <CardHeader>
                    <CardDescription>Main revenue stack</CardDescription>
                    <CardTitle className="text-3xl">Enterprise monetization ladder</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Entry offer</p>
                      <p className="text-3xl font-semibold">${monetizationSummary.entryPrice}/mo</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Flagship suite</p>
                      <p className="text-3xl font-semibold">${monetizationSummary.flagshipPrice}/mo</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Offer stack value</p>
                      <p className="text-3xl font-semibold">${monetizationSummary.monthlyRevenue}/mo</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/70">
                  <CardHeader>
                    <CardDescription>Connected stores</CardDescription>
                    <CardTitle className="text-4xl">{stores?.length ?? 0}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Current backend store records surfaced as part of the master commerce layer.
                  </CardContent>
                </Card>

                <Card className="bg-card/70">
                  <CardHeader>
                    <CardDescription>Catalog visibility</CardDescription>
                    <CardTitle className="text-4xl">{products?.length ?? 0}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Live storefront products feeding the main hub experience and checkout path.
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-8 md:px-6 md:py-12">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {capabilityCards.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <Card className="h-full bg-card/60 backdrop-blur-xl">
                      <CardHeader>
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle>{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section className="container mx-auto px-4 py-8 md:px-6 md:py-12">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <Badge variant="outline" className="border-primary/25 text-primary">Live commerce surface</Badge>
                <h2 className="text-3xl font-semibold md:text-4xl">Featured products from the main sales hub</h2>
                <p className="max-w-2xl text-muted-foreground">
                  Physical products stay side-by-side with software and enterprise offers so this app can operate as the single public storefront.
                </p>
              </div>
              <Link to="/store">
                <Button variant="outline" className="gap-2">
                  View full catalog <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {productsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="h-[22rem] animate-pulse bg-card/60" />
                ))}
              </div>
            ) : products?.length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {products.slice(0, 4).map((product) => (
                  <ShopifyProductCard key={product.node.id} product={product} />
                ))}
              </div>
            ) : (
              <Card className="bg-card/60">
                <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
                  <Package className="h-10 w-10 text-primary" />
                  <p className="text-lg font-medium text-foreground">No synced products found yet</p>
                  <p>Once products are available, this becomes the unified storefront for the full business stack.</p>
                </CardContent>
              </Card>
            )}
          </section>

          <section className="container mx-auto px-4 py-8 md:px-6 md:py-12">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <Card className="border-primary/20 bg-card/70">
                <CardHeader>
                  <CardDescription>Flagship systems</CardDescription>
                  <CardTitle className="text-3xl">Enterprise offers that sell the stack</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      icon: Rocket,
                      title: "200-Agent Autonomous Sales Network",
                      value: "$1499/mo",
                      description: "Forty 5-agent teams for research, content, marketing, closing, and analysis.",
                    },
                    {
                      icon: LineChart,
                      title: "Industry roadmap subscriptions",
                      value: "$97–$9,997/mo",
                      description: "Tiered strategic execution offers from foundation plans to partner-grade commitments.",
                    },
                    {
                      icon: Layers3,
                      title: "Revenue OS bundles",
                      value: "Layered pricing",
                      description: "Entry tools, bundles, suites, and optimization retainers for every buyer segment.",
                    },
                  ].map((offer) => {
                    const Icon = offer.icon;
                    return (
                      <div key={offer.title} className="rounded-2xl border border-border/80 bg-muted/25 p-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <Icon className="h-4 w-4" />
                            </div>
                            <h3 className="font-medium">{offer.title}</h3>
                          </div>
                          <Badge>{offer.value}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{offer.description}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-primary/20 bg-primary/10">
                <CardContent className="p-8 md:p-10">
                  <div className="max-w-3xl space-y-5">
                    <Badge className="bg-primary text-primary-foreground">
                      <Sparkles className="mr-2 h-3 w-3" /> Built to be the main one
                    </Badge>
                    <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
                      One public hub. One enterprise story. One command layer behind it.
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      The public side sells. The protected side operates. This structure lets the app function as the master commercial surface while the command center continues running intelligence, dashboards, and execution.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link to="/command-center">
                        <Button className="gap-2">
                          Open command center <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to="/store">
                        <Button variant="outline">Open storefront</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-border/60 bg-card/30 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-10 md:px-6">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-3">
                  <AuraOmegaLogo className="max-w-[10rem]" />
                  <p className="text-sm text-muted-foreground">
                    The unified commerce and enterprise operating layer.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Products</h4>
                  <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <Link to="/store" className="hover:text-foreground transition-colors">Store</Link>
                    <Link to="/apps" className="hover:text-foreground transition-colors">App Marketplace</Link>
                    <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                  </nav>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Company</h4>
                  <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
                    <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
                  </nav>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Legal</h4>
                  <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                    <Link to="/refunds" className="hover:text-foreground transition-colors">Refund Policy</Link>
                  </nav>
                </div>
              </div>
              <div className="mt-8 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Aura Omega. All rights reserved.
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
