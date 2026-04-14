import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/dashboard/Header';
import { PricingSection } from '@/components/subscription/PricingSection';
import { 
  Sparkles, 
  Shield, 
  Zap, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Play,
  Star,
  ChevronRight,
  Brain,
  Bot,
  Target
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const stats = [
  { value: '$2.4M+', label: 'Revenue Generated' },
  { value: '500+', label: 'Businesses Automated' },
  { value: '15+', label: 'Countries' },
  { value: '99.9%', label: 'Uptime' },
];

const services = [
  {
    icon: Brain,
    title: 'CEO Brain Dashboard',
    description: 'Real-time command center with AI insights, revenue tracking, and autonomous decision-making.',
  },
  {
    icon: Bot,
    title: 'AI Agent Swarm',
    description: '5 specialized agents that qualify, nurture, close, and onboard — fully autonomous.',
  },
  {
    icon: Users,
    title: 'Lead Qualification Engine',
    description: 'AI-powered scoring and routing. Only talk to buyers who are ready to close.',
  },
  {
    icon: TrendingUp,
    title: 'Profit Reaper',
    description: 'Autonomous revenue optimization that finds and captures every dollar you're leaving on the table.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption, role-based access, and real-time audit trails.',
  },
  {
    icon: Target,
    title: 'Marketing Blitz Engine',
    description: 'AI-generated campaigns across every channel — content, email, social, all on autopilot.',
  },
];

export default function Landing() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient Oro Omega glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[160px] animate-aurora" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[hsl(220_100%_60%/0.06)] rounded-full blur-[140px] animate-aurora" style={{ animationDelay: '-7s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[hsl(262_80%_62%/0.04)] rounded-full blur-[200px] animate-glow-pulse" />
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
              <Badge className="mb-6 bg-primary/10 border-primary/25 text-primary text-sm py-2 px-4">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Autonomous Revenue Operating System
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                The AI That Sells{' '}
                <span className="text-gradient-oro">
                  While You Sleep
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
                AuraOmega deploys 5 autonomous AI agents that qualify, nurture, close, and onboard 
                your customers. No manual work. Pure revenue on autopilot.
              </p>

              <div className="flex flex-wrap gap-4 justify-center mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[hsl(220,100%,60%)] to-primary hover:opacity-90 text-lg px-8 glow-primary"
                  onClick={() => navigate('/pricing')}
                >
                  View Pricing <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 border-primary/25 hover:border-primary/50"
                  onClick={() => navigate('/my-apps')}
                >
                  <Play className="w-5 h-5 mr-2" /> My Apps
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 justify-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Enterprise Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[hsl(200,100%,72%)]" />
                  <span>24/7 Autonomous Agents</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-6 border-y border-border/50 bg-secondary/20">
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
                  <p className="text-4xl font-bold text-gradient-oro">
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
              <Badge className="mb-4 bg-primary/10 border-primary/25 text-primary">Platform Capabilities</Badge>
              <h2 className="text-4xl font-bold mb-4">
                Everything You Need to{' '}
                <span className="text-gradient-oro">
                  Dominate Revenue
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From lead capture to customer onboarding — fully autonomous, AI-powered tools 
                that work 24/7 without human intervention.
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
                  className="oro-card p-6 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/15 to-[hsl(220,100%,60%/0.15)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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

        {/* Pricing Section */}
        <PricingSection />

        {/* CTA */}
        <section className="py-24 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center p-12 rounded-3xl border border-primary/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-[hsl(262_80%_62%/0.06)] to-[hsl(220_100%_60%/0.10)]" />
            <div className="absolute inset-0 bg-card/40 backdrop-blur-sm" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Ready to Automate Your Revenue?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start with 2 agents at $97/mo or unlock the full team at $297/mo. 
                3-day free trial on every plan. Cancel anytime.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[hsl(220,100%,60%)] to-primary hover:opacity-90 glow-primary"
                  onClick={() => navigate('/pricing')}
                >
                  Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-primary/25" onClick={() => navigate('/contact')}>
                  Talk to Sales
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-12 px-6 bg-card/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(220,100%,60%)] flex items-center justify-center glow-primary">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gradient-oro">AuraOmega</span>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                <Link to="/my-apps" className="hover:text-foreground transition-colors">My Apps</Link>
                <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
                <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                <Link to="/refunds" className="hover:text-foreground transition-colors">Refunds</Link>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} AuraOmega. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
