-- Web3 Wallet Connections
CREATE TABLE public.wallet_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL UNIQUE,
  chain TEXT NOT NULL DEFAULT 'ethereum',
  ens_name TEXT,
  is_primary BOOLEAN DEFAULT false,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- NFT Membership Passes
CREATE TABLE public.nft_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id TEXT NOT NULL UNIQUE,
  contract_address TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'bronze', -- bronze, silver, gold, platinum, diamond
  owner_wallet TEXT NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id),
  minted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  price_eth DECIMAL(18, 8),
  benefits JSONB DEFAULT '{"discount_percent": 5, "early_access": false, "exclusive_drops": false}'::jsonb,
  royalty_percent DECIMAL(5, 2) DEFAULT 7.5,
  total_royalties_earned DECIMAL(18, 8) DEFAULT 0,
  metadata_uri TEXT,
  image_url TEXT,
  is_listed BOOLEAN DEFAULT false,
  list_price_eth DECIMAL(18, 8)
);

-- Utility Token Holdings
CREATE TABLE public.token_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  token_balance DECIMAL(24, 8) NOT NULL DEFAULT 0,
  staked_balance DECIMAL(24, 8) NOT NULL DEFAULT 0,
  pending_rewards DECIMAL(24, 8) NOT NULL DEFAULT 0,
  total_earned DECIMAL(24, 8) NOT NULL DEFAULT 0,
  governance_power DECIMAL(24, 8) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wallet_address)
);

-- Staking Pools
CREATE TABLE public.staking_pools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_name TEXT NOT NULL,
  pool_type TEXT NOT NULL DEFAULT 'standard', -- standard, nft_boost, lp
  apy_percent DECIMAL(8, 4) NOT NULL DEFAULT 12.5,
  total_staked DECIMAL(24, 8) NOT NULL DEFAULT 0,
  total_rewards_distributed DECIMAL(24, 8) NOT NULL DEFAULT 0,
  min_stake DECIMAL(24, 8) DEFAULT 100,
  lock_period_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Stakes
CREATE TABLE public.user_stakes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  wallet_address TEXT NOT NULL,
  pool_id UUID REFERENCES public.staking_pools(id),
  staked_amount DECIMAL(24, 8) NOT NULL,
  staked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unlock_at TIMESTAMP WITH TIME ZONE,
  last_claim_at TIMESTAMP WITH TIME ZONE,
  accumulated_rewards DECIMAL(24, 8) DEFAULT 0,
  nft_boost_percent DECIMAL(5, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- DAO Treasury
CREATE TABLE public.dao_treasury (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treasury_name TEXT NOT NULL DEFAULT 'Main Treasury',
  eth_balance DECIMAL(24, 8) NOT NULL DEFAULT 0,
  usdc_balance DECIMAL(24, 8) NOT NULL DEFAULT 0,
  token_balance DECIMAL(24, 8) NOT NULL DEFAULT 0,
  total_value_usd DECIMAL(24, 2) NOT NULL DEFAULT 0,
  revenue_share_percent DECIMAL(5, 2) DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DAO Projects (Crowdfunded)
CREATE TABLE public.dao_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL, -- app, game, nft_collection, metaverse, defi
  funding_goal_eth DECIMAL(18, 8) NOT NULL,
  current_funding_eth DECIMAL(18, 8) NOT NULL DEFAULT 0,
  funding_deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'funding', -- funding, funded, building, launched, cancelled
  total_backers INTEGER DEFAULT 0,
  equity_pool_percent DECIMAL(5, 2) NOT NULL DEFAULT 100,
  min_contribution_eth DECIMAL(18, 8) DEFAULT 0.01,
  max_contribution_eth DECIMAL(18, 8),
  creator_wallet TEXT NOT NULL,
  creator_user_id UUID REFERENCES auth.users(id),
  proposal_id UUID,
  banner_image TEXT,
  roadmap JSONB DEFAULT '[]'::jsonb,
  team JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  launched_at TIMESTAMP WITH TIME ZONE
);

-- Project Contributions (Equity Stakes)
CREATE TABLE public.project_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.dao_projects(id) ON DELETE CASCADE,
  contributor_wallet TEXT NOT NULL,
  contributor_user_id UUID REFERENCES auth.users(id),
  contribution_eth DECIMAL(18, 8) NOT NULL,
  equity_percent DECIMAL(10, 6) NOT NULL,
  contributed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tx_hash TEXT,
  rewards_claimed DECIMAL(18, 8) DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- DAO Proposals & Voting
CREATE TABLE public.dao_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposal_type TEXT NOT NULL, -- project_launch, treasury_spend, parameter_change, community
  proposer_wallet TEXT NOT NULL,
  proposer_user_id UUID REFERENCES auth.users(id),
  votes_for DECIMAL(24, 8) DEFAULT 0,
  votes_against DECIMAL(24, 8) DEFAULT 0,
  quorum_required DECIMAL(24, 8) DEFAULT 100000,
  voting_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active', -- active, passed, failed, executed, cancelled
  execution_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE
);

-- Individual Votes
CREATE TABLE public.dao_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES public.dao_proposals(id) ON DELETE CASCADE,
  voter_wallet TEXT NOT NULL,
  voter_user_id UUID REFERENCES auth.users(id),
  vote_power DECIMAL(24, 8) NOT NULL,
  vote_direction TEXT NOT NULL, -- for, against
  voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tx_hash TEXT,
  UNIQUE(proposal_id, voter_wallet)
);

-- Crypto Transactions
CREATE TABLE public.crypto_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tx_hash TEXT UNIQUE,
  tx_type TEXT NOT NULL, -- purchase, stake, unstake, claim, vote, contribute, royalty
  from_wallet TEXT NOT NULL,
  to_wallet TEXT,
  amount DECIMAL(24, 8) NOT NULL,
  token TEXT NOT NULL DEFAULT 'ETH', -- ETH, USDC, PROFIT (utility token)
  usd_value DECIMAL(18, 2),
  chain TEXT DEFAULT 'base',
  status TEXT DEFAULT 'pending', -- pending, confirmed, failed
  related_order_id UUID REFERENCES public.orders(id),
  related_project_id UUID REFERENCES public.dao_projects(id),
  gas_fee DECIMAL(18, 8),
  block_number BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Metaverse Spaces
CREATE TABLE public.metaverse_spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_name TEXT NOT NULL,
  space_type TEXT NOT NULL DEFAULT 'office', -- office, showroom, meeting, event
  owner_wallet TEXT,
  owner_user_id UUID REFERENCES auth.users(id),
  max_capacity INTEGER DEFAULT 50,
  current_visitors INTEGER DEFAULT 0,
  position_data JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}'::jsonb,
  decoration_data JSONB DEFAULT '{}'::jsonb,
  access_level TEXT DEFAULT 'public', -- public, members, nft_holders, private
  required_nft_tier TEXT,
  is_live BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Metaverse Visitors (Real-time)
CREATE TABLE public.metaverse_visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID REFERENCES public.metaverse_spaces(id) ON DELETE CASCADE,
  visitor_wallet TEXT,
  visitor_user_id UUID REFERENCES auth.users(id),
  display_name TEXT,
  avatar_url TEXT,
  position JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}'::jsonb,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_speaking BOOLEAN DEFAULT false
);

-- NFT Royalty Payments
CREATE TABLE public.nft_royalty_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nft_id UUID REFERENCES public.nft_memberships(id),
  sale_price_eth DECIMAL(18, 8) NOT NULL,
  royalty_amount_eth DECIMAL(18, 8) NOT NULL,
  from_wallet TEXT NOT NULL,
  to_wallet TEXT NOT NULL,
  marketplace TEXT,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Revenue Streams Summary
CREATE TABLE public.web3_revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  crypto_sales_eth DECIMAL(18, 8) DEFAULT 0,
  crypto_sales_usd DECIMAL(18, 2) DEFAULT 0,
  nft_royalties_eth DECIMAL(18, 8) DEFAULT 0,
  nft_royalties_usd DECIMAL(18, 2) DEFAULT 0,
  staking_fees_eth DECIMAL(18, 8) DEFAULT 0,
  staking_fees_usd DECIMAL(18, 2) DEFAULT 0,
  dao_fees_eth DECIMAL(18, 8) DEFAULT 0,
  dao_fees_usd DECIMAL(18, 2) DEFAULT 0,
  project_revenue_eth DECIMAL(18, 8) DEFAULT 0,
  project_revenue_usd DECIMAL(18, 2) DEFAULT 0,
  total_eth DECIMAL(18, 8) DEFAULT 0,
  total_usd DECIMAL(18, 2) DEFAULT 0,
  UNIQUE(date)
);

-- Enable RLS
ALTER TABLE public.wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staking_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dao_treasury ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dao_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dao_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dao_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metaverse_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metaverse_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_royalty_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web3_revenue ENABLE ROW LEVEL SECURITY;

-- Policies for wallet connections (user owns their wallets)
CREATE POLICY "Users can manage their wallets" ON public.wallet_connections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Wallets are publicly viewable" ON public.wallet_connections
  FOR SELECT USING (true);

-- NFT memberships are public but ownership is verified
CREATE POLICY "NFTs are publicly viewable" ON public.nft_memberships
  FOR SELECT USING (true);

CREATE POLICY "Owners can update NFT listings" ON public.nft_memberships
  FOR UPDATE USING (auth.uid() = owner_user_id);

-- Token holdings viewable by owner
CREATE POLICY "Users view own holdings" ON public.token_holdings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage holdings" ON public.token_holdings
  FOR ALL USING (public.is_admin(auth.uid()));

-- Staking pools public read
CREATE POLICY "Pools are public" ON public.staking_pools
  FOR SELECT USING (true);

CREATE POLICY "Admins manage pools" ON public.staking_pools
  FOR ALL USING (public.is_admin(auth.uid()));

-- User stakes
CREATE POLICY "Users view own stakes" ON public.user_stakes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can stake" ON public.user_stakes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unstake" ON public.user_stakes
  FOR UPDATE USING (auth.uid() = user_id);

-- DAO Treasury public read
CREATE POLICY "Treasury is public" ON public.dao_treasury
  FOR SELECT USING (true);

CREATE POLICY "Admins manage treasury" ON public.dao_treasury
  FOR ALL USING (public.is_admin(auth.uid()));

-- DAO Projects public
CREATE POLICY "Projects are public" ON public.dao_projects
  FOR SELECT USING (true);

CREATE POLICY "Users can create projects" ON public.dao_projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Creators can update projects" ON public.dao_projects
  FOR UPDATE USING (auth.uid() = creator_user_id);

-- Contributions
CREATE POLICY "Contributions are public" ON public.project_contributions
  FOR SELECT USING (true);

CREATE POLICY "Users can contribute" ON public.project_contributions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Proposals public
CREATE POLICY "Proposals are public" ON public.dao_proposals
  FOR SELECT USING (true);

CREATE POLICY "Users can create proposals" ON public.dao_proposals
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Votes
CREATE POLICY "Votes are public" ON public.dao_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can vote" ON public.dao_votes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Transactions public read
CREATE POLICY "Transactions are public" ON public.crypto_transactions
  FOR SELECT USING (true);

CREATE POLICY "System can insert transactions" ON public.crypto_transactions
  FOR INSERT WITH CHECK (true);

-- Metaverse spaces public
CREATE POLICY "Spaces are public" ON public.metaverse_spaces
  FOR SELECT USING (true);

CREATE POLICY "Owners manage spaces" ON public.metaverse_spaces
  FOR ALL USING (auth.uid() = owner_user_id OR public.is_admin(auth.uid()));

-- Visitors public for real-time
CREATE POLICY "Visitors are public" ON public.metaverse_visitors
  FOR SELECT USING (true);

CREATE POLICY "Users can enter spaces" ON public.metaverse_visitors
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update position" ON public.metaverse_visitors
  FOR UPDATE USING (auth.uid() = visitor_user_id);

CREATE POLICY "Users can leave spaces" ON public.metaverse_visitors
  FOR DELETE USING (auth.uid() = visitor_user_id);

-- Royalties public
CREATE POLICY "Royalties are public" ON public.nft_royalty_payments
  FOR SELECT USING (true);

-- Revenue admin only
CREATE POLICY "Admins view revenue" ON public.web3_revenue
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins manage revenue" ON public.web3_revenue
  FOR ALL USING (public.is_admin(auth.uid()));

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.metaverse_visitors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dao_proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crypto_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_contributions;

-- Insert default staking pools
INSERT INTO public.staking_pools (pool_name, pool_type, apy_percent, min_stake, lock_period_days) VALUES
  ('Flex Pool', 'standard', 8.5, 100, 0),
  ('Silver Lock', 'standard', 15.0, 500, 30),
  ('Gold Lock', 'standard', 22.5, 1000, 90),
  ('Diamond Lock', 'nft_boost', 35.0, 5000, 180),
  ('LP Rewards', 'lp', 45.0, 100, 0);

-- Insert default treasury
INSERT INTO public.dao_treasury (treasury_name, eth_balance, usdc_balance, token_balance, total_value_usd)
VALUES ('Main Treasury', 25.5, 50000, 10000000, 125000);

-- Insert default metaverse spaces
INSERT INTO public.metaverse_spaces (space_name, space_type, access_level, max_capacity) VALUES
  ('Profit Reaper HQ', 'office', 'public', 100),
  ('Product Showroom', 'showroom', 'public', 50),
  ('Members Lounge', 'meeting', 'nft_holders', 25),
  ('Executive Suite', 'meeting', 'private', 10),
  ('Event Arena', 'event', 'public', 500);