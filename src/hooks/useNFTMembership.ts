import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface NFTMembership {
  id: string;
  token_id: string;
  contract_address: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  owner_wallet: string;
  owner_user_id: string | null;
  minted_at: string;
  price_eth: number | null;
  benefits: {
    discount_percent: number;
    early_access: boolean;
    exclusive_drops: boolean;
    staking_boost?: number;
    governance_multiplier?: number;
  };
  royalty_percent: number;
  total_royalties_earned: number;
  image_url: string | null;
  is_listed: boolean;
  list_price_eth: number | null;
}

const TIER_BENEFITS = {
  bronze: { discount_percent: 5, early_access: false, exclusive_drops: false, staking_boost: 0, governance_multiplier: 1 },
  silver: { discount_percent: 10, early_access: true, exclusive_drops: false, staking_boost: 10, governance_multiplier: 1.25 },
  gold: { discount_percent: 15, early_access: true, exclusive_drops: true, staking_boost: 25, governance_multiplier: 1.5 },
  platinum: { discount_percent: 20, early_access: true, exclusive_drops: true, staking_boost: 50, governance_multiplier: 2 },
  diamond: { discount_percent: 30, early_access: true, exclusive_drops: true, staking_boost: 100, governance_multiplier: 3 }
};

const TIER_PRICES = {
  bronze: 0.05,
  silver: 0.15,
  gold: 0.5,
  platinum: 1.5,
  diamond: 5.0
};

export function useNFTMembership() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  // Fetch all NFT memberships
  const { data: allMemberships = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['nft-memberships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nft_memberships')
        .select('*')
        .order('minted_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(nft => ({
        ...nft,
        benefits: nft.benefits as unknown as NFTMembership['benefits']
      })) as NFTMembership[];
    }
  });

  // Fetch user's NFTs
  const { data: userNFTs = [], isLoading: isLoadingUser } = useQuery({
    queryKey: ['user-nfts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('nft_memberships')
        .select('*')
        .eq('owner_user_id', user.id);

      if (error) throw error;
      return (data || []).map(nft => ({
        ...nft,
        benefits: nft.benefits as unknown as NFTMembership['benefits']
      })) as NFTMembership[];
    },
    enabled: !!user
  });

  // Get user's highest tier
  const userHighestTier = userNFTs.reduce((highest: string | null, nft) => {
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const currentIndex = highest ? tierOrder.indexOf(highest) : -1;
    const nftIndex = tierOrder.indexOf(nft.tier);
    return nftIndex > currentIndex ? nft.tier : highest;
  }, null);

  // Get user benefits based on highest tier
  const userBenefits = userHighestTier ? TIER_BENEFITS[userHighestTier as keyof typeof TIER_BENEFITS] : null;

  // Mint NFT mutation
  const mintNFT = useMutation({
    mutationFn: async ({ tier, walletAddress }: { tier: keyof typeof TIER_PRICES; walletAddress: string }) => {
      const tokenId = `PROFIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('nft_memberships')
        .insert([{
          token_id: tokenId,
          contract_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab1C', // Placeholder
          tier,
          owner_wallet: walletAddress.toLowerCase(),
          owner_user_id: user?.id,
          price_eth: TIER_PRICES[tier],
          benefits: TIER_BENEFITS[tier],
          royalty_percent: 7.5,
          image_url: `/nft/${tier}.png`
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nft-memberships'] });
      queryClient.invalidateQueries({ queryKey: ['user-nfts'] });
      toast.success('NFT Membership minted successfully!');
    },
    onError: () => {
      toast.error('Failed to mint NFT');
    }
  });

  // List NFT for sale
  const listNFT = useMutation({
    mutationFn: async ({ nftId, price }: { nftId: string; price: number }) => {
      const { data, error } = await supabase
        .from('nft_memberships')
        .update({
          is_listed: true,
          list_price_eth: price
        })
        .eq('id', nftId)
        .eq('owner_user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nft-memberships'] });
      queryClient.invalidateQueries({ queryKey: ['user-nfts'] });
      toast.success('NFT listed for sale!');
    }
  });

  // Unlist NFT
  const unlistNFT = useMutation({
    mutationFn: async (nftId: string) => {
      const { data, error } = await supabase
        .from('nft_memberships')
        .update({
          is_listed: false,
          list_price_eth: null
        })
        .eq('id', nftId)
        .eq('owner_user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nft-memberships'] });
      queryClient.invalidateQueries({ queryKey: ['user-nfts'] });
      toast.success('NFT unlisted');
    }
  });

  // Get listed NFTs for marketplace
  const listedNFTs = allMemberships.filter(nft => nft.is_listed);

  // Total royalties earned
  const totalRoyalties = allMemberships.reduce((sum, nft) => sum + (nft.total_royalties_earned || 0), 0);

  return {
    allMemberships,
    userNFTs,
    listedNFTs,
    userHighestTier,
    userBenefits,
    totalRoyalties,
    tierPrices: TIER_PRICES,
    tierBenefits: TIER_BENEFITS,
    isLoading: isLoadingAll || isLoadingUser,
    mintNFT,
    listNFT,
    unlistNFT
  };
}
