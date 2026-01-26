import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Lock, Unlock, Clock, Zap, Gift, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useStaking, StakingPool } from '@/hooks/useStaking';
import { useWeb3 } from '@/hooks/useWeb3';
import { useNFTMembership } from '@/hooks/useNFTMembership';

export function StakingPanel() {
  const { walletAddress, connectWallet, isConnected } = useWeb3();
  const { pools, userStakes, totalStaked, totalPendingRewards, stake, unstake, claimRewards, calculateRewards } = useStaking();
  const { userBenefits } = useNFTMembership();
  
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('');

  const handleStake = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }
    if (!walletAddress || !selectedPool || !stakeAmount) return;
    
    stake.mutate({ 
      poolId: selectedPool, 
      amount: parseFloat(stakeAmount),
      walletAddress 
    });
    setStakeAmount('');
  };

  const nftBoost = userBenefits?.staking_boost || 0;

  return (
    <div className="space-y-6">
      {/* Staking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-green-400" />
              <span className="text-sm text-muted-foreground">Total Staked</span>
            </div>
            <div className="text-2xl font-bold">{totalStaked.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">PROFIT tokens</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-muted-foreground">Pending Rewards</span>
            </div>
            <div className="text-2xl font-bold text-green-400">+{totalPendingRewards.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">PROFIT tokens</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-muted-foreground">NFT Boost</span>
            </div>
            <div className="text-2xl font-bold">{nftBoost}%</div>
            <div className="text-xs text-muted-foreground">Extra rewards</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-muted-foreground">Active Stakes</span>
            </div>
            <div className="text-2xl font-bold">{userStakes.length}</div>
            <div className="text-xs text-muted-foreground">positions</div>
          </CardContent>
        </Card>
      </div>

      {/* Staking Pools */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Staking Pools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pools.map(pool => {
            const isSelected = selectedPool === pool.id;
            const effectiveAPY = pool.apy_percent * (1 + nftBoost / 100);
            
            return (
              <motion.div key={pool.id} whileHover={{ scale: 1.02 }}>
                <Card 
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-green-500 bg-green-500/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedPool(pool.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-lg">{pool.pool_name}</div>
                      <Badge variant={pool.pool_type === 'nft_boost' ? 'default' : 'outline'}>
                        {pool.pool_type.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Base APY</span>
                          <span className="text-xl font-bold text-green-400">{pool.apy_percent}%</span>
                        </div>
                        {nftBoost > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-purple-400">+ NFT Boost</span>
                            <span className="text-purple-400 font-bold">{effectiveAPY.toFixed(1)}%</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Min Stake</span>
                        <span>{pool.min_stake.toLocaleString()} PROFIT</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Lock Period</span>
                        <span className="flex items-center gap-1">
                          {pool.lock_period_days > 0 ? (
                            <>
                              <Lock className="w-3 h-3" />
                              {pool.lock_period_days} days
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3 text-green-400" />
                              Flexible
                            </>
                          )}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Total Staked</span>
                          <span>{(pool.total_staked / 1000000).toFixed(2)}M</span>
                        </div>
                        <Progress value={Math.min((pool.total_staked / 50000000) * 100, 100)} className="h-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Stake Input */}
        {selectedPool && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Amount to stake"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="text-lg"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Min: {pools.find(p => p.id === selectedPool)?.min_stake.toLocaleString()} PROFIT
                  </div>
                </div>
                <Button 
                  onClick={handleStake}
                  disabled={stake.isPending || !stakeAmount}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  {stake.isPending ? 'Staking...' : 'Stake'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Active Stakes */}
      {userStakes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Active Stakes</h3>
          <div className="space-y-3">
            {userStakes.map(userStake => {
              const pool = pools.find(p => p.id === userStake.pool_id);
              const rewards = calculateRewards(userStake);
              const isLocked = userStake.unlock_at && new Date(userStake.unlock_at) > new Date();
              const daysUntilUnlock = userStake.unlock_at 
                ? Math.ceil((new Date(userStake.unlock_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : 0;
              
              return (
                <Card key={userStake.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <div className="font-bold">{pool?.pool_name || 'Unknown Pool'}</div>
                          <div className="text-sm text-muted-foreground">
                            Staked {new Date(userStake.staked_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold">{userStake.staked_amount.toLocaleString()} PROFIT</div>
                        <div className="text-sm text-green-400">+{rewards.toFixed(2)} pending</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isLocked ? (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {daysUntilUnlock}d left
                          </Badge>
                        ) : (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => claimRewards.mutate(userStake.id)}
                              disabled={claimRewards.isPending}
                            >
                              <Gift className="w-4 h-4 mr-1" />
                              Claim
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => unstake.mutate(userStake.id)}
                              disabled={unstake.isPending}
                            >
                              <ArrowDownRight className="w-4 h-4 mr-1" />
                              Unstake
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
