export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_brains: {
        Row: {
          agent_name: string
          agent_role: string | null
          agent_type: string
          brain_template: string | null
          created_at: string
          current_state: Json | null
          decision_history: Json | null
          id: string
          is_active: boolean | null
          last_decision_at: string | null
          learning_data: Json | null
          performance_score: number | null
          revenue_generated: number | null
          tasks_completed: number | null
          team_id: string | null
          updated_at: string
        }
        Insert: {
          agent_name: string
          agent_role?: string | null
          agent_type: string
          brain_template?: string | null
          created_at?: string
          current_state?: Json | null
          decision_history?: Json | null
          id?: string
          is_active?: boolean | null
          last_decision_at?: string | null
          learning_data?: Json | null
          performance_score?: number | null
          revenue_generated?: number | null
          tasks_completed?: number | null
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_name?: string
          agent_role?: string | null
          agent_type?: string
          brain_template?: string | null
          created_at?: string
          current_state?: Json | null
          decision_history?: Json | null
          id?: string
          is_active?: boolean | null
          last_decision_at?: string | null
          learning_data?: Json | null
          performance_score?: number | null
          revenue_generated?: number | null
          tasks_completed?: number | null
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_brains_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "agent_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_conversations: {
        Row: {
          agent_name: string
          agent_role: string
          channel: string | null
          contact_email: string | null
          contact_id: string | null
          contact_name: string | null
          contact_type: string | null
          conversation_type: string | null
          created_at: string
          deal_id: string | null
          ended_at: string | null
          id: string
          intent: string | null
          is_active: boolean | null
          messages: Json | null
          metadata: Json | null
          outcome: string | null
          platform: string | null
          revenue_generated: number | null
          sentiment: string | null
          started_at: string | null
          subject: string | null
        }
        Insert: {
          agent_name: string
          agent_role: string
          channel?: string | null
          contact_email?: string | null
          contact_id?: string | null
          contact_name?: string | null
          contact_type?: string | null
          conversation_type?: string | null
          created_at?: string
          deal_id?: string | null
          ended_at?: string | null
          id?: string
          intent?: string | null
          is_active?: boolean | null
          messages?: Json | null
          metadata?: Json | null
          outcome?: string | null
          platform?: string | null
          revenue_generated?: number | null
          sentiment?: string | null
          started_at?: string | null
          subject?: string | null
        }
        Update: {
          agent_name?: string
          agent_role?: string
          channel?: string | null
          contact_email?: string | null
          contact_id?: string | null
          contact_name?: string | null
          contact_type?: string | null
          conversation_type?: string | null
          created_at?: string
          deal_id?: string | null
          ended_at?: string | null
          id?: string
          intent?: string | null
          is_active?: boolean | null
          messages?: Json | null
          metadata?: Json | null
          outcome?: string | null
          platform?: string | null
          revenue_generated?: number | null
          sentiment?: string | null
          started_at?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_conversations_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "wholesale_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_logs: {
        Row: {
          action: string
          agent_name: string
          agent_role: string
          created_at: string
          details: Json | null
          duration_ms: number | null
          error_message: string | null
          id: string
          status: string | null
          store_id: string | null
        }
        Insert: {
          action: string
          agent_name: string
          agent_role: string
          created_at?: string
          details?: Json | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          status?: string | null
          store_id?: string | null
        }
        Update: {
          action?: string
          agent_name?: string
          agent_role?: string
          created_at?: string
          details?: Json | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          status?: string | null
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_logs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_teams: {
        Row: {
          campaigns_run: number | null
          created_at: string
          current_workflow: string | null
          deals_closed: number | null
          id: string
          is_active: boolean | null
          last_active_at: string | null
          niche: string
          performance_score: number | null
          team_name: string
          team_number: number
          team_type: string
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          campaigns_run?: number | null
          created_at?: string
          current_workflow?: string | null
          deals_closed?: number | null
          id?: string
          is_active?: boolean | null
          last_active_at?: string | null
          niche?: string
          performance_score?: number | null
          team_name: string
          team_number: number
          team_type?: string
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          campaigns_run?: number | null
          created_at?: string
          current_workflow?: string | null
          deals_closed?: number | null
          id?: string
          is_active?: boolean | null
          last_active_at?: string | null
          niche?: string
          performance_score?: number | null
          team_name?: string
          team_number?: number
          team_type?: string
          total_revenue?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_decisions: {
        Row: {
          agent_brain_id: string | null
          confidence_score: number | null
          created_at: string
          decision_type: string
          executed: boolean | null
          execution_result: Json | null
          id: string
          input_data: Json | null
          output_action: Json | null
          reasoning: string | null
          revenue_impact: number | null
        }
        Insert: {
          agent_brain_id?: string | null
          confidence_score?: number | null
          created_at?: string
          decision_type: string
          executed?: boolean | null
          execution_result?: Json | null
          id?: string
          input_data?: Json | null
          output_action?: Json | null
          reasoning?: string | null
          revenue_impact?: number | null
        }
        Update: {
          agent_brain_id?: string | null
          confidence_score?: number | null
          created_at?: string
          decision_type?: string
          executed?: boolean | null
          execution_result?: Json | null
          id?: string
          input_data?: Json | null
          output_action?: Json | null
          reasoning?: string | null
          revenue_impact?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_decisions_agent_brain_id_fkey"
            columns: ["agent_brain_id"]
            isOneToOne: false
            referencedRelation: "agent_brains"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_name: string
          event_type: string
          id: string
          ip_country: string | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_name: string
          event_type: string
          id?: string
          ip_country?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_name?: string
          event_type?: string
          id?: string
          ip_country?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      business_contacts: {
        Row: {
          address: Json | null
          assigned_agent: string | null
          company_name: string
          company_size: string | null
          contact_name: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          industry: string | null
          last_contacted_at: string | null
          lead_score: number | null
          metadata: Json | null
          notes: string | null
          phone: string | null
          region: string | null
          source: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: Json | null
          assigned_agent?: string | null
          company_name: string
          company_size?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          last_contacted_at?: string | null
          lead_score?: number | null
          metadata?: Json | null
          notes?: string | null
          phone?: string | null
          region?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: Json | null
          assigned_agent?: string | null
          company_name?: string
          company_size?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          last_contacted_at?: string | null
          lead_score?: number | null
          metadata?: Json | null
          notes?: string | null
          phone?: string | null
          region?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      content_pipeline: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          platform: string
          post_id: string | null
          post_url: string | null
          product_data: Json | null
          product_name: string
          script: string | null
          source: string
          stage: string
          status: string
          thumbnail_url: string | null
          updated_at: string
          video_request_id: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          platform?: string
          post_id?: string | null
          post_url?: string | null
          product_data?: Json | null
          product_name: string
          script?: string | null
          source?: string
          stage?: string
          status?: string
          thumbnail_url?: string | null
          updated_at?: string
          video_request_id?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          platform?: string
          post_id?: string | null
          post_url?: string | null
          product_data?: Json | null
          product_name?: string
          script?: string | null
          source?: string
          stage?: string
          status?: string
          thumbnail_url?: string | null
          updated_at?: string
          video_request_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      crypto_transactions: {
        Row: {
          amount: number
          block_number: number | null
          chain: string | null
          confirmed_at: string | null
          created_at: string
          from_wallet: string
          gas_fee: number | null
          id: string
          related_order_id: string | null
          related_project_id: string | null
          status: string | null
          to_wallet: string | null
          token: string
          tx_hash: string | null
          tx_type: string
          usd_value: number | null
        }
        Insert: {
          amount: number
          block_number?: number | null
          chain?: string | null
          confirmed_at?: string | null
          created_at?: string
          from_wallet: string
          gas_fee?: number | null
          id?: string
          related_order_id?: string | null
          related_project_id?: string | null
          status?: string | null
          to_wallet?: string | null
          token?: string
          tx_hash?: string | null
          tx_type: string
          usd_value?: number | null
        }
        Update: {
          amount?: number
          block_number?: number | null
          chain?: string | null
          confirmed_at?: string | null
          created_at?: string
          from_wallet?: string
          gas_fee?: number | null
          id?: string
          related_order_id?: string | null
          related_project_id?: string | null
          status?: string | null
          to_wallet?: string | null
          token?: string
          tx_hash?: string | null
          tx_type?: string
          usd_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crypto_transactions_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crypto_transactions_related_project_id_fkey"
            columns: ["related_project_id"]
            isOneToOne: false
            referencedRelation: "dao_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_segments: {
        Row: {
          automation_rules: Json | null
          avg_order_value: number | null
          created_at: string
          criteria: Json
          customer_count: number | null
          description: string | null
          id: string
          is_dynamic: boolean | null
          segment_name: string
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          automation_rules?: Json | null
          avg_order_value?: number | null
          created_at?: string
          criteria?: Json
          customer_count?: number | null
          description?: string | null
          id?: string
          is_dynamic?: boolean | null
          segment_name: string
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          automation_rules?: Json | null
          avg_order_value?: number | null
          created_at?: string
          criteria?: Json
          customer_count?: number | null
          description?: string | null
          id?: string
          is_dynamic?: boolean | null
          segment_name?: string
          total_revenue?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      dao_projects: {
        Row: {
          banner_image: string | null
          created_at: string
          creator_user_id: string | null
          creator_wallet: string
          current_funding_eth: number
          description: string | null
          equity_pool_percent: number
          funding_deadline: string | null
          funding_goal_eth: number
          id: string
          launched_at: string | null
          max_contribution_eth: number | null
          min_contribution_eth: number | null
          project_name: string
          project_type: string
          proposal_id: string | null
          roadmap: Json | null
          status: string | null
          team: Json | null
          total_backers: number | null
        }
        Insert: {
          banner_image?: string | null
          created_at?: string
          creator_user_id?: string | null
          creator_wallet: string
          current_funding_eth?: number
          description?: string | null
          equity_pool_percent?: number
          funding_deadline?: string | null
          funding_goal_eth: number
          id?: string
          launched_at?: string | null
          max_contribution_eth?: number | null
          min_contribution_eth?: number | null
          project_name: string
          project_type: string
          proposal_id?: string | null
          roadmap?: Json | null
          status?: string | null
          team?: Json | null
          total_backers?: number | null
        }
        Update: {
          banner_image?: string | null
          created_at?: string
          creator_user_id?: string | null
          creator_wallet?: string
          current_funding_eth?: number
          description?: string | null
          equity_pool_percent?: number
          funding_deadline?: string | null
          funding_goal_eth?: number
          id?: string
          launched_at?: string | null
          max_contribution_eth?: number | null
          min_contribution_eth?: number | null
          project_name?: string
          project_type?: string
          proposal_id?: string | null
          roadmap?: Json | null
          status?: string | null
          team?: Json | null
          total_backers?: number | null
        }
        Relationships: []
      }
      dao_proposals: {
        Row: {
          created_at: string
          description: string
          executed_at: string | null
          execution_data: Json | null
          id: string
          proposal_type: string
          proposer_user_id: string | null
          proposer_wallet: string
          quorum_required: number | null
          status: string | null
          title: string
          votes_against: number | null
          votes_for: number | null
          voting_ends_at: string
        }
        Insert: {
          created_at?: string
          description: string
          executed_at?: string | null
          execution_data?: Json | null
          id?: string
          proposal_type: string
          proposer_user_id?: string | null
          proposer_wallet: string
          quorum_required?: number | null
          status?: string | null
          title: string
          votes_against?: number | null
          votes_for?: number | null
          voting_ends_at: string
        }
        Update: {
          created_at?: string
          description?: string
          executed_at?: string | null
          execution_data?: Json | null
          id?: string
          proposal_type?: string
          proposer_user_id?: string | null
          proposer_wallet?: string
          quorum_required?: number | null
          status?: string | null
          title?: string
          votes_against?: number | null
          votes_for?: number | null
          voting_ends_at?: string
        }
        Relationships: []
      }
      dao_treasury: {
        Row: {
          eth_balance: number
          id: string
          revenue_share_percent: number | null
          token_balance: number
          total_value_usd: number
          treasury_name: string
          updated_at: string
          usdc_balance: number
        }
        Insert: {
          eth_balance?: number
          id?: string
          revenue_share_percent?: number | null
          token_balance?: number
          total_value_usd?: number
          treasury_name?: string
          updated_at?: string
          usdc_balance?: number
        }
        Update: {
          eth_balance?: number
          id?: string
          revenue_share_percent?: number | null
          token_balance?: number
          total_value_usd?: number
          treasury_name?: string
          updated_at?: string
          usdc_balance?: number
        }
        Relationships: []
      }
      dao_votes: {
        Row: {
          id: string
          proposal_id: string | null
          tx_hash: string | null
          vote_direction: string
          vote_power: number
          voted_at: string
          voter_user_id: string | null
          voter_wallet: string
        }
        Insert: {
          id?: string
          proposal_id?: string | null
          tx_hash?: string | null
          vote_direction: string
          vote_power: number
          voted_at?: string
          voter_user_id?: string | null
          voter_wallet: string
        }
        Update: {
          id?: string
          proposal_id?: string | null
          tx_hash?: string | null
          vote_direction?: string
          vote_power?: number
          voted_at?: string
          voter_user_id?: string | null
          voter_wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "dao_votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "dao_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          email_to: string
          email_type: string
          id: string
          metadata: Json | null
          sent_at: string | null
          status: string | null
          subject: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_to: string
          email_type: string
          id?: string
          metadata?: Json | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_to?: string
          email_type?: string
          id?: string
          metadata?: Json | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      global_markets: {
        Row: {
          country_code: string
          country_name: string
          created_at: string
          currency: string
          current_revenue: number | null
          id: string
          is_active: boolean | null
          language: string
          last_analyzed_at: string | null
          market_score: number | null
          potential_revenue: number | null
          region: string
          stores_count: number | null
        }
        Insert: {
          country_code: string
          country_name: string
          created_at?: string
          currency: string
          current_revenue?: number | null
          id?: string
          is_active?: boolean | null
          language: string
          last_analyzed_at?: string | null
          market_score?: number | null
          potential_revenue?: number | null
          region: string
          stores_count?: number | null
        }
        Update: {
          country_code?: string
          country_name?: string
          created_at?: string
          currency?: string
          current_revenue?: number | null
          id?: string
          is_active?: boolean | null
          language?: string
          last_analyzed_at?: string | null
          market_score?: number | null
          potential_revenue?: number | null
          region?: string
          stores_count?: number | null
        }
        Relationships: []
      }
      governance_events: {
        Row: {
          category: string
          created_at: string
          description: string
          event_type: string
          id: string
          metadata: Json | null
          resolved: boolean | null
          resolved_at: string | null
          severity: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          event_type: string
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
        }
        Relationships: []
      }
      industry_roadmaps: {
        Row: {
          assigned_agents: string[] | null
          client_user_id: string | null
          company_name: string | null
          created_at: string
          current_stage: string | null
          id: string
          industry: string
          milestones: Json | null
          projected_revenue_increase: number | null
          roadmap_data: Json | null
          status: string | null
          subscription_id: string | null
          updated_at: string
          web3_readiness_score: number | null
        }
        Insert: {
          assigned_agents?: string[] | null
          client_user_id?: string | null
          company_name?: string | null
          created_at?: string
          current_stage?: string | null
          id?: string
          industry: string
          milestones?: Json | null
          projected_revenue_increase?: number | null
          roadmap_data?: Json | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string
          web3_readiness_score?: number | null
        }
        Update: {
          assigned_agents?: string[] | null
          client_user_id?: string | null
          company_name?: string | null
          created_at?: string
          current_stage?: string | null
          id?: string
          industry?: string
          milestones?: Json | null
          projected_revenue_increase?: number | null
          roadmap_data?: Json | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string
          web3_readiness_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "industry_roadmaps_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          ai_generated_content: Json | null
          budget: number | null
          campaign_name: string
          channel: string
          created_at: string
          id: string
          performance_metrics: Json | null
          revenue_generated: number | null
          roi_percentage: number | null
          spent: number | null
          status: string | null
          store_id: string | null
          target_countries: string[] | null
          thumbnail_url: string | null
          updated_at: string
          video_script: string | null
          voiceover_url: string | null
        }
        Insert: {
          ai_generated_content?: Json | null
          budget?: number | null
          campaign_name: string
          channel: string
          created_at?: string
          id?: string
          performance_metrics?: Json | null
          revenue_generated?: number | null
          roi_percentage?: number | null
          spent?: number | null
          status?: string | null
          store_id?: string | null
          target_countries?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          video_script?: string | null
          voiceover_url?: string | null
        }
        Update: {
          ai_generated_content?: Json | null
          budget?: number | null
          campaign_name?: string
          channel?: string
          created_at?: string
          id?: string
          performance_metrics?: Json | null
          revenue_generated?: number | null
          roi_percentage?: number | null
          spent?: number | null
          status?: string | null
          store_id?: string | null
          target_countries?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          video_script?: string | null
          voiceover_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      metaverse_spaces: {
        Row: {
          access_level: string | null
          created_at: string
          current_visitors: number | null
          decoration_data: Json | null
          id: string
          is_live: boolean | null
          max_capacity: number | null
          owner_user_id: string | null
          owner_wallet: string | null
          position_data: Json | null
          required_nft_tier: string | null
          space_name: string
          space_type: string
        }
        Insert: {
          access_level?: string | null
          created_at?: string
          current_visitors?: number | null
          decoration_data?: Json | null
          id?: string
          is_live?: boolean | null
          max_capacity?: number | null
          owner_user_id?: string | null
          owner_wallet?: string | null
          position_data?: Json | null
          required_nft_tier?: string | null
          space_name: string
          space_type?: string
        }
        Update: {
          access_level?: string | null
          created_at?: string
          current_visitors?: number | null
          decoration_data?: Json | null
          id?: string
          is_live?: boolean | null
          max_capacity?: number | null
          owner_user_id?: string | null
          owner_wallet?: string | null
          position_data?: Json | null
          required_nft_tier?: string | null
          space_name?: string
          space_type?: string
        }
        Relationships: []
      }
      metaverse_visitors: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          id: string
          is_speaking: boolean | null
          joined_at: string
          last_active_at: string
          position: Json | null
          space_id: string | null
          visitor_user_id: string | null
          visitor_wallet: string | null
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          id?: string
          is_speaking?: boolean | null
          joined_at?: string
          last_active_at?: string
          position?: Json | null
          space_id?: string | null
          visitor_user_id?: string | null
          visitor_wallet?: string | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          id?: string
          is_speaking?: boolean | null
          joined_at?: string
          last_active_at?: string
          position?: Json | null
          space_id?: string | null
          visitor_user_id?: string | null
          visitor_wallet?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metaverse_visitors_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "metaverse_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_memberships: {
        Row: {
          benefits: Json | null
          contract_address: string
          id: string
          image_url: string | null
          is_listed: boolean | null
          list_price_eth: number | null
          metadata_uri: string | null
          minted_at: string
          owner_user_id: string | null
          owner_wallet: string
          price_eth: number | null
          royalty_percent: number | null
          tier: string
          token_id: string
          total_royalties_earned: number | null
        }
        Insert: {
          benefits?: Json | null
          contract_address: string
          id?: string
          image_url?: string | null
          is_listed?: boolean | null
          list_price_eth?: number | null
          metadata_uri?: string | null
          minted_at?: string
          owner_user_id?: string | null
          owner_wallet: string
          price_eth?: number | null
          royalty_percent?: number | null
          tier?: string
          token_id: string
          total_royalties_earned?: number | null
        }
        Update: {
          benefits?: Json | null
          contract_address?: string
          id?: string
          image_url?: string | null
          is_listed?: boolean | null
          list_price_eth?: number | null
          metadata_uri?: string | null
          minted_at?: string
          owner_user_id?: string | null
          owner_wallet?: string
          price_eth?: number | null
          royalty_percent?: number | null
          tier?: string
          token_id?: string
          total_royalties_earned?: number | null
        }
        Relationships: []
      }
      nft_royalty_payments: {
        Row: {
          created_at: string
          from_wallet: string
          id: string
          marketplace: string | null
          nft_id: string | null
          royalty_amount_eth: number
          sale_price_eth: number
          to_wallet: string
          tx_hash: string | null
        }
        Insert: {
          created_at?: string
          from_wallet: string
          id?: string
          marketplace?: string | null
          nft_id?: string | null
          royalty_amount_eth: number
          sale_price_eth: number
          to_wallet: string
          tx_hash?: string | null
        }
        Update: {
          created_at?: string
          from_wallet?: string
          id?: string
          marketplace?: string | null
          nft_id?: string | null
          royalty_amount_eth?: number
          sale_price_eth?: number
          to_wallet?: string
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nft_royalty_payments_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nft_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_subscription_passes: {
        Row: {
          auto_renew: boolean | null
          coinbase_url: string | null
          contract_address: string
          created_at: string
          expires_at: string | null
          id: string
          image_url: string | null
          is_listed: boolean | null
          list_price_eth: number | null
          marketplace: string | null
          metadata_uri: string | null
          minted_at: string
          opensea_url: string | null
          owner_user_id: string | null
          owner_wallet: string
          rarible_url: string | null
          tier: string
          token_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          coinbase_url?: string | null
          contract_address: string
          created_at?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_listed?: boolean | null
          list_price_eth?: number | null
          marketplace?: string | null
          metadata_uri?: string | null
          minted_at?: string
          opensea_url?: string | null
          owner_user_id?: string | null
          owner_wallet: string
          rarible_url?: string | null
          tier: string
          token_id: string
        }
        Update: {
          auto_renew?: boolean | null
          coinbase_url?: string | null
          contract_address?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_listed?: boolean | null
          list_price_eth?: number | null
          marketplace?: string | null
          metadata_uri?: string | null
          minted_at?: string
          opensea_url?: string | null
          owner_user_id?: string | null
          owner_wallet?: string
          rarible_url?: string | null
          tier?: string
          token_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          agent_name: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: string
        }
        Insert: {
          agent_name?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type: string
        }
        Update: {
          agent_name?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          currency: string | null
          customer_email: string
          customer_name: string | null
          customer_phone: string | null
          discount_amount: number | null
          fulfillment_status: string | null
          id: string
          items: Json
          metadata: Json | null
          notes: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          status: string | null
          store_id: string | null
          stripe_customer_id: string | null
          stripe_payment_id: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          currency?: string | null
          customer_email: string
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          fulfillment_status?: string | null
          id?: string
          items?: Json
          metadata?: Json | null
          notes?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string | null
          store_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          currency?: string | null
          customer_email?: string
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          fulfillment_status?: string | null
          id?: string
          items?: Json
          metadata?: Json | null
          notes?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string | null
          store_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      organic_campaigns: {
        Row: {
          assigned_agent: string | null
          campaign_name: string
          campaign_type: string
          content_strategy: Json | null
          created_at: string
          ended_at: string | null
          generated_content: Json | null
          id: string
          leads_generated: number | null
          metadata: Json | null
          posts_published: number | null
          posts_scheduled: number | null
          revenue_attributed: number | null
          started_at: string | null
          status: string | null
          target_markets: string[] | null
          target_platforms: string[] | null
          total_engagement: number | null
          total_reach: number | null
          updated_at: string
        }
        Insert: {
          assigned_agent?: string | null
          campaign_name: string
          campaign_type: string
          content_strategy?: Json | null
          created_at?: string
          ended_at?: string | null
          generated_content?: Json | null
          id?: string
          leads_generated?: number | null
          metadata?: Json | null
          posts_published?: number | null
          posts_scheduled?: number | null
          revenue_attributed?: number | null
          started_at?: string | null
          status?: string | null
          target_markets?: string[] | null
          target_platforms?: string[] | null
          total_engagement?: number | null
          total_reach?: number | null
          updated_at?: string
        }
        Update: {
          assigned_agent?: string | null
          campaign_name?: string
          campaign_type?: string
          content_strategy?: Json | null
          created_at?: string
          ended_at?: string | null
          generated_content?: Json | null
          id?: string
          leads_generated?: number | null
          metadata?: Json | null
          posts_published?: number | null
          posts_scheduled?: number | null
          revenue_attributed?: number | null
          started_at?: string | null
          status?: string | null
          target_markets?: string[] | null
          target_platforms?: string[] | null
          total_engagement?: number | null
          total_reach?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          compare_at_price: number | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          images: Json | null
          inventory_quantity: number | null
          price: number | null
          shopify_product_id: string | null
          status: string | null
          store_id: string
          tags: string[] | null
          title: string
          updated_at: string
          variants: Json | null
        }
        Insert: {
          category?: string | null
          compare_at_price?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          inventory_quantity?: number | null
          price?: number | null
          shopify_product_id?: string | null
          status?: string | null
          store_id: string
          tags?: string[] | null
          title: string
          updated_at?: string
          variants?: Json | null
        }
        Update: {
          category?: string | null
          compare_at_price?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          inventory_quantity?: number | null
          price?: number | null
          shopify_product_id?: string | null
          status?: string | null
          store_id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_contributions: {
        Row: {
          contributed_at: string
          contribution_eth: number
          contributor_user_id: string | null
          contributor_wallet: string
          equity_percent: number
          id: string
          is_active: boolean | null
          project_id: string | null
          rewards_claimed: number | null
          tx_hash: string | null
        }
        Insert: {
          contributed_at?: string
          contribution_eth: number
          contributor_user_id?: string | null
          contributor_wallet: string
          equity_percent: number
          id?: string
          is_active?: boolean | null
          project_id?: string | null
          rewards_claimed?: number | null
          tx_hash?: string | null
        }
        Update: {
          contributed_at?: string
          contribution_eth?: number
          contributor_user_id?: string | null
          contributor_wallet?: string
          equity_percent?: number
          id?: string
          is_active?: boolean | null
          project_id?: string | null
          rewards_claimed?: number | null
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_contributions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "dao_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          applicable_tiers: string[] | null
          code: string
          created_at: string
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          stripe_coupon_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_tiers?: string[] | null
          code: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          stripe_coupon_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_tiers?: string[] | null
          code?: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          stripe_coupon_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      revenue_metrics: {
        Row: {
          avg_order_value: number | null
          conversion_rate: number | null
          created_at: string
          date: string
          id: string
          orders_count: number | null
          organic_traffic: number | null
          paid_traffic: number | null
          revenue: number | null
          store_id: string
        }
        Insert: {
          avg_order_value?: number | null
          conversion_rate?: number | null
          created_at?: string
          date: string
          id?: string
          orders_count?: number | null
          organic_traffic?: number | null
          paid_traffic?: number | null
          revenue?: number | null
          store_id: string
        }
        Update: {
          avg_order_value?: number | null
          conversion_rate?: number | null
          created_at?: string
          date?: string
          id?: string
          orders_count?: number | null
          organic_traffic?: number | null
          paid_traffic?: number | null
          revenue?: number | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_metrics_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          ai_response: Json | null
          assigned_agent: string | null
          completed_at: string | null
          created_at: string
          id: string
          priority: string | null
          request_details: Json | null
          request_type: string
          status: string | null
          subscription_id: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          ai_response?: Json | null
          assigned_agent?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          priority?: string | null
          request_details?: Json | null
          request_type: string
          status?: string | null
          subscription_id?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          ai_response?: Json | null
          assigned_agent?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          priority?: string | null
          request_details?: Json | null
          request_type?: string
          status?: string | null
          subscription_id?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      staking_pools: {
        Row: {
          apy_percent: number
          created_at: string
          id: string
          is_active: boolean | null
          lock_period_days: number | null
          min_stake: number | null
          pool_name: string
          pool_type: string
          total_rewards_distributed: number
          total_staked: number
        }
        Insert: {
          apy_percent?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          lock_period_days?: number | null
          min_stake?: number | null
          pool_name: string
          pool_type?: string
          total_rewards_distributed?: number
          total_staked?: number
        }
        Update: {
          apy_percent?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          lock_period_days?: number | null
          min_stake?: number | null
          pool_name?: string
          pool_type?: string
          total_rewards_distributed?: number
          total_staked?: number
        }
        Relationships: []
      }
      stores: {
        Row: {
          created_at: string
          currency: string | null
          domain: string
          id: string
          last_synced_at: string | null
          locale: string | null
          name: string
          settings: Json | null
          shopify_store_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          domain: string
          id?: string
          last_synced_at?: string | null
          locale?: string | null
          name: string
          settings?: Json | null
          shopify_store_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          domain?: string
          id?: string
          last_synced_at?: string | null
          locale?: string | null
          name?: string
          settings?: Json | null
          shopify_store_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stripe_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          customer_country: string | null
          customer_email: string | null
          id: string
          metadata: Json | null
          product_ids: string[] | null
          status: string | null
          store_id: string | null
          stripe_customer_id: string | null
          stripe_payment_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          customer_country?: string | null
          customer_email?: string | null
          id?: string
          metadata?: Json | null
          product_ids?: string[] | null
          status?: string | null
          store_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          customer_country?: string | null
          customer_email?: string | null
          id?: string
          metadata?: Json | null
          product_ids?: string[] | null
          status?: string | null
          store_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_transactions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          nft_contract_address: string | null
          nft_token_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          nft_contract_address?: string | null
          nft_token_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          nft_contract_address?: string | null
          nft_token_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sync_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          job_type: string
          processed_items: number | null
          progress: number | null
          started_at: string | null
          status: string | null
          store_id: string
          total_items: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type: string
          processed_items?: number | null
          progress?: number | null
          started_at?: string | null
          status?: string | null
          store_id: string
          total_items?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type?: string
          processed_items?: number | null
          progress?: number | null
          started_at?: string | null
          status?: string | null
          store_id?: string
          total_items?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_jobs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      token_holdings: {
        Row: {
          governance_power: number
          id: string
          pending_rewards: number
          staked_balance: number
          token_balance: number
          total_earned: number
          updated_at: string
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          governance_power?: number
          id?: string
          pending_rewards?: number
          staked_balance?: number
          token_balance?: number
          total_earned?: number
          updated_at?: string
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          governance_power?: number
          id?: string
          pending_rewards?: number
          staked_balance?: number
          token_balance?: number
          total_earned?: number
          updated_at?: string
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      traffic_webhooks: {
        Row: {
          country: string | null
          created_at: string
          device: string | null
          id: string
          processed: boolean | null
          revenue: number | null
          source: string
          store_id: string | null
          utm_data: Json | null
          webhook_type: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          processed?: boolean | null
          revenue?: number | null
          source: string
          store_id?: string | null
          utm_data?: Json | null
          webhook_type: string
        }
        Update: {
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          processed?: boolean | null
          revenue?: number | null
          source?: string
          store_id?: string | null
          utm_data?: Json | null
          webhook_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "traffic_webhooks_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stakes: {
        Row: {
          accumulated_rewards: number | null
          id: string
          is_active: boolean | null
          last_claim_at: string | null
          nft_boost_percent: number | null
          pool_id: string | null
          staked_amount: number
          staked_at: string
          unlock_at: string | null
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          accumulated_rewards?: number | null
          id?: string
          is_active?: boolean | null
          last_claim_at?: string | null
          nft_boost_percent?: number | null
          pool_id?: string | null
          staked_amount: number
          staked_at?: string
          unlock_at?: string | null
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          accumulated_rewards?: number | null
          id?: string
          is_active?: boolean | null
          last_claim_at?: string | null
          nft_boost_percent?: number | null
          pool_id?: string | null
          staked_amount?: number
          staked_at?: string
          unlock_at?: string | null
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stakes_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "staking_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      viral_content: {
        Row: {
          analyzed_at: string | null
          audio_trends: Json | null
          comments: number | null
          content_type: string
          created_at: string
          engagement_score: number | null
          extracted_hooks: Json | null
          hashtags: string[] | null
          id: string
          likes: number | null
          platform: string
          shares: number | null
          source_url: string
          views: number | null
        }
        Insert: {
          analyzed_at?: string | null
          audio_trends?: Json | null
          comments?: number | null
          content_type: string
          created_at?: string
          engagement_score?: number | null
          extracted_hooks?: Json | null
          hashtags?: string[] | null
          id?: string
          likes?: number | null
          platform: string
          shares?: number | null
          source_url: string
          views?: number | null
        }
        Update: {
          analyzed_at?: string | null
          audio_trends?: Json | null
          comments?: number | null
          content_type?: string
          created_at?: string
          engagement_score?: number | null
          extracted_hooks?: Json | null
          hashtags?: string[] | null
          id?: string
          likes?: number | null
          platform?: string
          shares?: number | null
          source_url?: string
          views?: number | null
        }
        Relationships: []
      }
      wallet_connections: {
        Row: {
          chain: string
          connected_at: string
          ens_name: string | null
          id: string
          is_primary: boolean | null
          last_active_at: string | null
          metadata: Json | null
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          chain?: string
          connected_at?: string
          ens_name?: string | null
          id?: string
          is_primary?: boolean | null
          last_active_at?: string | null
          metadata?: Json | null
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          chain?: string
          connected_at?: string
          ens_name?: string | null
          id?: string
          is_primary?: boolean | null
          last_active_at?: string | null
          metadata?: Json | null
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      web3_revenue: {
        Row: {
          crypto_sales_eth: number | null
          crypto_sales_usd: number | null
          dao_fees_eth: number | null
          dao_fees_usd: number | null
          date: string
          id: string
          nft_royalties_eth: number | null
          nft_royalties_usd: number | null
          project_revenue_eth: number | null
          project_revenue_usd: number | null
          staking_fees_eth: number | null
          staking_fees_usd: number | null
          total_eth: number | null
          total_usd: number | null
        }
        Insert: {
          crypto_sales_eth?: number | null
          crypto_sales_usd?: number | null
          dao_fees_eth?: number | null
          dao_fees_usd?: number | null
          date: string
          id?: string
          nft_royalties_eth?: number | null
          nft_royalties_usd?: number | null
          project_revenue_eth?: number | null
          project_revenue_usd?: number | null
          staking_fees_eth?: number | null
          staking_fees_usd?: number | null
          total_eth?: number | null
          total_usd?: number | null
        }
        Update: {
          crypto_sales_eth?: number | null
          crypto_sales_usd?: number | null
          dao_fees_eth?: number | null
          dao_fees_usd?: number | null
          date?: string
          id?: string
          nft_royalties_eth?: number | null
          nft_royalties_usd?: number | null
          project_revenue_eth?: number | null
          project_revenue_usd?: number | null
          staking_fees_eth?: number | null
          staking_fees_usd?: number | null
          total_eth?: number | null
          total_usd?: number | null
        }
        Relationships: []
      }
      wholesale_deals: {
        Row: {
          actual_close_date: string | null
          assigned_agent: string | null
          business_contact_id: string | null
          contract_url: string | null
          created_at: string
          currency: string | null
          deal_name: string
          deal_value: number
          expected_close_date: string | null
          id: string
          margin_percentage: number | null
          negotiation_history: Json | null
          notes: string | null
          probability: number | null
          products: Json | null
          quantity_total: number | null
          stage: string | null
          status: string | null
          terms: Json | null
          updated_at: string
        }
        Insert: {
          actual_close_date?: string | null
          assigned_agent?: string | null
          business_contact_id?: string | null
          contract_url?: string | null
          created_at?: string
          currency?: string | null
          deal_name: string
          deal_value?: number
          expected_close_date?: string | null
          id?: string
          margin_percentage?: number | null
          negotiation_history?: Json | null
          notes?: string | null
          probability?: number | null
          products?: Json | null
          quantity_total?: number | null
          stage?: string | null
          status?: string | null
          terms?: Json | null
          updated_at?: string
        }
        Update: {
          actual_close_date?: string | null
          assigned_agent?: string | null
          business_contact_id?: string | null
          contract_url?: string | null
          created_at?: string
          currency?: string | null
          deal_name?: string
          deal_value?: number
          expected_close_date?: string | null
          id?: string
          margin_percentage?: number | null
          negotiation_history?: Json | null
          notes?: string | null
          probability?: number | null
          products?: Json | null
          quantity_total?: number | null
          stage?: string | null
          status?: string | null
          terms?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_deals_business_contact_id_fkey"
            columns: ["business_contact_id"]
            isOneToOne: false
            referencedRelation: "business_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          notify_on_sale: boolean | null
          product_id: string | null
          product_image: string | null
          product_price: number | null
          product_title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notify_on_sale?: boolean | null
          product_id?: string | null
          product_image?: string | null
          product_price?: number | null
          product_title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notify_on_sale?: boolean | null
          product_id?: string | null
          product_image?: string | null
          product_price?: number | null
          product_title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "moderator", "user"],
    },
  },
} as const
