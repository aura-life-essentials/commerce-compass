import { motion } from "framer-motion";
import { ArrowRight, Bot, Brain, Handshake, Mail, UserCheck, Workflow } from "lucide-react";
import { Link } from "react-router-dom";
import { useSEOHead } from "@/hooks/useSEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuraOmegaLogo } from "@/components/branding/AuraOmegaLogo";

const agents = [
  {
    icon: UserCheck,
    name: "Lead Qualifier",
    description: "Scores and qualifies every inbound lead with AI analysis — so you only talk to buyers who are ready.",
  },
  {
    icon: Mail,
    name: "Nurture Agent",
    description: "Sends personalized follow-up sequences that keep leads warm and moving toward a decision.",
  },
  {
    icon: Handshake,
    name: "Closer Agent",
    description: "Handles objections, crafts persuasive responses, and nudges prospects toward checkout.",
  },
  {
    icon: Workflow,
    name: "Onboarding Agent",
    description: "Creates tailored welcome and setup sequences the moment a customer pays — no manual work.",
  },
  {
    icon: Brain,
    name: "Orchestrator",
    description: "Routes every incoming task to the right agent automatically. The brain behind the operation.",
  },
];

const tiers = [
  { name: "Core", price: "$97", period: "/mo", features: ["Lead Qualifier + Nurture Agent", "Basic analytics", "500 leads/mo"], cta: "Get Started", link: "/pricing" },
  { name: "Pro", price: "$297", period: "/mo", features: ["All 5 AI Agents", "Full dashboard", "Unlimited leads"], cta: "Go Pro", link: "/pricing", popular: true },
  { name: "Enterprise", price: "Custom", period: "", features: ["Dedicated setup", "Custom integrations", "Account manager"], cta: "Contact Us", link: "/contact" },
];

export default function MainHub() {
  useSEOHead({
    title: "AuraOmega — Autonomous Revenue Operating System",
    description: "5 AI agents that qualify, nurture, close, and onboard your customers — while you sleep. Powered by The Grok Father 9.0.",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.18),transparent_58%)]" />
        <div className="absolute -left-24 top-40 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/50 blur-[150px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4 md:px-6">
            <Link to="/" className="min-w-0">
              <AuraOmegaLogo className="max-w-[15rem]" />
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <Link to="/pricing">
                <Button variant="ghost">Pricing</Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline">Get Started</Button>
              </Link>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="container mx-auto px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-20">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl text-center space-y-6">
              <Badge className="border-primary/30 bg-primary/10 text-primary">Autonomous Revenue Operating System</Badge>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                5 AI agents that qualify, nurture, close, and onboard your customers
                <span className="text-primary"> — while you sleep.</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                AuraOmega deploys real AI agents powered by The Grok Father 9.0 to automate your entire sales pipeline. No fake claims. No fluff. Just revenue on autopilot.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link to="/pricing">
                  <Button size="lg" className="gap-2">
                    See pricing <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline">Talk to us</Button>
                </Link>
              </div>
            </motion.div>
          </section>

          {/* Agent Showcase */}
          <section className="container mx-auto px-4 py-12 md:px-6 md:py-20">
            <div className="mb-12 text-center space-y-3">
              <Badge variant="outline" className="border-primary/25 text-primary">Your AI Sales Team</Badge>
              <h2 className="text-3xl font-bold md:text-4xl">5 specialized agents. One mission: revenue.</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Each agent handles a specific stage of your sales pipeline. They work together autonomously, logging every action for full transparency.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {agents.map((agent, index) => {
                const Icon = agent.icon;
                return (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <Card className="h-full bg-card/60 backdrop-blur-xl border-border/60 hover:border-primary/30 transition-colors">
                      <CardHeader>
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription className="text-sm">{agent.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Pricing Preview */}
          <section className="container mx-auto px-4 py-12 md:px-6 md:py-20">
            <div className="mb-12 text-center space-y-3">
              <h2 className="text-3xl font-bold md:text-4xl">Simple, honest pricing</h2>
              <p className="text-muted-foreground">No hidden fees. No NFT gimmicks. Cancel anytime.</p>
            </div>
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
              {tiers.map((tier) => (
                <Card key={tier.name} className={`relative bg-card/60 backdrop-blur-xl ${tier.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border/60"}`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle>{tier.name}</CardTitle>
                    <div className="pt-2">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground">{tier.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Bot className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to={tier.link} className="block">
                      <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
                        {tier.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="container mx-auto px-4 py-12 md:px-6 md:py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mx-auto max-w-3xl text-center rounded-3xl bg-primary/10 border border-primary/20 p-10 md:p-14"
            >
              <h2 className="text-3xl font-bold mb-4">Ready to automate your revenue?</h2>
              <p className="text-muted-foreground mb-8">
                Start with 2 agents at $97/mo or unlock the full team at $297/mo. Enterprise needs? Let's talk.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/pricing">
                  <Button size="lg" className="gap-2">Get started now <ArrowRight className="h-4 w-4" /></Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline">Contact sales</Button>
                </Link>
              </div>
            </motion.div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/60 bg-card/30 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-10 md:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-3">
                <AuraOmegaLogo className="max-w-[10rem]" />
                <p className="text-sm text-muted-foreground">
                  Autonomous revenue operating system.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Product</h4>
                <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                  <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
                </nav>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Company</h4>
                <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
                  <Link to="/auth" className="hover:text-foreground transition-colors">Sign In</Link>
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
            <div className="mt-8 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground space-y-1">
              <p>© 2024 Aura Lift Essentials. All rights reserved.</p>
              <p className="text-muted-foreground/50">Powered by The Grok Father 9.0 aka GROK 9 | Made by Ryan Puddy ~ WEB 3 ARCHITECT</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
