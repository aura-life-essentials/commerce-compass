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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
