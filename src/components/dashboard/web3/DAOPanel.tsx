import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, Rocket, Users, TrendingUp, Plus, ThumbsUp, ThumbsDown, Clock, CheckCircle2, XCircle, Briefcase, Gamepad2, Image, Globe2, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDAO, DAOProject, DAOProposal } from '@/hooks/useDAO';
import { useStaking } from '@/hooks/useStaking';
import { useWeb3 } from '@/hooks/useWeb3';

const PROJECT_ICONS = {
  app: Briefcase,
  game: Gamepad2,
  nft_collection: Image,
  metaverse: Globe2,
  defi: Coins
};

const STATUS_COLORS = {
  funding: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  funded: 'bg-green-500/20 text-green-400 border-green-500/30',
  building: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  launched: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export function DAOPanel() {
  const { walletAddress, connectWallet, isConnected } = useWeb3();
  const { holdings } = useStaking();
  const { 
    treasury, 
    projects, 
    activeProjects,
    proposals, 
    userContributions,
    userTotalInvested,
    createProject, 
    contribute, 
    createProposal, 
    vote 
  } = useDAO();

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [contributeAmount, setContributeAmount] = useState<{ [key: string]: string }>({});
  
  const [newProject, setNewProject] = useState({
    project_name: '',
    description: '',
    project_type: 'app' as DAOProject['project_type'],
    funding_goal_eth: '',
    funding_deadline: '',
    min_contribution_eth: '0.01',
    max_contribution_eth: ''
  });

  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    proposal_type: 'community' as DAOProposal['proposal_type'],
    voting_days: 7
  });

  const votingPower = holdings?.governance_power || holdings?.token_balance || 0;

  const handleCreateProject = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }
    if (!walletAddress) return;

    createProject.mutate({
      ...newProject,
      funding_goal_eth: parseFloat(newProject.funding_goal_eth),
      min_contribution_eth: parseFloat(newProject.min_contribution_eth),
      max_contribution_eth: newProject.max_contribution_eth ? parseFloat(newProject.max_contribution_eth) : undefined,
      wallet_address: walletAddress
    });
    setShowCreateProject(false);
  };

  const handleContribute = async (projectId: string) => {
    if (!isConnected) {
      await connectWallet();
      return;
    }
    if (!walletAddress || !contributeAmount[projectId]) return;

    contribute.mutate({
      projectId,
      amount: parseFloat(contributeAmount[projectId]),
      walletAddress
    });
    setContributeAmount(prev => ({ ...prev, [projectId]: '' }));
  };

  const handleVote = async (proposalId: string, direction: 'for' | 'against') => {
    if (!isConnected) {
      await connectWallet();
      return;
    }
    if (!walletAddress || !votingPower) return;

    vote.mutate({
      proposalId,
      direction,
      votePower: votingPower,
      walletAddress
    });
  };

  return (
    <div className="space-y-6">
      {/* Treasury Overview */}
      {treasury && (
        <Card className="bg-gradient-to-r from-amber-900/20 via-orange-900/20 to-amber-900/20 border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-amber-400" />
              DAO Treasury
            </CardTitle>
            <CardDescription>Community-owned funds managed through governance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">ETH</div>
                <div className="text-xl font-bold">{treasury.eth_balance}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">USDC</div>
                <div className="text-xl font-bold">${treasury.usdc_balance.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">PROFIT</div>
                <div className="text-xl font-bold">{(treasury.token_balance / 1000000).toFixed(1)}M</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-xl font-bold text-green-400">${treasury.total_value_usd.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Your Voting Power</div>
                <div className="text-xl font-bold text-purple-400">{votingPower.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crowdfunded Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Crowdfunded Projects</h3>
          <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Plus className="w-4 h-4 mr-2" />
                Launch Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Launch Crowdfunded Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Project Name"
                  value={newProject.project_name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, project_name: e.target.value }))}
                />
                <Textarea
                  placeholder="Project Description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                />
                <Select
                  value={newProject.project_type}
                  onValueChange={(v) => setNewProject(prev => ({ ...prev, project_type: v as DAOProject['project_type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Project Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app">App / Platform</SelectItem>
                    <SelectItem value="game">Game</SelectItem>
                    <SelectItem value="nft_collection">NFT Collection</SelectItem>
                    <SelectItem value="metaverse">Metaverse</SelectItem>
                    <SelectItem value="defi">DeFi Protocol</SelectItem>
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Funding Goal (ETH)"
                    value={newProject.funding_goal_eth}
                    onChange={(e) => setNewProject(prev => ({ ...prev, funding_goal_eth: e.target.value }))}
                  />
                  <Input
                    type="date"
                    placeholder="Funding Deadline"
                    value={newProject.funding_deadline}
                    onChange={(e) => setNewProject(prev => ({ ...prev, funding_deadline: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Min Contribution (ETH)"
                    value={newProject.min_contribution_eth}
                    onChange={(e) => setNewProject(prev => ({ ...prev, min_contribution_eth: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max Contribution (optional)"
                    value={newProject.max_contribution_eth}
                    onChange={(e) => setNewProject(prev => ({ ...prev, max_contribution_eth: e.target.value }))}
                  />
                </div>
                <Button onClick={handleCreateProject} disabled={createProject.isPending} className="w-full">
                  {createProject.isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(project => {
            const Icon = PROJECT_ICONS[project.project_type];
            const progress = (project.current_funding_eth / project.funding_goal_eth) * 100;
            const userContribution = userContributions.find(c => c.project_id === project.id);
            
            return (
              <Card key={project.id} className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${
                  project.status === 'funding' ? 'from-blue-500 to-cyan-500' :
                  project.status === 'funded' ? 'from-green-500 to-emerald-500' :
                  project.status === 'building' ? 'from-amber-500 to-orange-500' :
                  'from-purple-500 to-pink-500'
                }`} style={{ width: `${Math.min(progress, 100)}%` }} />
                
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold">{project.project_name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{project.project_type.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <Badge className={STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}>
                      {project.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{project.current_funding_eth.toFixed(2)} ETH raised</span>
                        <span>{project.funding_goal_eth} ETH goal</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{project.total_backers} backers</span>
                      </div>
                      {project.funding_deadline && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(project.funding_deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {userContribution && (
                      <div className="bg-purple-500/10 rounded-lg p-2 text-sm">
                        <span className="text-purple-400">Your stake: </span>
                        <span className="font-bold">{userContribution.contribution_eth} ETH</span>
                        <span className="text-muted-foreground"> ({userContribution.equity_percent.toFixed(2)}% equity)</span>
                      </div>
                    )}

                    {project.status === 'funding' && (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder={`Min ${project.min_contribution_eth} ETH`}
                          value={contributeAmount[project.id] || ''}
                          onChange={(e) => setContributeAmount(prev => ({ ...prev, [project.id]: e.target.value }))}
                          className="flex-1"
                        />
                        <Button 
                          onClick={() => handleContribute(project.id)}
                          disabled={contribute.isPending}
                        >
                          <Rocket className="w-4 h-4 mr-1" />
                          Fund
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Governance Proposals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Governance Proposals</h3>
          <Dialog open={showCreateProposal} onOpenChange={setShowCreateProposal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Proposal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Proposal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Proposal Title"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Description"
                  value={newProposal.description}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                />
                <Select
                  value={newProposal.proposal_type}
                  onValueChange={(v) => setNewProposal(prev => ({ ...prev, proposal_type: v as DAOProposal['proposal_type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project_launch">Project Launch</SelectItem>
                    <SelectItem value="treasury_spend">Treasury Spend</SelectItem>
                    <SelectItem value="parameter_change">Parameter Change</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => {
                    if (walletAddress) {
                      createProposal.mutate({ ...newProposal, wallet_address: walletAddress });
                      setShowCreateProposal(false);
                    }
                  }}
                  disabled={createProposal.isPending}
                  className="w-full"
                >
                  Create Proposal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {proposals.map(proposal => {
            const totalVotes = proposal.votes_for + proposal.votes_against;
            const forPercent = totalVotes > 0 ? (proposal.votes_for / totalVotes) * 100 : 50;
            const isActive = proposal.status === 'active' && new Date(proposal.voting_ends_at) > new Date();
            
            return (
              <Card key={proposal.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold">{proposal.title}</div>
                      <div className="text-sm text-muted-foreground capitalize">{proposal.proposal_type.replace('_', ' ')}</div>
                    </div>
                    <Badge variant={
                      proposal.status === 'active' ? 'default' :
                      proposal.status === 'passed' ? 'default' :
                      'secondary'
                    } className={
                      proposal.status === 'passed' ? 'bg-green-500' :
                      proposal.status === 'failed' ? 'bg-red-500' : ''
                    }>
                      {proposal.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{proposal.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-green-400" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          style={{ width: `${forPercent}%` }}
                        />
                      </div>
                      <ThumbsDown className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{proposal.votes_for.toLocaleString()} For</span>
                      <span>{proposal.votes_against.toLocaleString()} Against</span>
                    </div>
                  </div>

                  {isActive && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleVote(proposal.id, 'for')}
                        disabled={vote.isPending}
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Vote For
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleVote(proposal.id, 'against')}
                        disabled={vote.isPending}
                      >
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Vote Against
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
