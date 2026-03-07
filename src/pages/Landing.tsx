import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/dashboard/Header';
import { PricingSection } from '@/components/subscription/PricingSection';
import { Web3RoadmapHero } from '@/components/subscription/Web3RoadmapHero';
import { useDAO } from '@/hooks/useDAO';
import { 
  Globe, 
  Sparkles, 
  Shield, 
  Zap, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Play,
  Star,
  ChevronRight,
  Coins,
  Trophy,
  Rocket
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const ETH_USD_RATE = 3500;
const FUNDING_GOAL_USD = 30000;
const FUNDING_GOAL_ETH = FUNDING_GOAL_USD / ETH_USD_RATE;

const stats = [
  { value: '$2.4M+', label: 'Revenue Generated' },
  { value: '500+', label: 'Businesses Transformed' },
  { value: '15+', label: 'Countries' },
  { value: '99.9%', label: 'Uptime' },
];

const services = [
  {
    icon: Globe,
    title: 'Web3 Website Creation',
    description: 'Custom dApps and Web3 sites with wallet integration, NFT galleries, and crypto payments.',
  },
  {
    icon: Sparkles,
    title: 'NFT Collection Launch',
    description: 'Full NFT project setup with smart contracts, minting sites, and marketplace listings.',
  },
  {
    icon: Users,
    title: 'DAO Setup & Governance',
    description: 'Complete DAO infrastructure with voting systems, treasury management, and token distribution.',
  },
  {
    icon: TrendingUp,
    title: 'Industry Roadmaps',
    description: 'Data-driven strategies for guaranteed revenue increases using Web3 functionality.',
  },
  {
    icon: Shield,
    title: 'Crypto Payment Integration',
    description: 'Accept cryptocurrency payments on any website with automatic conversion and reporting.',
  },
  {
    icon: Zap,
    title: 'AI Agent Automation',
    description: '24/7 autonomous AI agents that handle customer requests and execute tasks.',
  },
];

export default function Landing() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { projects } = useDAO();
  
  // Get casino project data
  const casinoProject = projects.find(p => p.project_name.includes('Ultra Casino'));
  const currentFunding = casinoProject?.current_funding_eth || 0;
  const currentFundingUSD = currentFunding * ETH_USD_RATE;
  const progressPercent = (currentFunding / FUNDING_GOAL_ETH) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient glow effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <section className="pt-20 pb-32 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge className="mb-6 bg-gradient-to-r from-primary/20 to-cyan-500/20 border-primary/30 text-sm py-2 px-4">
                🚀 The Future of Business is Web3
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Transform Your Business with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-400">
                  Web3 Technology
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
                Don't miss this small window of time and space. Get ahead of the game with data-driven 
                industry roadmaps and guaranteed revenue increase strategies powered by AI.
              </p>

              <div className="flex flex-wrap gap-4 justify-center mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-lg px-8"
                  onClick={() => navigate('/pricing')}
                >
                  View Pricing <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8"
                  onClick={() => navigate('/store')}
                >
                  <Play className="w-5 h-5 mr-2" /> Browse Store
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 justify-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Enterprise Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>24/7 AI Support</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured: Ultra Casino Launch */}
        <section className="py-12 px-6 bg-gradient-to-r from-amber-900/20 via-background to-purple-900/20 border-y border-amber-500/20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Badge className="mb-4 bg-gradient-to-r from-amber-500/20 to-purple-500/20 border-amber-500/30 text-amber-300">
                🎰 Featured Investment Opportunity
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-purple-500">
                  Ultra Casino
                </span>
                {' '}Token Launch
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Own equity in the future of Web3 gaming. Get NFT access passes, lifetime benefits, 
                and revenue sharing. Only $30,000 will be raised.
              </p>
              
              <Card className="max-w-xl mx-auto bg-card/50 backdrop-blur-sm border-amber-500/30 mb-6">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-amber-400">
                      ${currentFundingUSD.toLocaleString()} raised
                    </span>
                    <Badge variant="outline" className="border-amber-500/50">
                      {progressPercent.toFixed(1)}% of $30k
                    </Badge>
                  </div>
                  <Progress value={progressPercent} className="h-3 mb-4" />
                  <div className="flex justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{casinoProject?.total_backers || 0} investors</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4" />
                      <span>{currentFunding.toFixed(4)} ETH</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                      <span className="text-muted-foreground">Free Entry</span>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Coins className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                      <span className="text-muted-foreground">Equity Share</span>
                    </div>
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Rocket className="w-5 h-5 mx-auto mb-1 text-green-400" />
                      <span className="text-muted-foreground">Airdrops</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-black font-bold"
                onClick={() => navigate('/casino')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                View Casino Project <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-6 border-y border-border bg-secondary/20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4">Our Services</Badge>
              <h2 className="text-4xl font-bold mb-4">
                Everything You Need to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                  Dominate Web3
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive solutions from website creation to full DAO governance, 
                powered by autonomous AI agents.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                  <Link 
                    to="/pricing" 
                    className="inline-flex items-center gap-1 mt-4 text-primary hover:underline text-sm"
                  >
                    Learn more <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Web3 Industry Roadmap Tiers */}
        <Web3RoadmapHero />

        {/* Pricing Section */}
        <PricingSection />

        {/* CTA */}
        <section className="py-24 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-cyan-500/20 border border-primary/30"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Join the Revolution?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              The window is closing. Businesses that adopt Web3 now will dominate the next decade.
              Get your NFT membership pass and start building your empire.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90"
                onClick={() => navigate('/pricing')}
              >
                Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/metaverse')}>
                Visit Metaverse HQ
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">Web3 Commerce Engine</span>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                <Link to="/store" className="hover:text-foreground transition-colors">Store</Link>
                <Link to="/metaverse" className="hover:text-foreground transition-colors">Metaverse</Link>
                {user && (
                  <Link to="/" className="hover:text-foreground transition-colors">Dashboard</Link>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                © 2025 Web3 Commerce Engine. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
