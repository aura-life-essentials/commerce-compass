import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gem, Crown, Star, Sparkles, ShoppingBag, Percent, Clock, Rocket, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNFTMembership, NFTMembership } from '@/hooks/useNFTMembership';
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from 'sonner';

const TIER_COLORS = {
  bronze: 'from-amber-700 to-amber-500',
  silver: 'from-slate-400 to-slate-300',
  gold: 'from-yellow-500 to-amber-400',
  platinum: 'from-cyan-400 to-blue-300',
  diamond: 'from-purple-500 via-pink-500 to-purple-400'
};

const TIER_ICONS = {
  bronze: Star,
  silver: Sparkles,
  gold: Crown,
  platinum: Rocket,
  diamond: Gem
};

export function NFTMembershipPanel() {
  const { walletAddress, connectWallet, isConnected } = useWeb3();
  const { 
    userNFTs, 
    listedNFTs, 
    userHighestTier, 
    userBenefits,
    tierPrices, 
    tierBenefits, 
    mintNFT, 
    listNFT,
    totalRoyalties 
  } = useNFTMembership();
  
  const [selectedTier, setSelectedTier] = useState<keyof typeof tierPrices>('gold');
  const [listingPrice, setListingPrice] = useState<number>(0);

  const handleMint = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }
    if (!walletAddress) return;
    
    mintNFT.mutate({ tier: selectedTier, walletAddress });
  };

  const tiers = Object.entries(tierPrices) as [keyof typeof tierPrices, number][];

  return (
    <div className="space-y-6">
      {/* Current Membership Status */}
      {userHighestTier && userBenefits && (
        <Card className={`bg-gradient-to-r ${TIER_COLORS[userHighestTier as keyof typeof TIER_COLORS]} text-white border-0`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-80">Your Membership Level</div>
                <div className="text-3xl font-bold capitalize flex items-center gap-2 mt-1">
                  {React.createElement(TIER_ICONS[userHighestTier as keyof typeof TIER_ICONS], { className: "w-8 h-8" })}
                  {userHighestTier}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold">{userBenefits.discount_percent}%</div>
                  <div className="text-xs opacity-80">Discount</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{userBenefits.staking_boost || 0}%</div>
                  <div className="text-xs opacity-80">Staking Boost</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{userBenefits.governance_multiplier || 1}x</div>
                  <div className="text-xs opacity-80">Vote Power</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{userNFTs.length}</div>
                  <div className="text-xs opacity-80">NFTs Owned</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tier Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Mint Membership Pass</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {tiers.map(([tier, price]) => {
            const benefits = tierBenefits[tier];
            const Icon = TIER_ICONS[tier];
            const isSelected = selectedTier === tier;
            
            return (
              <motion.div
                key={tier}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'ring-2 ring-purple-500 bg-purple-500/10' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedTier(tier)}
                >
                  <CardContent className="pt-6">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${TIER_COLORS[tier]} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="font-bold capitalize text-lg">{tier}</div>
                    <div className="text-2xl font-bold mt-1">{price} ETH</div>
                    
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-green-500" />
                        <span>{benefits.discount_percent}% off</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        {benefits.early_access ? (
                          <span>Early Access</span>
                        ) : (
                          <span className="text-muted-foreground">No Early Access</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-purple-500" />
                        {benefits.exclusive_drops ? (
                          <span>Exclusive Drops</span>
                        ) : (
                          <span className="text-muted-foreground">Standard Drops</span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Button 
          onClick={handleMint}
          disabled={mintNFT.isPending}
          className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          size="lg"
        >
          <Gem className="w-4 h-4 mr-2" />
          {mintNFT.isPending ? 'Minting...' : `Mint ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Pass for ${tierPrices[selectedTier]} ETH`}
        </Button>
      </div>

      {/* Your NFTs */}
      {userNFTs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your NFT Passes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userNFTs.map(nft => {
              const Icon = TIER_ICONS[nft.tier as keyof typeof TIER_ICONS];
              
              return (
                <Card key={nft.id} className="overflow-hidden">
                  <div className={`h-32 bg-gradient-to-br ${TIER_COLORS[nft.tier as keyof typeof TIER_COLORS]} flex items-center justify-center`}>
                    <Icon className="w-16 h-16 text-white/80" />
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="capitalize">{nft.tier}</Badge>
                      <span className="text-xs text-muted-foreground">#{nft.token_id.slice(-6)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Minted {new Date(nft.minted_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-green-400 mt-1">
                      Royalties earned: {nft.total_royalties_earned.toFixed(4)} ETH
                    </div>
                    
                    {nft.is_listed ? (
                      <Badge variant="outline" className="mt-2">Listed: {nft.list_price_eth} ETH</Badge>
                    ) : (
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        List for Sale
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Marketplace */}
      {listedNFTs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Marketplace</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {listedNFTs.map(nft => {
              const Icon = TIER_ICONS[nft.tier as keyof typeof TIER_ICONS];
              
              return (
                <Card key={nft.id} className="overflow-hidden">
                  <div className={`h-24 bg-gradient-to-br ${TIER_COLORS[nft.tier as keyof typeof TIER_COLORS]} flex items-center justify-center`}>
                    <Icon className="w-12 h-12 text-white/80" />
                  </div>
                  <CardContent className="pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="capitalize" variant="outline">{nft.tier}</Badge>
                      <div className="font-bold">{nft.list_price_eth} ETH</div>
                    </div>
                    <Button size="sm" className="w-full">Buy Now</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Royalty Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Royalty Revenue
          </CardTitle>
          <CardDescription>
            Earn 7.5% on every NFT resale - passive income forever
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-400">{totalRoyalties.toFixed(4)} ETH</div>
          <div className="text-sm text-muted-foreground mt-1">Total royalties earned across all NFT sales</div>
        </CardContent>
      </Card>
    </div>
  );
}
