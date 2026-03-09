const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LaunchRequest {
  command: 'research' | 'generate_listing' | 'generate_pitch' | 'launch_all' | 'status';
  platform?: string;
  project_type?: string;
  project_name?: string;
  description?: string;
}

const PLATFORMS = {
  opensea: {
    name: 'OpenSea',
    type: 'nft_marketplace',
    url: 'https://opensea.io',
    fees: '2.5% seller fee',
    chain: 'Ethereum / Base / Polygon',
    best_for: 'NFT collections, membership passes, 1/1 art',
    listing_format: 'collection',
    requirements: ['Collection metadata', 'Royalty settings', 'Banner + logo images', 'Description'],
  },
  rarible: {
    name: 'Rarible',
    type: 'nft_marketplace',
    url: 'https://rarible.com',
    fees: '1% buyer + 1% seller',
    chain: 'Ethereum / Polygon / Base / Zora',
    best_for: 'Community-owned NFTs, multi-chain collections',
    listing_format: 'collection',
    requirements: ['Collection metadata', 'Royalties config', 'Community settings'],
  },
  coinbase_nft: {
    name: 'Coinbase NFT',
    type: 'nft_marketplace',
    url: 'https://nft.coinbase.com',
    fees: '0% marketplace fee',
    chain: 'Base / Ethereum',
    best_for: 'Mass adoption, Coinbase user base, Base chain projects',
    listing_format: 'collection',
    requirements: ['Base chain deployment', 'Collection metadata', 'Coinbase wallet compatible'],
  },
  zora: {
    name: 'Zora',
    type: 'creator_platform',
    url: 'https://zora.co',
    fees: 'Protocol rewards model',
    chain: 'Zora Network / Base / Ethereum',
    best_for: 'Open editions, content monetization, creator coins',
    listing_format: 'editions',
    requirements: ['Content/media assets', 'Edition pricing', 'Mint config'],
  },
  mirror: {
    name: 'Mirror',
    type: 'publishing',
    url: 'https://mirror.xyz',
    fees: 'Free to publish',
    chain: 'Ethereum / Optimism',
    best_for: 'Project announcements, crowdfunding, writing NFTs',
    listing_format: 'article + NFT',
    requirements: ['Written content', 'Funding goals', 'NFT gate settings'],
  },
  seedlist: {
    name: 'SeedList',
    type: 'launchpad',
    url: 'https://seedlist.net',
    fees: 'Platform fee varies',
    chain: 'Multi-chain',
    best_for: 'Crypto crowdfunding, community rounds, token launches',
    listing_format: 'campaign',
    requirements: ['Tokenomics', 'Roadmap', 'Team info', 'Pitch deck'],
  },
  dao_maker: {
    name: 'DAO Maker',
    type: 'launchpad',
    url: 'https://daomaker.com',
    fees: 'Varies by tier',
    chain: 'Multi-chain',
    best_for: 'Token IDOs, strong holder offerings, DAO launches',
    listing_format: 'SHO/IDO',
    requirements: ['Whitepaper', 'Tokenomics', 'KYC', 'Audit report'],
  },
  galxe: {
    name: 'Galxe',
    type: 'community',
    url: 'https://galxe.com',
    fees: 'Free to create quests',
    chain: 'Multi-chain',
    best_for: 'Community growth, quest campaigns, loyalty rewards',
    listing_format: 'campaign',
    requirements: ['Quest design', 'Reward NFTs', 'Verification criteria'],
  },
  guild_xyz: {
    name: 'Guild.xyz',
    type: 'community',
    url: 'https://guild.xyz',
    fees: 'Free',
    chain: 'Multi-chain',
    best_for: 'Token-gated communities, role-based access, community management',
    listing_format: 'guild',
    requirements: ['Role definitions', 'Gate conditions (NFT/token)', 'Community rules'],
  },
  snapshot: {
    name: 'Snapshot',
    type: 'governance',
    url: 'https://snapshot.org',
    fees: 'Free',
    chain: 'Off-chain voting',
    best_for: 'DAO governance, proposal voting, community decisions',
    listing_format: 'space',
    requirements: ['Voting strategy', 'Token/NFT for voting power', 'Proposal templates'],
  },
};

function generateListingContent(platform: string, projectName: string, description: string, projectType: string) {
  const platformInfo = PLATFORMS[platform as keyof typeof PLATFORMS];
  if (!platformInfo) return null;

  const listings: Record<string, any> = {
    opensea: {
      collection_name: projectName,
      description: `🔥 ${projectName} — ${description}\n\n🏆 Tiered membership: Bronze → Diamond\n💰 Revenue sharing + staking rewards\n🎮 DAO governance rights\n🌐 Metaverse HQ access\n\n✅ Built on Base L2 for low gas fees\n✅ 7.5% creator royalties\n✅ Utility-first: real platform access`,
      banner_prompt: `Futuristic dark tech banner for "${projectName}" NFT collection, neon purple and cyan accents, abstract geometric shapes, premium Web3 aesthetic`,
      logo_prompt: `Minimalist logo icon for "${projectName}", gradient purple to cyan, tech/finance hybrid, clean geometric design on white background`,
      category: 'Memberships',
      royalty_percent: 7.5,
      chain: 'base',
      tags: ['membership', 'utility', 'dao', 'defi', 'staking', projectType],
    },
    rarible: {
      collection_name: projectName,
      description: `${projectName} — Next-gen utility NFT collection.\n\n${description}\n\nHolder benefits:\n• Platform access tiers\n• Revenue sharing\n• Governance voting\n• Staking boost\n• Metaverse access`,
      royalty_percent: 7.5,
      chain: 'base',
      community_enabled: true,
    },
    coinbase_nft: {
      collection_name: projectName,
      description: `${projectName} on Base — Zero-fee trading.\n\n${description}\n\nBuilt for the Coinbase community. Mint with Coinbase Wallet.`,
      chain: 'base',
      coinbase_wallet_optimized: true,
    },
    zora: {
      title: `${projectName} Open Edition`,
      description: `Collect the ${projectName} genesis edition.\n\n${description}\n\nOpen edition — available for 72 hours. Collectors earn protocol rewards.`,
      edition_type: 'open',
      duration_hours: 72,
      mint_price: '0.000777 ETH',
      chain: 'zora',
    },
    mirror: {
      title: `Introducing ${projectName}: The Future of ${projectType}`,
      content: `# ${projectName}\n\n## The Vision\n${description}\n\n## Why Now?\nThe Web3 landscape is entering a utility-first era. Speculative NFTs are dead. What's alive? Real platforms, real revenue, real communities.\n\n## What We're Building\n- **Tiered Membership NFTs**: Bronze through Diamond, each with escalating platform benefits\n- **Revenue Sharing**: NFT holders earn from platform fees\n- **DAO Governance**: Vote on treasury allocation, new features, expansion\n- **Staking Rewards**: Lock tokens for boosted APY\n- **Metaverse HQ**: 3D virtual headquarters for community events\n\n## The Numbers\n- 5 membership tiers\n- 7.5% creator royalties on resales\n- Up to 25% APY staking rewards\n- $0 gas on Base L2\n\n## Join the Revolution\nMint your membership NFT and become a founding member.\n\n---\n*This is not financial advice. DYOR.*`,
      funding_enabled: true,
      funding_goal: '10 ETH',
    },
    seedlist: {
      project_name: projectName,
      tagline: description.slice(0, 100),
      pitch: `${projectName} is a full-stack Web3 commerce platform offering AI-powered business automation, tiered NFT memberships, DAO governance, and a metaverse headquarters. We're raising community funding to scale globally.`,
      tokenomics: {
        total_supply: '100,000,000',
        community_allocation: '40%',
        team_allocation: '15%',
        treasury: '20%',
        staking_rewards: '15%',
        liquidity: '10%',
      },
      roadmap: [
        { phase: 'Q1 2026', items: ['NFT collection launch', 'OpenSea + Rarible listings', 'Base chain deployment'] },
        { phase: 'Q2 2026', items: ['Token launch', 'Staking pools live', 'DAO governance active'] },
        { phase: 'Q3 2026', items: ['Metaverse HQ launch', 'Global expansion', 'Revenue sharing active'] },
        { phase: 'Q4 2026', items: ['Mobile app', 'Cross-chain bridges', '100K members target'] },
      ],
    },
    dao_maker: {
      project_name: projectName,
      type: 'SHO',
      description: `${description}\n\nStrong Holder Offering for ${projectName} utility token.`,
      raise_amount: '500,000 USDC',
      token_price: '0.01 USDC',
    },
    galxe: {
      campaign_name: `${projectName} Genesis Quest`,
      description: `Complete quests to earn your ${projectName} OAT (On-chain Achievement Token)`,
      quests: [
        { name: 'Follow on X', type: 'social', reward: 'OAT Badge' },
        { name: 'Join Discord', type: 'social', reward: '10 points' },
        { name: 'Mint Genesis NFT', type: 'on-chain', reward: 'Founder Badge' },
        { name: 'First Governance Vote', type: 'on-chain', reward: 'Voter Badge' },
        { name: 'Stake 100 Tokens', type: 'on-chain', reward: 'Staker Badge' },
      ],
    },
    guild_xyz: {
      guild_name: projectName,
      roles: [
        { name: 'Visitor', requirement: 'None', access: 'Public channels' },
        { name: 'Bronze Member', requirement: 'Hold Bronze NFT', access: 'Member channels + alpha' },
        { name: 'Gold Member', requirement: 'Hold Gold+ NFT', access: 'Premium channels + calls' },
        { name: 'Diamond Elite', requirement: 'Hold Diamond NFT', access: 'All access + governance' },
        { name: 'Token Holder', requirement: '1000+ tokens staked', access: 'Staker lounge' },
      ],
    },
    snapshot: {
      space_name: `${projectName} DAO`,
      voting_strategy: 'NFT tier-weighted + token balance',
      proposal_templates: [
        'Treasury Allocation',
        'New Feature Request',
        'Partnership Approval',
        'Fee Structure Change',
        'New Market Expansion',
      ],
    },
  };

  return {
    platform: platformInfo,
    listing: listings[platform] || null,
  };
}

function generatePitchDeck(projectName: string, description: string, projectType: string) {
  return {
    title: `${projectName} — Investor Pitch`,
    slides: [
      {
        title: 'The Problem',
        content: 'Web3 projects lack integrated utility. NFTs without function. Tokens without purpose. Communities without tools.',
        visual: 'Split screen: broken NFT art vs functional platform',
      },
      {
        title: 'The Solution',
        content: `${projectName}: A full-stack Web3 platform combining AI-powered commerce, tiered NFT memberships, DAO governance, staking, and a metaverse headquarters.`,
        visual: 'Platform ecosystem diagram',
      },
      {
        title: 'Market Opportunity',
        content: 'NFT market recovering (DWF Labs 2025 report). Utility NFTs outperforming art NFTs 5:1. Base chain TVL hit $1B in 7 months. Community-driven projects have 3x retention.',
        stats: ['$24B NFT market (2025)', '150M+ crypto wallets', 'Base: 2M daily transactions'],
      },
      {
        title: 'Revenue Model',
        content: '5 revenue streams: NFT sales + royalties, subscription tiers, staking fees, DAO treasury fees, Shopify commerce integration.',
        projections: { year1: '$500K', year2: '$2M', year3: '$10M' },
      },
      {
        title: 'Traction',
        content: 'Live platform with AI agents, Shopify integration, Stripe payments, ElevenLabs voice AI, and 3D metaverse. Ready for community launch.',
        metrics: ['5 AI agent teams', '30+ products live', 'Multi-chain wallet support'],
      },
      {
        title: 'Tokenomics',
        content: '100M total supply. 40% community, 20% treasury, 15% team (2yr vest), 15% staking rewards, 10% liquidity.',
        visual: 'Pie chart',
      },
      {
        title: 'Roadmap',
        phases: [
          'Q1: NFT launch on OpenSea/Coinbase/Rarible',
          'Q2: Token launch + staking pools',
          'Q3: Metaverse HQ + global expansion',
          'Q4: Mobile app + 100K members',
        ],
      },
      {
        title: 'The Team',
        content: 'AI-augmented team with 50+ autonomous agents handling sales, marketing, content, and operations 24/7.',
      },
      {
        title: 'The Ask',
        content: 'Raising 100 ETH community round via DAO. Contributors receive equity tokens + governance rights + NFT membership.',
        tiers: [
          { amount: '0.1 ETH', reward: 'Bronze NFT + 1,000 tokens' },
          { amount: '0.5 ETH', reward: 'Gold NFT + 10,000 tokens' },
          { amount: '1 ETH', reward: 'Diamond NFT + 25,000 tokens + governance seat' },
        ],
      },
    ],
    platforms_targeted: Object.keys(PLATFORMS),
    generated_at: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: LaunchRequest = await req.json();
    const { command, platform, project_type = 'web3_commerce', project_name = 'ProfitReaper', description = 'AI-powered Web3 commerce platform with autonomous agents, NFT memberships, DAO governance, and metaverse HQ' } = body;

    switch (command) {
      case 'research': {
        // Return platform intelligence
        const platformData = Object.entries(PLATFORMS).map(([key, info]) => ({
          id: key,
          ...info,
          strategy: getStrategy(key, project_type),
        }));
        return new Response(JSON.stringify({
          success: true,
          platforms: platformData,
          total_platforms: platformData.length,
          recommended_order: ['opensea', 'coinbase_nft', 'zora', 'mirror', 'galxe', 'rarible', 'guild_xyz', 'snapshot', 'seedlist', 'dao_maker'],
          research_summary: {
            nft_market: 'Recovering — utility NFTs dominating. Base chain is the hot L2 with zero marketplace fees on Coinbase.',
            community: 'Galxe quests + Guild.xyz gating = proven growth flywheel. Top projects get 10K+ quest completions.',
            fundraising: 'SeedList and DAO Maker are top launchpads. Community rounds outperform VC rounds in retention.',
            content: 'Mirror articles + Zora editions = credibility + monetization. Top writers earn 5-10 ETH per drop.',
            governance: 'Snapshot is standard for DAO voting. NFT-weighted voting trending over pure token voting.',
          },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'generate_listing': {
        if (!platform) {
          // Generate for ALL platforms
          const allListings = Object.keys(PLATFORMS).map(p => ({
            platform_id: p,
            ...generateListingContent(p, project_name, description, project_type),
          }));
          return new Response(JSON.stringify({
            success: true,
            listings: allListings,
            total: allListings.length,
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const listing = generateListingContent(platform, project_name, description, project_type);
        if (!listing) {
          return new Response(JSON.stringify({ success: false, error: `Unknown platform: ${platform}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ success: true, ...listing }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'generate_pitch': {
        const pitch = generatePitchDeck(project_name, description, project_type);
        return new Response(JSON.stringify({ success: true, pitch }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'launch_all': {
        // Generate all listings + pitch + save to DB
        const allListings = Object.keys(PLATFORMS).map(p => ({
          platform_id: p,
          ...generateListingContent(p, project_name, description, project_type),
        }));
        const pitch = generatePitchDeck(project_name, description, project_type);

        // Log the launch event
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        const logRes = await fetch(`${supabaseUrl}/rest/v1/agent_logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            agent_name: 'Web3 Launch Engine',
            agent_role: 'launcher',
            action: 'launch_all_platforms',
            status: 'completed',
            details: {
              platforms_count: allListings.length,
              platforms: Object.keys(PLATFORMS),
              project_name,
              pitch_generated: true,
              launched_at: new Date().toISOString(),
            },
          }),
        });

        return new Response(JSON.stringify({
          success: true,
          mode: 'full_launch',
          listings: allListings,
          pitch,
          platforms_targeted: Object.keys(PLATFORMS).length,
          next_steps: [
            '1. Deploy NFT contract to Base chain',
            '2. Upload collection assets to IPFS',
            '3. Submit to OpenSea & Coinbase NFT',
            '4. Publish Mirror article for credibility',
            '5. Create Zora open edition for buzz',
            '6. Set up Galxe quest campaign',
            '7. Configure Guild.xyz token gates',
            '8. Initialize Snapshot governance space',
            '9. Apply to SeedList/DAO Maker launchpads',
            '10. Deploy Rarible multi-chain collection',
          ],
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'status': {
        return new Response(JSON.stringify({
          success: true,
          engine_status: 'ready',
          platforms_configured: Object.keys(PLATFORMS).length,
          capabilities: ['research', 'generate_listing', 'generate_pitch', 'launch_all'],
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        return new Response(JSON.stringify({ success: false, error: `Unknown command: ${command}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('Web3 Launch Engine Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

function getStrategy(platform: string, projectType: string): string {
  const strategies: Record<string, string> = {
    opensea: 'Launch collection with tiered membership NFTs. Set 7.5% royalties. Feature utility description prominently. Target "Memberships" category.',
    rarible: 'Mirror OpenSea collection. Enable community features. Leverage multi-chain for wider reach.',
    coinbase_nft: 'Deploy on Base for zero fees. Optimize for Coinbase Wallet users. Leverage Coinbase ecosystem.',
    zora: 'Launch open edition at protocol minimum (0.000777 ETH). 72-hour window creates urgency. Collectors earn Zora rewards.',
    mirror: 'Publish founding article with embedded funding. Write compelling narrative. NFT-gate premium content updates.',
    seedlist: 'Apply for community round. Prepare comprehensive pitch with tokenomics. Target crypto-native investors.',
    dao_maker: 'Apply for Strong Holder Offering. Need audit + KYC. Higher barrier but premium investor quality.',
    galxe: 'Create 5-quest genesis campaign. Social + on-chain tasks. OAT rewards drive engagement and proof-of-participation.',
    guild_xyz: 'Set up 5-tier guild matching NFT tiers. Token-gate premium channels. Discord integration required.',
    snapshot: 'Initialize governance space. NFT-weighted voting. Start with treasury allocation proposals.',
  };
  return strategies[platform] || 'Research and customize strategy for this platform.';
}
