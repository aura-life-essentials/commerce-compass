import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTierById, SubscriptionTier } from '@/lib/subscriptionTiers';
import { useSubscription } from '@/hooks/useSubscription';

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const tierId = searchParams.get('tier') as SubscriptionTier | null;
  const tier = tierId ? getTierById(tierId) : null;
  const { refreshSubscription } = useSubscription();
  const [showConfetti, setShowConfetti] = useState(false);

  const fireConfetti = useCallback(async () => {
    const confettiModule = await import('canvas-confetti');
    const confetti = confettiModule.default;
    
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8B5CF6', '#06B6D4', '#10B981'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8B5CF6', '#06B6D4', '#10B981'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  useEffect(() => {
    // Refresh subscription status
    refreshSubscription();

    // Fire confetti
    if (!showConfetti) {
      setShowConfetti(true);
      fireConfetti();
    }
  }, [refreshSubscription, showConfetti, fireConfetti]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-lg w-full"
      >
        <div className="text-center p-8 rounded-3xl border border-green-500/30 bg-card/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-green-500" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30">
              Payment Successful
            </Badge>
            
            <h1 className="text-3xl font-bold mb-2">
              Welcome to {tier?.name || 'Your Plan'}!
            </h1>
            
            <p className="text-muted-foreground mb-6">
              {tier?.description || 'Your subscription is now active'}
            </p>

            {tier && (
              <div className="p-4 rounded-xl bg-secondary/50 mb-6 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Your Benefits</span>
                </div>
                <ul className="space-y-2 text-sm">
                  {tier.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-3">
              <Link to="/" className="block">
                <Button className="w-full bg-gradient-to-r from-primary to-cyan-500">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              
              <Link to="/metaverse" className="block">
                <Button variant="outline" className="w-full">
                  Enter Metaverse <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Your NFT membership pass will be minted and sent to your connected wallet within 24 hours.
              Check your email for confirmation.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
