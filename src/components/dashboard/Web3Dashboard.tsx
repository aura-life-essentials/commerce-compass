import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Coins, TrendingUp, Gem, Boxes, Vote, Globe2, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWeb3 } from '@/hooks/useWeb3';
import { useNFTMembership } from '@/hooks/useNFTMembership';
import { useStaking } from '@/hooks/useStaking';
import { useDAO } from '@/hooks/useDAO';
import { NFTMembershipPanel } from './web3/NFTMembershipPanel';
import { StakingPanel } from './web3/StakingPanel';
import { DAOPanel } from './web3/DAOPanel';
import { CryptoPayments } from './web3/CryptoPayments';

export function Web3Dashboard() {
  const { walletAddress, balance, chainName, connectWallet, isConnecting, isConnected } = useWeb3();
  const { userNFTs, userHighestTier, totalRoyalties } = useNFTMembership();
  const { totalStaked, totalPendingRewards, pools } = useStaking();
  const { treasury, totalFundingRaised, userTotalInvested, activeProjects } = useDAO();

  const [activeTab, setActiveTab] = React.useState<'overview' | 'nft' | 'staking' | 'dao' | 'payments'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Globe2 },
    { id: 'nft', label: 'NFT Pass', icon: Gem },
    { id: 'staking', label: 'Staking', icon: TrendingUp },
    { id: 'dao', label: 'DAO', icon: Vote },
    { id: 'payments', label: 'Crypto Pay', icon: Coins }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Boxes className="w-6 h-6 text-purple-500" />
            Web3 Command Center
          </h2>
          <p className="text-muted-foreground">NFT Membership • Token Staking • DAO • Crypto Payments</p>
        </div>
        
        {!isConnected ? (
          <Button 
            onClick={connectWallet} 
            disabled={isConnecting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1.5">
              {chainName}
            </Badge>
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="text-xs text-muted-foreground">Balance</div>
              <div className="font-mono font-bold">{balance} ETH</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg px-4 py-2 border border-purple-500/30">
              <div className="text-xs text-purple-400">Wallet</div>
              <div className="font-mono text-sm">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border pb-2">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={activeTab === tab.id ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Revenue Streams */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-muted-foreground">Crypto Sales</span>
                  </div>
                  <div className="text-2xl font-bold">12.5 ETH</div>
                  <div className="text-xs text-green-400">+24% this week</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Gem className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-muted-foreground">NFT Royalties</span>
                  </div>
                  <div className="text-2xl font-bold">{totalRoyalties.toFixed(4)} ETH</div>
                  <div className="text-xs text-purple-400">7.5% on resales</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-muted-foreground">Staking Fees</span>
                  </div>
                  <div className="text-2xl font-bold">3.2 ETH</div>
                  <div className="text-xs text-green-400">{pools.reduce((sum, p) => sum + p.total_staked, 0).toLocaleString()} staked</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Vote className="w-5 h-5 text-amber-400" />
                    <span className="text-sm text-muted-foreground">DAO Fees</span>
                  </div>
                  <div className="text-2xl font-bold">1.8 ETH</div>
                  <div className="text-xs text-amber-400">10% of projects</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-rose-400" />
                    <span className="text-sm text-muted-foreground">Project Revenue</span>
                  </div>
                  <div className="text-2xl font-bold">{totalFundingRaised.toFixed(2)} ETH</div>
                  <div className="text-xs text-rose-400">{activeProjects.length} active projects</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Treasury */}
          {treasury && (
            <Card className="bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-purple-400" />
                  DAO Treasury
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">ETH Balance</div>
                    <div className="text-xl font-bold">{treasury.eth_balance} ETH</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">USDC Balance</div>
                    <div className="text-xl font-bold">${treasury.usdc_balance.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">PROFIT Tokens</div>
                    <div className="text-xl font-bold">{(treasury.token_balance / 1000000).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Value</div>
                    <div className="text-xl font-bold text-green-400">${treasury.total_value_usd.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-2">Your NFT Passes</div>
                <div className="text-3xl font-bold">{userNFTs.length}</div>
                {userHighestTier && (
                  <Badge className="mt-2 capitalize bg-gradient-to-r from-purple-500 to-pink-500">
                    {userHighestTier} Member
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-2">Your Staked Amount</div>
                <div className="text-3xl font-bold">{totalStaked.toLocaleString()} PROFIT</div>
                <div className="text-sm text-green-400 mt-1">
                  +{totalPendingRewards.toFixed(2)} pending
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-2">Your Project Investments</div>
                <div className="text-3xl font-bold">{userTotalInvested.toFixed(2)} ETH</div>
                <div className="text-sm text-purple-400 mt-1">
                  Equity holder
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* NFT Panel */}
      {activeTab === 'nft' && <NFTMembershipPanel />}

      {/* Staking Panel */}
      {activeTab === 'staking' && <StakingPanel />}

      {/* DAO Panel */}
      {activeTab === 'dao' && <DAOPanel />}

      {/* Crypto Payments */}
      {activeTab === 'payments' && <CryptoPayments />}
    </div>
  );
}
