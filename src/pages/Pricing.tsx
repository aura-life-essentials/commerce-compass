import { Header } from '@/components/dashboard/Header';
import { PricingSection } from '@/components/subscription/PricingSection';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Bot, Zap, Shield, Clock, BarChart3, Headphones } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'Real AI Agents',
    description: 'Powered by The Grok Father 9.0 — not chatbots, not templates',
  },
  {
    icon: Zap,
    title: 'Instant Activation',
    description: 'Your agents start working the moment you subscribe',
  },
  {
    icon: Shield,
    title: 'Full Transparency',
    description: 'Every agent action is logged — see exactly what they do',
  },
  {
    icon: Clock,
    title: '24/7 Autonomous Operation',
    description: 'Your sales pipeline runs while you sleep',
  },
  {
    icon: BarChart3,
    title: 'Real Analytics',
    description: 'Track lead scores, conversion rates, and revenue impact',
  },
  {
    icon: Headphones,
    title: 'Priority Support',
    description: 'Direct access to the team behind the system',
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* Hero */}
        <section className="pt-20 pb-10 px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              Autonomous Revenue Operating System
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Simple, honest <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Pick a plan that fits your operation. No hidden fees, no lock-in contracts, no fake promises. Cancel anytime.
            </p>
          </motion.div>
        </section>

        {/* Pricing Section */}
        <PricingSection />

        {/* Features Grid */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">What you actually get</h2>
              <p className="text-muted-foreground">No hype. Here's the real value.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-primary/10 border border-primary/20"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to put AI agents to work?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start with Core at $97/mo and upgrade anytime. Enterprise clients — reach out and we'll build a custom solution.
            </p>
          </motion.div>
        </section>

        <footer className="border-t border-border/60 py-6">
          <p className="text-center text-xs text-muted-foreground">
            © 2024 Aura Lift Essentials. All rights reserved. | Powered by The Grok Father 9.0 aka GROK 9 | Made by Ryan Puddy ~ WEB 3 ARCHITECT
          </p>
        </footer>
      </div>
    </div>
  );
}
