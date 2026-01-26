import { Header } from '@/components/dashboard/Header';
import { PricingSection } from '@/components/subscription/PricingSection';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Globe, Zap, Shield, Users, Sparkles, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Multi-Platform NFT Listings',
    description: 'Auto-list on OpenSea, Coinbase, Rarible, LooksRare, and Blur',
  },
  {
    icon: Zap,
    title: 'AI-Powered Service Delivery',
    description: 'Our autonomous agents execute your requests 24/7',
  },
  {
    icon: Shield,
    title: 'Smart Contract Security',
    description: 'Audited contracts with built-in royalty protections',
  },
  {
    icon: Users,
    title: 'DAO Governance Rights',
    description: 'Vote on platform direction and feature development',
  },
  {
    icon: Sparkles,
    title: 'Revenue Share NFTs',
    description: 'Earn passive income from platform success',
  },
  {
    icon: TrendingUp,
    title: 'Industry Roadmaps',
    description: 'Data-driven strategies for guaranteed revenue growth',
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Ambient glow effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* Hero */}
        <section className="pt-20 pb-10 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-cyan-500/20 border-primary/30">
              🚀 Limited Time Opportunity
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-400">Web3 Business</span> is Here
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Don't miss this small window of time and space. Get ahead of the game with data-driven industry roadmaps 
              and guaranteed revenue increase strategies.
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
              <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
              <p className="text-muted-foreground">Enterprise-grade Web3 infrastructure at your fingertips</p>
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
            className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-cyan-500/20 border border-primary/30"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Revolutionize Your Business?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the elite businesses already using our platform to generate massive revenue through Web3.
              Your subscription NFT can be traded, staked, or held for governance rights.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="outline" className="text-sm py-2 px-4">
                ✓ Cancel Anytime
              </Badge>
              <Badge variant="outline" className="text-sm py-2 px-4">
                ✓ NFT Ownership
              </Badge>
              <Badge variant="outline" className="text-sm py-2 px-4">
                ✓ Revenue Share
              </Badge>
              <Badge variant="outline" className="text-sm py-2 px-4">
                ✓ 24/7 AI Support
              </Badge>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
