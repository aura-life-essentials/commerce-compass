import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, ArrowRight, ExternalLink, Clock, Rocket, Shield, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getTierById, SubscriptionTier } from '@/lib/subscriptionTiers';
import { useSubscription } from '@/hooks/useSubscription';
import { useAnalytics } from '@/hooks/useAnalytics';
import { TrialBadge } from '@/components/ui/TrialBadge';

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const tierId = searchParams.get('tier') as SubscriptionTier | null;
  const isTrial = searchParams.get('trial') === 'true';
  const tier = tierId ? getTierById(tierId) : null;
  const { refreshSubscription, trialActive, trialDaysRemaining } = useSubscription();
  const { trackConversion } = useAnalytics();
  const [showConfetti, setShowConfetti] = useState(false);

  const fireConfetti = useCallback(async () => {
    const confettiModule = await import('canvas-confetti');
    const confetti = confettiModule.default;
    
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: Record<string, unknown>) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#10b981', '#06b6d4'] });
    fire(0.2, { spread: 60, colors: ['#10b981', '#06b6d4', '#8b5cf6'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#10b981'] });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#06b6d4'] });
    fire(0.1, { spread: 120, startVelocity: 45, colors: ['#8b5cf6', '#ec4899'] });
  }, []);

  useEffect(() => {
    // Refresh subscription status
    refreshSubscription();
    
    // Track conversion
    trackConversion('subscription_completed', { 
      tier: tierId, 
      isTrial,
      tierName: tier?.name,
      price: tier?.price 
    });

    // Fire confetti after a short delay
    const timer = setTimeout(() => {
      setShowConfetti(true);
      fireConfetti();
    }, 500);

    return () => clearTimeout(timer);
  }, [refreshSubscription, fireConfetti, trackConversion, tierId, tier, isTrial]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full relative z-10"
      >
        <Card className="glass border-primary/30 overflow-hidden">
          {/* Success header */}
          <div className="bg-gradient-to-r from-primary/20 to-cyan-500/20 p-8 text-center border-b border-primary/20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-primary" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-2"
            >
              {isTrial ? 'Trial Started!' : 'Welcome Aboard!'}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground"
            >
              {isTrial 
                ? 'Your 3-day free trial has begun'
                : 'Your subscription is now active'
              }
            </motion.p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Tier info */}
            {tier && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card/50"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tier.color} flex items-center justify-center shrink-0`}>
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{tier.name} Plan</h3>
                    {isTrial && trialDaysRemaining && (
                      <TrialBadge daysRemaining={trialDaysRemaining} variant="compact" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">/{tier.billingCycle}</span>
                </div>
              </motion.div>
            )}

            {/* Trial info */}
            {isTrial && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-4 rounded-xl bg-primary/10 border border-primary/20"
              >
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-primary">3-Day Free Trial</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your card will be charged after the trial ends. Cancel anytime before then to avoid charges.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* What's next */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <h4 className="font-medium flex items-center gap-2">
                <Rocket className="w-4 h-4 text-primary" />
                What's Next?
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Access your CEO Dashboard and AI agents
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Set up your first autonomous store
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  Configure your revenue optimization settings
                </li>
              </ul>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col gap-3"
            >
              <Button asChild className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90">
                <Link to="/my-apps">
                  Launch My Apps
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/subscription">
                  Manage Subscription
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>

            {/* Support */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center text-xs text-muted-foreground"
            >
              Questions? Contact us at{' '}
              <a href="mailto:support@profitreaper.com" className="text-primary hover:underline">
                support@profitreaper.com
              </a>
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
