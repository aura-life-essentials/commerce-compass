import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Boxes, Layers3, Sparkles, Wand2 } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateOffers, getOfferSummary, parseApps, type MonetizationAudience } from '@/lib/appMonetization';
import { useNavigate } from 'react-router-dom';

const audienceOptions: { value: MonetizationAudience; label: string }[] = [
  { value: 'solo-founders', label: 'Solo founders' },
  { value: 'agencies', label: 'Agencies' },
  { value: 'brands-startups', label: 'Brands / startups' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'autonomous-network', label: '200-agent network' },
];

const defaultApps = `CEO Brain | AI Agents | Runs strategic decisions and agent orchestration | 299
Autonomous Sales Network | AI Agents | Automates the full sales cycle from research to close | 499
200-Agent Autonomous Sales Network | AI Agents | Deploys 40 teams with interchangeable brains across research, content, market, close, and analysis | 1499
Checkout Conversion Engine | E-commerce | Lifts conversion rate with upsells and cart optimization | 149
Web3 Launch Engine | Web3 | Launches communities, tokens, NFTs, and investor-ready assets | 249
Content Factory | Media / Content | Produces videos, scripts, voiceovers, and presentations fast | 179`;

export default function AppMonetizer() {
  const navigate = useNavigate();
  const [catalogName, setCatalogName] = useState('Revenue OS');
  const [audience, setAudience] = useState<MonetizationAudience>('autonomous-network');
  const [appsInput, setAppsInput] = useState(defaultApps);

  const apps = useMemo(() => parseApps(appsInput), [appsInput]);
  const offers = useMemo(() => generateOffers(apps, audience), [apps, audience]);
  const summary = useMemo(() => getOfferSummary(offers), [offers]);

  const groupedOffers = useMemo(() => ({
    individual: offers.filter((offer) => offer.type === 'individual'),
    bundle: offers.filter((offer) => offer.type === 'bundle'),
    suite: offers.filter((offer) => offer.type === 'suite'),
    upsell: offers.filter((offer) => offer.type === 'upsell'),
  }), [offers]);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.18),transparent_55%)]" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-6 py-10 space-y-8">
          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-start">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <Badge className="bg-primary/15 text-primary border-primary/30">Monthly subscription architect</Badge>
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Turn your apps into individual tools, bundles, suites, and high-margin upsells.</h1>
                <p className="text-muted-foreground max-w-2xl">Add your apps now and I’ll instantly structure a monetization ladder with entry offers, expansion bundles, flagship suites, and recurring add-ons — including premium packaging for command-center products like your 200-Agent Autonomous Sales Network.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="glass-subtle">
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">Entry price</p>
                    <p className="text-2xl font-semibold">${summary.entryPrice}</p>
                  </CardContent>
                </Card>
                <Card className="glass-subtle">
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">Flagship suite</p>
                    <p className="text-2xl font-semibold">${summary.flagshipPrice}</p>
                  </CardContent>
                </Card>
                <Card className="glass-subtle">
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">Offer stack total</p>
                    <p className="text-2xl font-semibold">${summary.monthlyRevenue}</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <Card className="glass overflow-hidden border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5 text-primary" /> App intake</CardTitle>
                  <CardDescription>Format each app as: Name | Category | Outcome | Base monthly value</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Catalog / suite brand</label>
                    <Input value={catalogName} onChange={(e) => setCatalogName(e.target.value)} placeholder="Revenue OS" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Primary buyer</label>
                    <div className="flex flex-wrap gap-2">
                      {audienceOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={audience === option.value ? 'default' : 'outline'}
                          onClick={() => setAudience(option.value)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Apps to monetize</label>
                    <Textarea value={appsInput} onChange={(e) => setAppsInput(e.target.value)} className="min-h-[240px]" />
                  </div>

                  <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-2">Fast monetization rules</p>
                    <ul className="space-y-1 list-disc pl-5">
                      <li>Use individual tools as entry offers to reduce decision friction.</li>
                      <li>Use bundles to raise average revenue per account.</li>
                      <li>Use suites for agencies, enterprise, and your 200-agent flagship positioning.</li>
                      <li>Use done-for-you and optimization add-ons as recurring upsells.</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                    <p className="text-sm font-medium text-foreground">Flagship app loaded</p>
                    <p className="mt-1 text-sm text-muted-foreground">200-Agent Autonomous Sales Network • 40 teams × 5 agents • Strategic, Creative, Aggressive, Persuasive, Analytical brains • Research → Content → Market → Close → Analyze</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          <section>
            <Card className="glass border-border/80">
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>{catalogName} monetization matrix</CardTitle>
                  <CardDescription>{apps.length} apps converted into a layered monthly offer ladder.</CardDescription>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => navigate('/pricing')}>Open pricing page</Button>
                  <Button onClick={() => navigate('/subscription')}>
                    Prepare checkout path <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="individual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-transparent p-0">
                    <TabsTrigger value="individual">Individual</TabsTrigger>
                    <TabsTrigger value="bundle">Bundles</TabsTrigger>
                    <TabsTrigger value="suite">Suites</TabsTrigger>
                    <TabsTrigger value="upsell">Upsells</TabsTrigger>
                  </TabsList>

                  {(['individual', 'bundle', 'suite', 'upsell'] as const).map((tab) => (
                    <TabsContent key={tab} value={tab} className="mt-6">
                      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {groupedOffers[tab].map((offer) => (
                          <Card key={offer.name} className="border-border/80 bg-card/70">
                            <CardHeader>
                              <div className="flex items-center justify-between gap-3">
                                <Badge variant="outline" className="border-primary/30 text-primary capitalize">{offer.type}</Badge>
                                <span className="text-2xl font-semibold">${offer.price}<span className="text-sm text-muted-foreground">/mo</span></span>
                              </div>
                              <CardTitle className="text-xl flex items-center gap-2">
                                {offer.type === 'individual' && <Sparkles className="w-4 h-4 text-primary" />}
                                {offer.type === 'bundle' && <Boxes className="w-4 h-4 text-primary" />}
                                {offer.type === 'suite' && <Layers3 className="w-4 h-4 text-primary" />}
                                {offer.type === 'upsell' && <Wand2 className="w-4 h-4 text-primary" />}
                                {offer.name}
                              </CardTitle>
                              <CardDescription>{offer.pitch}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {offer.includes.map((item) => (
                                <div key={item} className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                                  {item}
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
