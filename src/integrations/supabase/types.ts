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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_messages: {
        Row: {
          created_at: string
          id: string
          is_from_admin: boolean
          is_read: boolean
          message: string
          sender_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_from_admin?: boolean
          is_read?: boolean
          message: string
          sender_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_from_admin?: boolean
          is_read?: boolean
          message?: string
          sender_id?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          category: string
          content: string | null
          created_at: string
          display_order: number
          excerpt: string
          icon: string | null
          id: string
          is_published: boolean
          read_time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content?: string | null
          created_at?: string
          display_order?: number
          excerpt: string
          icon?: string | null
          id?: string
          is_published?: boolean
          read_time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          display_order?: number
          excerpt?: string
          icon?: string | null
          id?: string
          is_published?: boolean
          read_time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          message: string
          payment_request_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message: string
          payment_request_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message?: string
          payment_request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "payment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      class_leads: {
        Row: {
          admin_notes: string | null
          business_category: string | null
          business_page_name: string
          created_at: string
          id: string
          monthly_ad_spend: string | null
          program: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          admin_notes?: string | null
          business_category?: string | null
          business_page_name: string
          created_at?: string
          id?: string
          monthly_ad_spend?: string | null
          program: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          whatsapp_number: string
        }
        Update: {
          admin_notes?: string | null
          business_category?: string | null
          business_page_name?: string
          created_at?: string
          id?: string
          monthly_ad_spend?: string | null
          program?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          badge_text: string
          bkash_number: string | null
          color_theme: string
          created_at: string
          cta_link: string | null
          cta_text: string
          cta_type: string
          days_online: string
          display_order: number
          duration_text: string
          features: Json
          hours: string
          icon_type: string
          id: string
          is_active: boolean
          is_popular: boolean
          price: number
          price_label: string
          support_text: string
          title: string
          updated_at: string
        }
        Insert: {
          badge_text?: string
          bkash_number?: string | null
          color_theme?: string
          created_at?: string
          cta_link?: string | null
          cta_text?: string
          cta_type?: string
          days_online?: string
          display_order?: number
          duration_text?: string
          features?: Json
          hours?: string
          icon_type?: string
          id?: string
          is_active?: boolean
          is_popular?: boolean
          price?: number
          price_label?: string
          support_text?: string
          title?: string
          updated_at?: string
        }
        Update: {
          badge_text?: string
          bkash_number?: string | null
          color_theme?: string
          created_at?: string
          cta_link?: string | null
          cta_text?: string
          cta_type?: string
          days_online?: string
          display_order?: number
          duration_text?: string
          features?: Json
          hours?: string
          icon_type?: string
          id?: string
          is_active?: boolean
          is_popular?: boolean
          price?: number
          price_label?: string
          support_text?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      classes_page_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          setting_key: string
          setting_value?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      dress_library: {
        Row: {
          category: string
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          name: string
          tags: string[] | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          name: string
          tags?: string[] | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          tags?: string[] | null
        }
        Relationships: []
      }
      feature_gem_costs: {
        Row: {
          category: string
          created_at: string
          feature_key: string
          feature_name: string
          gem_cost: number
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          feature_key: string
          feature_name: string
          gem_cost?: number
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          feature_key?: string
          feature_name?: string
          gem_cost?: number
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      gem_transactions: {
        Row: {
          created_at: string
          feature_used: string | null
          gems_amount: number
          gems_balance_after: number
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_used?: string | null
          gems_amount: number
          gems_balance_after: number
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          feature_used?: string | null
          gems_amount?: number
          gems_balance_after?: number
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      generation_counter_resets: {
        Row: {
          id: string
          note: string | null
          reset_at: string
          reset_by: string
        }
        Insert: {
          id?: string
          note?: string | null
          reset_at?: string
          reset_by: string
        }
        Update: {
          id?: string
          note?: string | null
          reset_at?: string
          reset_by?: string
        }
        Relationships: []
      }
      generation_history: {
        Row: {
          created_at: string
          feature_name: string
          id: string
          input_images: string[] | null
          output_images: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_name: string
          id?: string
          input_images?: string[] | null
          output_images?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          feature_name?: string
          id?: string
          input_images?: string[] | null
          output_images?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          credits: number
          id: string
          package_name: string
          status: Database["public"]["Enums"]["payment_status"]
          txid: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          credits: number
          id?: string
          package_name: string
          status?: Database["public"]["Enums"]["payment_status"]
          txid: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          credits?: number
          id?: string
          package_name?: string
          status?: Database["public"]["Enums"]["payment_status"]
          txid?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_config: {
        Row: {
          created_at: string
          display_order: number
          gems: number
          id: string
          is_active: boolean
          package_key: string
          package_name: string
          price_bdt: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          gems: number
          id?: string
          is_active?: boolean
          package_key: string
          package_name: string
          price_bdt: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          gems?: number
          id?: string
          is_active?: boolean
          package_key?: string
          package_name?: string
          price_bdt?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_blocked: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_blocked?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_blocked?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_key: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          section_key: string
          updated_at: string
          value: string
        }
        Insert: {
          content_key: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          section_key: string
          updated_at?: string
          value?: string
        }
        Update: {
          content_key?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          section_key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      tool_configs: {
        Row: {
          badge: string | null
          created_at: string
          description: string
          display_order: number
          id: string
          is_active: boolean
          long_description: string
          name: string
          preview_image_url: string | null
          short_name: string
          tool_id: string
          updated_at: string
        }
        Insert: {
          badge?: string | null
          created_at?: string
          description: string
          display_order?: number
          id?: string
          is_active?: boolean
          long_description: string
          name: string
          preview_image_url?: string | null
          short_name: string
          tool_id: string
          updated_at?: string
        }
        Update: {
          badge?: string | null
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          is_active?: boolean
          long_description?: string
          name?: string
          preview_image_url?: string | null
          short_name?: string
          tool_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          gems_balance: number
          id: string
          subscription_expires_at: string | null
          subscription_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gems_balance?: number
          id?: string
          subscription_expires_at?: string | null
          subscription_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gems_balance?: number
          id?: string
          subscription_expires_at?: string | null
          subscription_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          created_at: string
          current_page_name: string | null
          current_path: string | null
          current_tool: string | null
          device_type: string | null
          entered_at: string | null
          id: string
          is_online: boolean
          last_active_at: string
          last_seen: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_page_name?: string | null
          current_path?: string | null
          current_tool?: string | null
          device_type?: string | null
          entered_at?: string | null
          id?: string
          is_online?: boolean
          last_active_at?: string
          last_seen?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_page_name?: string | null
          current_path?: string | null
          current_tool?: string | null
          device_type?: string | null
          entered_at?: string | null
          id?: string
          is_online?: boolean
          last_active_at?: string
          last_seen?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_gems: {
        Args: {
          p_expires_at?: string
          p_gems: number
          p_subscription_type?: string
          p_transaction_type: string
          p_user_id: string
        }
        Returns: number
      }
      admin_clear_subscription: {
        Args: { p_admin_id: string; p_target_user_id: string }
        Returns: boolean
      }
      admin_delete_user: {
        Args: { p_admin_id: string; p_target_user_id: string }
        Returns: boolean
      }
      admin_set_subscription: {
        Args: {
          p_admin_id: string
          p_days: number
          p_subscription_type: string
          p_target_user_id: string
        }
        Returns: boolean
      }
      admin_toggle_block_user: {
        Args: {
          p_admin_id: string
          p_blocked: boolean
          p_target_user_id: string
        }
        Returns: boolean
      }
      admin_update_credits: {
        Args: {
          p_admin_id: string
          p_credits: number
          p_target_user_id: string
        }
        Returns: boolean
      }
      admin_update_gems: {
        Args: { p_admin_id: string; p_gems: number; p_target_user_id: string }
        Returns: boolean
      }
      approve_payment: {
        Args: { p_admin_id: string; p_request_id: string }
        Returns: boolean
      }
      check_duplicate_txid: { Args: { p_txid: string }; Returns: boolean }
      deduct_gems: {
        Args: { p_feature_name: string; p_gem_cost: number; p_user_id: string }
        Returns: number
      }
      get_user_gems: {
        Args: { p_user_id: string }
        Returns: {
          gems_balance: number
          subscription_expires_at: string
          subscription_type: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_generation:
        | {
            Args: { p_feature_name: string; p_user_id: string }
            Returns: undefined
          }
        | {
            Args: {
              p_feature_name: string
              p_input_images?: string[]
              p_output_images?: string[]
              p_user_id: string
            }
            Returns: string
          }
      reject_payment: {
        Args: { p_admin_id: string; p_notes?: string; p_request_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      lead_status: "new" | "contacted" | "enrolled"
      payment_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "user"],
      lead_status: ["new", "contacted", "enrolled"],
      payment_status: ["pending", "approved", "rejected"],
    },
  },
} as const
