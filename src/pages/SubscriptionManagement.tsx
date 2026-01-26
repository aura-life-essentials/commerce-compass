import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, RefreshCw, ExternalLink, Check, Sparkles, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuthContext } from '@/contexts/AuthContext';
import { SUBSCRIPTION_TIERS, getTierById } from '@/lib/subscriptionTiers';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { 
    isSubscribed, 
    tier, 
    subscriptionEnd, 
    isLoading, 
    subscribe, 
    manageSubscription, 
    refreshSubscription 
  } = useSubscription();

  const currentTier = tier ? getTierById(tier) : null;
  const currentTierIndex = tier ? SUBSCRIPTION_TIERS.findIndex(t => t.id === tier) : -1;

  const handleUpgrade = async (tierId: string) => {
    try {
      await subscribe(tierId as any);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout');
    }
  };

  const handleManageSubscription = async () => {
    try {
      await manageSubscription();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to open portal');
    }
  };

  const handleRefresh = async () => {
    await refreshSubscription();
    toast.success('Subscription status refreshed');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Crown className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to manage your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Subscription Management</h1>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Current Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className={`relative overflow-hidden ${isSubscribed ? 'border-primary/50' : ''}`}>
            {isSubscribed && currentTier && (
              <div className={`absolute inset-0 bg-gradient-to-r ${currentTier.color} opacity-5`} />
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentTier?.color || 'from-muted to-muted-foreground/20'} flex items-center justify-center`}>
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {isSubscribed ? (
                        <>
                          {currentTier?.name} Plan
                          <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                            Active
                          </Badge>
                        </>
                      ) : (
                        <>
                          No Active Subscription
                          <Badge variant="secondary">Free</Badge>
                        </>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {isSubscribed && currentTier
                        ? currentTier.description
                        : 'Choose a plan to unlock premium features'}
                    </CardDescription>
                  </div>
                </div>
                {isSubscribed && (
                  <Button onClick={handleManageSubscription} variant="outline" className="gap-2">
                    <CreditCard className="w-4 h-4" />
                    Manage Billing
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </CardHeader>

            {isSubscribed && subscriptionEnd && (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Renews on {format(new Date(subscriptionEnd), 'MMMM d, yyyy')}
                  </span>
                </div>
              </CardContent>
            )}

            {isSubscribed && currentTier && (
              <CardContent className="border-t border-border mt-4 pt-6">
                <h4 className="font-medium mb-3">Your Plan Includes:</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {currentTier.features.slice(0, 6).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>

        {/* Available Plans */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {isSubscribed ? 'Change Your Plan' : 'Choose a Plan'}
          </h2>
          <p className="text-muted-foreground">
            {isSubscribed 
              ? 'Upgrade to unlock more features or downgrade if needed'
              : 'Select the plan that best fits your needs'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUBSCRIPTION_TIERS.map((tierConfig, index) => {
            const isCurrentPlan = tier === tierConfig.id;
            const isUpgrade = currentTierIndex >= 0 && index > currentTierIndex;
            const isDowngrade = currentTierIndex >= 0 && index < currentTierIndex;

            return (
              <motion.div
                key={tierConfig.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative h-full flex flex-col ${isCurrentPlan ? 'ring-2 ring-primary' : ''} ${tierConfig.popular ? 'border-primary/50' : ''}`}>
                  {tierConfig.popular && !isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Check className="w-3 h-3 mr-1" />
                        Current Plan
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${tierConfig.color} flex items-center justify-center mb-3`}>
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle>{tierConfig.name}</CardTitle>
                    <CardDescription>{tierConfig.description}</CardDescription>
                    <div className="mt-3">
                      <span className="text-3xl font-bold">${tierConfig.price}</span>
                      <span className="text-muted-foreground">/{tierConfig.billingCycle}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {tierConfig.features.slice(0, 5).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardContent className="pt-0">
                    {isCurrentPlan ? (
                      <Button disabled className="w-full" variant="secondary">
                        Current Plan
                      </Button>
                    ) : isSubscribed ? (
                      <Button 
                        onClick={handleManageSubscription}
                        className="w-full"
                        variant={isUpgrade ? 'default' : 'outline'}
                      >
                        {isUpgrade ? 'Upgrade' : 'Downgrade'} via Portal
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleUpgrade(tierConfig.id)}
                        className={`w-full ${tierConfig.popular ? 'bg-gradient-to-r ' + tierConfig.color : ''}`}
                      >
                        Get Started
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="bg-muted/30">
            <CardContent className="py-8">
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p className="text-muted-foreground mb-4">
                Contact our support team for any subscription-related questions
              </p>
              <Button variant="outline" onClick={() => window.open('mailto:support@profitreaper.com', '_blank')}>
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
