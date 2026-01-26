import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Check, 
  Sparkles, 
  Diamond,
  ArrowRight,
  Star,
  Shield,
  TrendingUp,
  Bot,
  Globe,
  Layers,
  Target,
  Award,
  Loader2
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { INDUSTRY_TIERS } from '@/lib/industryTiers';

export function Web3RoadmapHero() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSelectTier = async (tierId: string, priceId: string) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      navigate('/auth');
      return;
    }
    
    setLoadingTier(tierId);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { priceId, tierId }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-full blur-[200px]" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-6 bg-gradient-to-r from-purple-500/20 to-amber-500/20 border-purple-500/30 text-lg py-2 px-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Industry-Specific Web3 Roadmaps
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Transform Your Business with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400">
              Data-Driven Web3 Strategies
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8">
            From foundation to full automation — choose your path to guaranteed revenue growth 
            with AI-powered execution and blockchain innovation.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <span>Proven ROI</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Bot className="w-5 h-5 text-purple-500" />
              <span>AI-Powered Execution</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="w-5 h-5 text-cyan-500" />
              <span>Global Reach</span>
            </div>
          </div>
        </motion.div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {INDUSTRY_TIERS.map((tier, index) => {
            const Icon = tier.icon;
            const isLoading = loadingTier === tier.id;
            const isPopular = 'popular' in tier && tier.popular;
            const isElite = 'elite' in tier && tier.elite;
            
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {isPopular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {isElite && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-4 py-1">
                      <Diamond className="w-3 h-3 mr-1" />
                      Full Package
                    </Badge>
                  </div>
                )}

                <Card 
                  className={`h-full bg-card/50 backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02] ${
                    isPopular 
                      ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' 
                      : isElite
                      ? 'border-amber-500/50 shadow-lg shadow-amber-500/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <CardContent className={`p-6 ${isPopular || isElite ? 'pt-8' : ''}`}>
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                    <p className="text-sm text-primary mb-4">{tier.tagline}</p>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-4xl font-bold">${tier.price.toLocaleString()}</span>
                      <span className="text-muted-foreground">{tier.billing}</span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleSelectTier(tier.id, tier.priceId)}
                      disabled={isLoading}
                      className={`w-full mb-6 ${
                        isElite
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black'
                          : isPopular
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                          : ''
                      }`}
                      variant={isPopular || isElite ? 'default' : 'outline'}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Subscribe Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Features</p>
                      {tier.features.slice(0, 5).map((feature) => (
                        <div key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {tier.features.length > 5 && (
                        <p className="text-xs text-muted-foreground pl-6">
                          +{tier.features.length - 5} more features
                        </p>
                      )}
                    </div>

                    {/* Deliverables */}
                    <div className="pt-4 border-t border-border space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Deliverables</p>
                      {tier.deliverables.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm">
                          <Target className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Guarantee */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-green-500" />
                        <span className="text-green-500 font-medium">{tier.guarantee}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 via-transparent to-amber-500/10 border border-purple-500/20">
            <div className="text-left">
              <p className="font-semibold mb-1">Not sure which tier is right for you?</p>
              <p className="text-sm text-muted-foreground">Book a free strategy call with our Web3 experts</p>
            </div>
            <Button 
              variant="outline" 
              className="border-primary/50 whitespace-nowrap"
              onClick={() => navigate('/pricing')}
            >
              <Layers className="w-4 h-4 mr-2" />
              Compare All Plans
            </Button>
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">Trusted by industry leaders</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50">
            {['🏦 Finance', '🏥 Healthcare', '🏪 Retail', '🎮 Gaming', '🏠 Real Estate'].map((industry) => (
              <span key={industry} className="text-lg font-medium">{industry}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
