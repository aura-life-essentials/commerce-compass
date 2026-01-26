import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDAO } from '@/hooks/useDAO';
import { 
  Coins, 
  Users, 
  TrendingUp, 
  ExternalLink,
  Sparkles,
  Clock
} from 'lucide-react';

const ETH_USD_RATE = 3500;
const FUNDING_GOAL_USD = 30000;
const FUNDING_GOAL_ETH = FUNDING_GOAL_USD / ETH_USD_RATE;

export function CasinoProjectCard() {
  const { projects, userContributions } = useDAO();
  
  const casinoProject = projects.find(p => p.project_name.includes('Ultra Casino'));
  
  if (!casinoProject) return null;
  
  const currentFunding = casinoProject.current_funding_eth || 0;
  const currentFundingUSD = currentFunding * ETH_USD_RATE;
  const progressPercent = (currentFunding / FUNDING_GOAL_ETH) * 100;
  
  const userContribution = userContributions.find(c => c.project_id === casinoProject.id);
  const userEquity = userContribution?.equity_percent || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-amber-900/30 via-background to-purple-900/30 border-amber-500/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Ultra Casino Launch
              </CardTitle>
              <CardDescription>Web3 Casino Token Sale</CardDescription>
            </div>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
              {progressPercent.toFixed(1)}% Funded
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-amber-300">${currentFundingUSD.toLocaleString()}</span>
              <span className="text-muted-foreground">$30,000 Goal</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                Backers
              </div>
              <div className="font-bold text-lg">{casinoProject.total_backers}</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Coins className="w-4 h-4" />
                ETH
              </div>
              <div className="font-bold text-lg">{currentFunding.toFixed(2)}</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Status
              </div>
              <div className="font-bold text-lg text-green-400">Live</div>
            </div>
          </div>

          {userContribution && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Your Equity</span>
                <span className="font-bold text-amber-400">{userEquity.toFixed(4)}%</span>
              </div>
            </div>
          )}

          <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold hover:opacity-90">
            <Link to="/casino">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Project & Invest
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
