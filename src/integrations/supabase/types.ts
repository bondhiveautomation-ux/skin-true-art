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
      admin_delete_user: {
        Args: { p_admin_id: string; p_target_user_id: string }
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
