import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface StakingPool {
  id: string;
  pool_name: string;
  pool_type: 'standard' | 'nft_boost' | 'lp';
  apy_percent: number;
  total_staked: number;
  total_rewards_distributed: number;
  min_stake: number;
  lock_period_days: number;
  is_active: boolean;
  created_at: string;
}

export interface UserStake {
  id: string;
  user_id: string;
  wallet_address: string;
  pool_id: string;
  staked_amount: number;
  staked_at: string;
  unlock_at: string | null;
  last_claim_at: string | null;
  accumulated_rewards: number;
  nft_boost_percent: number;
  is_active: boolean;
}

export interface TokenHolding {
  id: string;
  wallet_address: string;
  user_id: string | null;
  token_balance: number;
  staked_balance: number;
  pending_rewards: number;
  total_earned: number;
  governance_power: number;
  updated_at: string;
}

export function useStaking() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  // Fetch all staking pools
  const { data: pools = [], isLoading: isLoadingPools } = useQuery({
    queryKey: ['staking-pools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staking_pools')
        .select('*')
        .eq('is_active', true)
        .order('apy_percent', { ascending: false });

      if (error) throw error;
      return data as StakingPool[];
    }
  });

  // Fetch user's stakes
  const { data: userStakes = [], isLoading: isLoadingStakes } = useQuery({
    queryKey: ['user-stakes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_stakes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data as UserStake[];
    },
    enabled: !!user
  });

  // Fetch user's token holdings
  const { data: holdings, isLoading: isLoadingHoldings } = useQuery({
    queryKey: ['token-holdings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('token_holdings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as TokenHolding | null;
    },
    enabled: !!user
  });

  // Stake tokens
  const stake = useMutation({
    mutationFn: async ({ poolId, amount, walletAddress }: { poolId: string; amount: number; walletAddress: string }) => {
      const pool = pools.find(p => p.id === poolId);
      if (!pool) throw new Error('Pool not found');
      if (amount < pool.min_stake) throw new Error(`Minimum stake is ${pool.min_stake} PROFIT`);

      const unlockAt = pool.lock_period_days > 0 
        ? new Date(Date.now() + pool.lock_period_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('user_stakes')
        .insert([{
          user_id: user?.id,
          wallet_address: walletAddress.toLowerCase(),
          pool_id: poolId,
          staked_amount: amount,
          unlock_at: unlockAt,
          nft_boost_percent: 0 // TODO: Calculate from NFT holdings
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stakes'] });
      queryClient.invalidateQueries({ queryKey: ['staking-pools'] });
      queryClient.invalidateQueries({ queryKey: ['token-holdings'] });
      toast.success('Tokens staked successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to stake tokens');
    }
  });

  // Unstake tokens
  const unstake = useMutation({
    mutationFn: async (stakeId: string) => {
      const userStake = userStakes.find(s => s.id === stakeId);
      if (!userStake) throw new Error('Stake not found');

      if (userStake.unlock_at && new Date(userStake.unlock_at) > new Date()) {
        throw new Error('Tokens are still locked');
      }

      const { data, error } = await supabase
        .from('user_stakes')
        .update({ is_active: false })
        .eq('id', stakeId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stakes'] });
      queryClient.invalidateQueries({ queryKey: ['staking-pools'] });
      queryClient.invalidateQueries({ queryKey: ['token-holdings'] });
      toast.success('Tokens unstaked successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unstake tokens');
    }
  });

  // Claim rewards
  const claimRewards = useMutation({
    mutationFn: async (stakeId: string) => {
      const { data, error } = await supabase
        .from('user_stakes')
        .update({ 
          last_claim_at: new Date().toISOString(),
          accumulated_rewards: 0
        })
        .eq('id', stakeId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stakes'] });
      queryClient.invalidateQueries({ queryKey: ['token-holdings'] });
      toast.success('Rewards claimed!');
    }
  });

  // Calculate estimated rewards
  const calculateRewards = (stake: UserStake) => {
    const pool = pools.find(p => p.id === stake.pool_id);
    if (!pool) return 0;

    const stakedDays = (Date.now() - new Date(stake.staked_at).getTime()) / (1000 * 60 * 60 * 24);
    const dailyRate = pool.apy_percent / 365 / 100;
    const baseRewards = stake.staked_amount * dailyRate * stakedDays;
    const boostedRewards = baseRewards * (1 + stake.nft_boost_percent / 100);
    
    return boostedRewards;
  };

  // Total stats
  const totalStaked = userStakes.reduce((sum, stake) => sum + stake.staked_amount, 0);
  const totalPendingRewards = userStakes.reduce((sum, stake) => sum + calculateRewards(stake), 0);

  return {
    pools,
    userStakes,
    holdings,
    totalStaked,
    totalPendingRewards,
    isLoading: isLoadingPools || isLoadingStakes || isLoadingHoldings,
    stake,
    unstake,
    claimRewards,
    calculateRewards
  };
}
