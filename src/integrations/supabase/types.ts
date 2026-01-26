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
          agent_type: string
          created_at: string
          current_state: Json | null
          decision_history: Json | null
          id: string
          is_active: boolean | null
          last_decision_at: string | null
          learning_data: Json | null
          performance_score: number | null
          updated_at: string
        }
        Insert: {
          agent_name: string
          agent_type: string
          created_at?: string
          current_state?: Json | null
          decision_history?: Json | null
          id?: string
          is_active?: boolean | null
          last_decision_at?: string | null
          learning_data?: Json | null
          performance_score?: number | null
          updated_at?: string
        }
        Update: {
          agent_name?: string
          agent_type?: string
          created_at?: string
          current_state?: Json | null
          decision_history?: Json | null
          id?: string
          is_active?: boolean | null
          last_decision_at?: string | null
          learning_data?: Json | null
          performance_score?: number | null
          updated_at?: string
        }
        Relationships: []
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
