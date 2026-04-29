import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Zap, ExternalLink, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_TIERS, TierConfig } from '@/lib/subscriptionTiers';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/formatCurrency';

const tierIcons = {
  core: Zap,
  pro: Sparkles,
  enterprise: Crown,
};

export function PricingSection() {
  const { user } = useAuthContext();
  const {
    isSubscribed,
    tier: currentTier,
    subscribe,
    manageSubscription,
    isLoading,
  } = useSubscription();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = async (tier: TierConfig) => {
    // Enterprise → contact page
    if (tier.id === 'enterprise') {
      navigate('/contact');
      return;
    }

    if (!user) {
      toast.error('Please sign in to subscribe');
      navigate('/auth');
      return;
    }

    setLoadingTier(tier.id);
    const t = toast.loading(`Preparing checkout for ${tier.name}…`);
    try {
      await subscribe(tier.id);
      toast.success(`Opening secure checkout in a new tab`, { id: t });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout', { id: t });
    } finally {
      setLoadingTier(null);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    const t = toast.loading('Opening customer portal…');
    try {
      await manageSubscription();
      toast.success('Customer portal opened', { id: t });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open portal', { id: t });
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            Choose Your Plan
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Automate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">revenue pipeline</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real AI agents. Real results. Pick the plan that matches your operation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    {tier.price !== null ? (
                      <>
                        <span className="text-3xl font-bold">{formatCurrency(tier.price)}</span>
                        <span className="text-muted-foreground">/month</span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold">Custom</span>
                    )}
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
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Preparing checkout…
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : tier.id === 'enterprise' ? (
                      'Contact Us'
                    ) : (
                      <>
                        Get Started <ExternalLink className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">What's included</p>
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {isSubscribed && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground">
              Already a subscriber?
            </p>
            <Button
              variant="outline"
              onClick={handleManage}
              disabled={portalLoading}
              className="gap-2"
            >
              {portalLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Opening portal…
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" /> Manage subscription
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
