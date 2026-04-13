import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useDAO } from '@/hooks/useDAO';
import { useWeb3 } from '@/hooks/useWeb3';
import { useAuthContext } from '@/contexts/AuthContext';
import { Header } from '@/components/dashboard/Header';
import { InvestorAIBot } from '@/components/casino/InvestorAIBot';
import {
  Sparkles, 
  Trophy, 
  Users, 
  Coins, 
  Shield, 
  Zap, 
  ArrowRight,
  Wallet,
  TrendingUp,
  Gift,
  Star,
  Check,
  Clock,
  Globe,
  Rocket,
  Crown,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

const ETH_USD_RATE = 3500; // Approximate ETH to USD conversion
const FUNDING_GOAL_USD = 30000;
const FUNDING_GOAL_ETH = FUNDING_GOAL_USD / ETH_USD_RATE;

const benefits = [
  { icon: Trophy, title: 'Free Casino Entry', description: 'Lifetime access to all casino games' },
  { icon: Gift, title: 'Bonus Airdrops', description: 'Regular token airdrops as project grows' },
  { icon: Coins, title: 'Equity Ownership', description: 'Revenue share based on your contribution %' },
  { icon: Star, title: 'VIP Status', description: 'Priority access to new features and games' },
  { icon: Shield, title: 'Provably Fair', description: 'Blockchain-verified gaming outcomes' },
  { icon: Crown, title: 'Governance Rights', description: 'Vote on casino decisions and game additions' },
];

const roadmap = [
  { phase: 'Phase 1', title: 'Funding Round', status: 'active', description: 'Raise $30,000 for development' },
  { phase: 'Phase 2', title: 'Smart Contract Development', status: 'pending', description: 'Build provably fair gaming contracts' },
  { phase: 'Phase 3', title: 'Beta Access', status: 'pending', description: 'NFT holders get early access' },
  { phase: 'Phase 4', title: 'Public Launch', status: 'pending', description: 'Full casino launch with revenue sharing' },
];

const marketplaces = [
  { name: 'OpenSea', url: 'https://opensea.io', icon: '🌊' },
  { name: 'Coinbase NFT', url: 'https://nft.coinbase.com', icon: '🪙' },
  { name: 'Rarible', url: 'https://rarible.com', icon: '🎨' },
  { name: 'LooksRare', url: 'https://looksrare.org', icon: '💎' },
];

export default function CasinoLaunch() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { walletAddress, connectWallet, isConnected, balance } = useWeb3();
  const { projects, contribute, userContributions } = useDAO();
  const [contributionAmount, setContributionAmount] = useState('0.1');
  const [isContributing, setIsContributing] = useState(false);

  // Find the Ultra Casino project
  const casinoProject = projects.find(p => p.project_name.includes('Ultra Casino'));
  
  const currentFunding = casinoProject?.current_funding_eth || 0;
  const currentFundingUSD = currentFunding * ETH_USD_RATE;
  const progressPercent = (currentFunding / FUNDING_GOAL_ETH) * 100;
  const backers = casinoProject?.total_backers || 0;

  // Check if user has contributed
  const userContribution = userContributions.find(c => c.project_id === casinoProject?.id);
  const userEquity = userContribution?.equity_percent || 0;

  const handleContribute = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (!casinoProject || !walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount < 0.01) {
      toast.error('Minimum contribution is 0.01 ETH');
      return;
    }

    setIsContributing(true);
    try {
      await contribute.mutateAsync({
        projectId: casinoProject.id,
        amount,
        walletAddress
      });
      toast.success(`Successfully invested ${amount} ETH! You now own equity in Ultra Casino.`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to contribute');
    } finally {
      setIsContributing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient casino glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/5 to-purple-500/5 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <section className="pt-16 pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Badge className="mb-4 bg-gradient-to-r from-amber-500/20 to-purple-500/20 border-amber-500/30 text-amber-300 text-sm py-2 px-4">
                🎰 Web3 Casino Investment Opportunity
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-purple-500">
                  Ultra Casino
                </span>
              </h1>
              
              <p className="text-2xl text-amber-300/80 mb-6">
                Own a Piece of the Future of Web3 Gaming
              </p>
              
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
                Invest in the revolutionary Web3 casino platform. Get NFT access passes, 
                equity ownership, lifetime benefits, and revenue share from day one.
              </p>

              {/* Funding Progress */}
              <Card className="max-w-2xl mx-auto bg-gradient-to-br from-amber-900/30 via-background to-purple-900/30 border-amber-500/30 mb-8">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-amber-400">
                      ${currentFundingUSD.toLocaleString()} / $30,000
                    </span>
                    <Badge variant="outline" className="border-amber-500/50 text-amber-300">
                      {progressPercent.toFixed(1)}% Funded
                    </Badge>
                  </div>
                  
                  <Progress value={progressPercent} className="h-4 mb-4 bg-amber-900/30" />
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{backers} Investors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4" />
                      <span>{currentFunding.toFixed(4)} ETH Raised</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Funding Open</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Investment Section */}
        <section className="py-12 px-6 bg-gradient-to-b from-amber-900/10 to-background">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Invest Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-amber-900/40 to-purple-900/40 border-amber-500/40 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Wallet className="w-6 h-6 text-amber-400" />
                      Invest Now
                    </CardTitle>
                    <CardDescription>
                      Get your NFT Casino Pass and equity ownership
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {userContribution && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center gap-2 text-green-400 mb-2">
                          <Check className="w-5 h-5" />
                          <span className="font-semibold">You're an Investor!</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          You own <span className="text-amber-400 font-bold">{userEquity.toFixed(4)}%</span> equity 
                          ({userContribution.contribution_eth} ETH invested)
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Investment Amount (ETH)</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(e.target.value)}
                          placeholder="0.1"
                          min="0.01"
                          step="0.01"
                          className="flex-1 bg-background/50 border-amber-500/30"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setContributionAmount('0.1')}
                          className="border-amber-500/30"
                        >
                          0.1
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setContributionAmount('0.5')}
                          className="border-amber-500/30"
                        >
                          0.5
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setContributionAmount('1')}
                          className="border-amber-500/30"
                        >
                          1
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        ≈ ${(parseFloat(contributionAmount || '0') * ETH_USD_RATE).toLocaleString()} USD
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-background/50 border border-border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Your Equity</span>
                        <span className="font-bold text-amber-400">
                          {((parseFloat(contributionAmount || '0') / FUNDING_GOAL_ETH) * 100).toFixed(4)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Projected Annual Returns</span>
                        <span className="font-bold text-green-400">
                          ${((parseFloat(contributionAmount || '0') / FUNDING_GOAL_ETH) * 500000 * 0.3).toLocaleString()}+
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        *Based on projected $500k annual revenue, 30% to equity holders
                      </p>
                    </div>

                    <Button
                      size="lg"
                      onClick={handleContribute}
                      disabled={isContributing || contribute.isPending}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold text-lg h-14"
                    >
                      {!isConnected ? (
                        <>
                          <Wallet className="w-5 h-5 mr-2" />
                          Connect Wallet to Invest
                        </>
                      ) : isContributing || contribute.isPending ? (
                        'Processing...'
                      ) : (
                        <>
                          <Rocket className="w-5 h-5 mr-2" />
                          Invest {contributionAmount} ETH Now
                        </>
                      )}
                    </Button>

                    {isConnected && (
                      <p className="text-xs text-center text-muted-foreground">
                        Wallet Balance: {balance} ETH
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Benefits Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                      Investor Benefits
                    </CardTitle>
                    <CardDescription>
                      What you get with your NFT Casino Pass
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {benefits.map((benefit, index) => (
                        <motion.div
                          key={benefit.title}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-amber-500/10 border border-purple-500/20"
                        >
                          <benefit.icon className="w-8 h-8 text-amber-400 mb-2" />
                          <h4 className="font-semibold mb-1">{benefit.title}</h4>
                          <p className="text-sm text-muted-foreground">{benefit.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge className="mb-4">Development Roadmap</Badge>
              <h2 className="text-4xl font-bold mb-4">
                From Funding to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-500">
                  Global Launch
                </span>
              </h2>
            </motion.div>

            <div className="space-y-4">
              {roadmap.map((item, index) => (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-xl border ${
                    item.status === 'active' 
                      ? 'bg-gradient-to-r from-amber-500/20 to-purple-500/20 border-amber-500/50' 
                      : 'bg-card/50 border-border'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      item.status === 'active' 
                        ? 'bg-amber-500 text-black' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.status === 'active' ? <Zap className="w-6 h-6" /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{item.phase}</span>
                        {item.status === 'active' && (
                          <Badge className="bg-amber-500 text-black">In Progress</Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* NFT Marketplace Section */}
        <section className="py-16 px-6 bg-gradient-to-b from-purple-900/10 to-background">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4">Trade Your Pass</Badge>
              <h2 className="text-4xl font-bold mb-4">
                Listed on{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-500">
                  All Major Marketplaces
                </span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Your NFT Casino Pass can be traded on these platforms
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {marketplaces.map((marketplace) => (
                  <a
                    key={marketplace.name}
                    href={marketplace.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-6 rounded-xl bg-card/50 border border-border hover:border-amber-500/50 transition-all hover:-translate-y-1"
                  >
                    <div className="text-4xl mb-2">{marketplace.icon}</div>
                    <p className="font-semibold">{marketplace.name}</p>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Company Positioning Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge className="mb-4">Global Agency</Badge>
              <h2 className="text-4xl font-bold mb-4">
                Powered by{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                  Web3 Industry Integrations
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Ultra Casino is a flagship project from our global Web3 agency platform, 
                specializing in blockchain gaming, NFT ecosystems, and decentralized finance.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border text-center p-6">
                <Globe className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Global Reach</h3>
                <p className="text-muted-foreground">Operating across 15+ countries with localized experiences</p>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border text-center p-6">
                <Shield className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <h3 className="text-xl font-bold mb-2">Audited Security</h3>
                <p className="text-muted-foreground">Smart contracts audited by leading security firms</p>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border text-center p-6">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                <h3 className="text-xl font-bold mb-2">Revenue Sharing</h3>
                <p className="text-muted-foreground">30% of profits distributed to equity holders</p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-amber-500/20 via-purple-500/10 to-orange-500/20 border border-amber-500/30"
          >
            <h2 className="text-4xl font-bold mb-4">Don't Miss This Opportunity</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Only $30,000 will be raised. Early investors get the best equity positions.
              Secure your NFT Casino Pass before it's too late.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-black font-bold"
                onClick={handleContribute}
              >
                Invest Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/welcome')}>
                Learn More About Us
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-6">
          <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
            <p>© 2024 Aura Lift Essentials. All rights reserved.</p>
            <p className="mt-2">Smart contracts pending audit. Investment involves risk. DYOR.</p>
          </div>
        </footer>
      </div>
      
      {/* AI Investor Support Bot */}
      <InvestorAIBot />
    </div>
  );
}
