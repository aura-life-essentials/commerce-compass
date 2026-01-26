import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Zap, Rocket, Diamond, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_TIERS, TierConfig } from '@/lib/subscriptionTiers';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const tierIcons = {
  starter: Zap,
  growth: Rocket,
  pro: Sparkles,
  enterprise: Crown,
  elite: Diamond,
};

export function PricingSection() {
  const { user } = useAuthContext();
  const { isSubscribed, tier: currentTier, subscribe, isLoading } = useSubscription();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubscribe = async (tier: TierConfig) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      navigate('/auth');
      return;
    }

    setLoadingTier(tier.id);
    try {
      await subscribe(tier.id);
      toast.success(`Redirecting to checkout for ${tier.name}...`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            Web3 Subscription Services
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Revolution Path</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Data-driven roadmaps to guarantee massive revenue increases. Don't miss this small window of time and space.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {SUBSCRIPTION_TIERS.map((tier, index) => {
            const Icon = tierIcons[tier.id];
            const isCurrentPlan = currentTier === tier.id;
            
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl border ${
                  tier.popular 
                    ? 'border-primary shadow-lg shadow-primary/20' 
                    : 'border-border'
                } bg-card/50 backdrop-blur-sm overflow-hidden`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-cyan-500 text-white text-center py-1 text-xs font-medium">
                    Most Popular
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center py-1 text-xs font-medium">
                    Your Current Plan
                  </div>
                )}

                <div className={`p-6 ${tier.popular || isCurrentPlan ? 'pt-10' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/{tier.billingCycle === 'yearly' ? 'year' : tier.billingCycle === 'weekly' ? 'week' : 'month'}</span>
                  </div>

                  <Button
                    onClick={() => handleSubscribe(tier)}
                    disabled={isLoading || loadingTier === tier.id || isCurrentPlan}
                    className={`w-full mb-6 ${
                      tier.popular 
                        ? 'bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90' 
                        : ''
                    }`}
                    variant={tier.popular ? 'default' : 'outline'}
                  >
                    {loadingTier === tier.id ? (
                      'Processing...'
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      <>
                        Get Started <ExternalLink className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Features</p>
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-border space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">NFT Benefits</p>
                    {tier.nftBenefits.map((benefit) => (
                      <div key={benefit} className="flex items-start gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground">
            All subscriptions include NFT membership passes tradeable on OpenSea, Coinbase NFT, Rarible, LooksRare, and Blur
          </p>
        </motion.div>
      </div>
    </section>
  );
}
