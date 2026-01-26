import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { SubscriptionTier, getTierByProductId, SUBSCRIPTION_TIERS } from '@/lib/subscriptionTiers';

interface SubscriptionState {
  isSubscribed: boolean;
  tier: SubscriptionTier | null;
  subscriptionEnd: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useSubscription() {
  const { user, session } = useAuthContext();
  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: false,
    tier: null,
    subscriptionEnd: null,
    isLoading: true,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.subscribed && data.product_id) {
        const tierConfig = getTierByProductId(data.product_id);
        setState({
          isSubscribed: true,
          tier: tierConfig?.id || null,
          subscriptionEnd: data.subscription_end,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          isSubscribed: false,
          tier: null,
          subscriptionEnd: null,
          isLoading: false,
          error: null,
        });
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to check subscription',
      }));
    }
  }, [session?.access_token]);

  useEffect(() => {
    checkSubscription();
    
    // Auto-refresh every minute
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const subscribe = async (tierId: SubscriptionTier) => {
    if (!session?.access_token) {
      throw new Error('Please sign in to subscribe');
    }

    const tier = SUBSCRIPTION_TIERS.find(t => t.id === tierId);
    if (!tier) throw new Error('Invalid tier');

    const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: {
        priceId: tier.priceId,
        tierId: tier.id,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
  };

  const manageSubscription = async () => {
    if (!session?.access_token) {
      throw new Error('Please sign in');
    }

    const { data, error } = await supabase.functions.invoke('customer-portal', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
  };

  return {
    ...state,
    subscribe,
    manageSubscription,
    refreshSubscription: checkSubscription,
  };
}
