import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DAOProject {
  id: string;
  project_name: string;
  description: string | null;
  project_type: 'app' | 'game' | 'nft_collection' | 'metaverse' | 'defi';
  funding_goal_eth: number;
  current_funding_eth: number;
  funding_deadline: string | null;
  status: 'funding' | 'funded' | 'building' | 'launched' | 'cancelled';
  total_backers: number;
  equity_pool_percent: number;
  min_contribution_eth: number;
  max_contribution_eth: number | null;
  creator_wallet: string;
  creator_user_id: string | null;
  banner_image: string | null;
  roadmap: any[];
  team: any[];
  created_at: string;
  launched_at: string | null;
}

export interface ProjectContribution {
  id: string;
  project_id: string;
  contributor_wallet: string;
  contributor_user_id: string | null;
  contribution_eth: number;
  equity_percent: number;
  contributed_at: string;
  tx_hash: string | null;
  rewards_claimed: number;
  is_active: boolean;
}

export interface DAOProposal {
  id: string;
  title: string;
  description: string;
  proposal_type: 'project_launch' | 'treasury_spend' | 'parameter_change' | 'community';
  proposer_wallet: string;
  proposer_user_id: string | null;
  votes_for: number;
  votes_against: number;
  quorum_required: number;
  voting_ends_at: string;
  status: 'active' | 'passed' | 'failed' | 'executed' | 'cancelled';
  execution_data: any;
  created_at: string;
  executed_at: string | null;
}

export interface DAOTreasury {
  id: string;
  treasury_name: string;
  eth_balance: number;
  usdc_balance: number;
  token_balance: number;
  total_value_usd: number;
  revenue_share_percent: number;
  updated_at: string;
}

export function useDAO() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  // Fetch treasury
  const { data: treasury } = useQuery({
    queryKey: ['dao-treasury'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dao_treasury')
        .select('*')
        .single();

      if (error) throw error;
      return data as DAOTreasury;
    }
  });

  // Fetch all projects
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['dao-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dao_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DAOProject[];
    }
  });

  // Fetch user's contributions
  const { data: userContributions = [] } = useQuery({
    queryKey: ['user-contributions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('project_contributions')
        .select('*')
        .eq('contributor_user_id', user.id);

      if (error) throw error;
      return data as ProjectContribution[];
    },
    enabled: !!user
  });

  // Fetch active proposals
  const { data: proposals = [], isLoading: isLoadingProposals } = useQuery({
    queryKey: ['dao-proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dao_proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DAOProposal[];
    }
  });

  // Create project
  const createProject = useMutation({
    mutationFn: async (project: {
      project_name: string;
      description: string;
      project_type: DAOProject['project_type'];
      funding_goal_eth: number;
      funding_deadline: string;
      min_contribution_eth: number;
      max_contribution_eth?: number;
      wallet_address: string;
    }) => {
      const { data, error } = await supabase
        .from('dao_projects')
        .insert([{
          project_name: project.project_name,
          description: project.description,
          project_type: project.project_type,
          funding_goal_eth: project.funding_goal_eth,
          funding_deadline: project.funding_deadline,
          min_contribution_eth: project.min_contribution_eth,
          max_contribution_eth: project.max_contribution_eth,
          creator_wallet: project.wallet_address,
          creator_user_id: user?.id,
          equity_pool_percent: 100
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dao-projects'] });
      toast.success('Project created! Now accepting contributions.');
    }
  });

  // Contribute to project
  const contribute = useMutation({
    mutationFn: async ({ projectId, amount, walletAddress }: { 
      projectId: string; 
      amount: number; 
      walletAddress: string;
    }) => {
      const project = projects.find(p => p.id === projectId);
      if (!project) throw new Error('Project not found');
      
      if (amount < project.min_contribution_eth) {
        throw new Error(`Minimum contribution is ${project.min_contribution_eth} ETH`);
      }
      
      if (project.max_contribution_eth && amount > project.max_contribution_eth) {
        throw new Error(`Maximum contribution is ${project.max_contribution_eth} ETH`);
      }

      // Calculate equity percentage
      const newTotal = project.current_funding_eth + amount;
      const equityPercent = (amount / project.funding_goal_eth) * project.equity_pool_percent;

      const { data, error } = await supabase
        .from('project_contributions')
        .insert([{
          project_id: projectId,
          contributor_wallet: walletAddress.toLowerCase(),
          contributor_user_id: user?.id,
          contribution_eth: amount,
          equity_percent: equityPercent
        }])
        .select()
        .single();

      if (error) throw error;

      // Update project funding
      await supabase
        .from('dao_projects')
        .update({
          current_funding_eth: newTotal,
          total_backers: project.total_backers + 1,
          status: newTotal >= project.funding_goal_eth ? 'funded' : 'funding'
        })
        .eq('id', projectId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dao-projects'] });
      queryClient.invalidateQueries({ queryKey: ['user-contributions'] });
      toast.success('Contribution successful! You now have equity in this project.');
    }
  });

  // Create proposal
  const createProposal = useMutation({
    mutationFn: async (proposal: {
      title: string;
      description: string;
      proposal_type: DAOProposal['proposal_type'];
      voting_days: number;
      wallet_address: string;
    }) => {
      const votingEndsAt = new Date(Date.now() + proposal.voting_days * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('dao_proposals')
        .insert([{
          title: proposal.title,
          description: proposal.description,
          proposal_type: proposal.proposal_type,
          proposer_wallet: proposal.wallet_address,
          proposer_user_id: user?.id,
          voting_ends_at: votingEndsAt,
          quorum_required: 100000
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dao-proposals'] });
      toast.success('Proposal created! Voting is now open.');
    }
  });

  // Vote on proposal
  const vote = useMutation({
    mutationFn: async ({ proposalId, direction, votePower, walletAddress }: {
      proposalId: string;
      direction: 'for' | 'against';
      votePower: number;
      walletAddress: string;
    }) => {
      const { data, error } = await supabase
        .from('dao_votes')
        .insert([{
          proposal_id: proposalId,
          voter_wallet: walletAddress.toLowerCase(),
          voter_user_id: user?.id,
          vote_power: votePower,
          vote_direction: direction
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already voted on this proposal');
        }
        throw error;
      }

      // Update proposal vote counts
      const proposal = proposals.find(p => p.id === proposalId);
      if (proposal) {
        const updateField = direction === 'for' ? 'votes_for' : 'votes_against';
        const currentVotes = direction === 'for' ? proposal.votes_for : proposal.votes_against;
        
        await supabase
          .from('dao_proposals')
          .update({ [updateField]: currentVotes + votePower })
          .eq('id', proposalId);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dao-proposals'] });
      toast.success('Vote submitted!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Stats
  const activeProjects = projects.filter(p => p.status === 'funding');
  const fundedProjects = projects.filter(p => ['funded', 'building', 'launched'].includes(p.status));
  const totalFundingRaised = projects.reduce((sum, p) => sum + p.current_funding_eth, 0);
  const userTotalInvested = userContributions.reduce((sum, c) => sum + c.contribution_eth, 0);

  return {
    treasury,
    projects,
    activeProjects,
    fundedProjects,
    userContributions,
    proposals,
    totalFundingRaised,
    userTotalInvested,
    isLoading: isLoadingProjects || isLoadingProposals,
    createProject,
    contribute,
    createProposal,
    vote
  };
}
