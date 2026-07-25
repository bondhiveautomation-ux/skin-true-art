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
      bm_brand_profiles: {
        Row: {
          ad_style: string | null
          avoid_phrases: Json | null
          brand_colors: Json | null
          cod_available: boolean | null
          common_tags: Json | null
          created_at: string
          currency: string | null
          custom_ai_instructions: string | null
          description: string | null
          emoji_density: string | null
          id: string
          is_default: boolean | null
          language_ratio: number | null
          logo_url: string | null
          name: string
          naming_style: string | null
          personality: string | null
          preferred_aesthetic: string | null
          preferred_dimensions: string | null
          preferred_language: string | null
          preorder_policy: string | null
          shipping_policy: string | null
          standard_cta: string | null
          standard_delivery_time: string | null
          target_country: string | null
          target_customer: string | null
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_style?: string | null
          avoid_phrases?: Json | null
          brand_colors?: Json | null
          cod_available?: boolean | null
          common_tags?: Json | null
          created_at?: string
          currency?: string | null
          custom_ai_instructions?: string | null
          description?: string | null
          emoji_density?: string | null
          id?: string
          is_default?: boolean | null
          language_ratio?: number | null
          logo_url?: string | null
          name: string
          naming_style?: string | null
          personality?: string | null
          preferred_aesthetic?: string | null
          preferred_dimensions?: string | null
          preferred_language?: string | null
          preorder_policy?: string | null
          shipping_policy?: string | null
          standard_cta?: string | null
          standard_delivery_time?: string | null
          target_country?: string | null
          target_customer?: string | null
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_style?: string | null
          avoid_phrases?: Json | null
          brand_colors?: Json | null
          cod_available?: boolean | null
          common_tags?: Json | null
          created_at?: string
          currency?: string | null
          custom_ai_instructions?: string | null
          description?: string | null
          emoji_density?: string | null
          id?: string
          is_default?: boolean | null
          language_ratio?: number | null
          logo_url?: string | null
          name?: string
          naming_style?: string | null
          personality?: string | null
          preferred_aesthetic?: string | null
          preferred_dimensions?: string | null
          preferred_language?: string | null
          preorder_policy?: string | null
          shipping_policy?: string | null
          standard_cta?: string | null
          standard_delivery_time?: string | null
          target_country?: string | null
          target_customer?: string | null
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bm_brand_templates: {
        Row: {
          created_at: string
          data: Json
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          data?: Json
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          data?: Json
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      bm_copy_sections: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_locked: boolean
          meta: Json | null
          project_id: string
          section_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_locked?: boolean
          meta?: Json | null
          project_id: string
          section_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_locked?: boolean
          meta?: Json | null
          project_id?: string
          section_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bm_copy_sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "bm_product_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bm_copy_versions: {
        Row: {
          content: string | null
          created_at: string
          id: string
          meta: Json | null
          section_id: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          meta?: Json | null
          section_id: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          meta?: Json | null
          section_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bm_copy_versions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "bm_copy_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      bm_creative_concepts: {
        Row: {
          created_at: string
          data: Json | null
          emotion: string | null
          id: string
          objection: string | null
          placement: string | null
          project_id: string
          purpose: string | null
          sort_order: number
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          emotion?: string | null
          id?: string
          objection?: string | null
          placement?: string | null
          project_id: string
          purpose?: string | null
          sort_order?: number
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          emotion?: string | null
          id?: string
          objection?: string | null
          placement?: string | null
          project_id?: string
          purpose?: string | null
          sort_order?: number
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bm_creative_concepts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "bm_product_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bm_creative_strategies: {
        Row: {
          created_at: string
          id: string
          project_id: string
          strategy: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          strategy?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          strategy?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bm_creative_strategies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "bm_product_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bm_generated_images: {
        Row: {
          created_at: string
          id: string
          is_final: boolean
          job_id: string | null
          project_id: string
          prompt_id: string | null
          public_url: string | null
          sort_order: number
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_final?: boolean
          job_id?: string | null
          project_id: string
          prompt_id?: string | null
          public_url?: string | null
          sort_order?: number
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_final?: boolean
          job_id?: string | null
          project_id?: string
          prompt_id?: string | null
          public_url?: string | null
          sort_order?: number
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bm_generated_images_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "bm_generation_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bm_generated_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "bm_product_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bm_generated_images_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "bm_image_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      bm_generation_jobs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          prompt_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          prompt_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          prompt_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bm_generation_jobs_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "bm_image_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      bm_image_prompts: {
        Row: {
          concept_id: string | null
          created_at: string
          format: string | null
          height: number | null
          id: string
          locks: Json | null
          project_id: string
          prompt_json: Json
          status: Database["public"]["Enums"]["bm_prompt_status"]
          title: string | null
          updated_at: string
          user_id: string
          width: number | null
        }
        Insert: {
          concept_id?: string | null
          created_at?: string
          format?: string | null
          height?: number | null
          id?: string
          locks?: Json | null
          project_id: string
          prompt_json?: Json
          status?: Database["public"]["Enums"]["bm_prompt_status"]
          title?: string | null
          updated_at?: string
          user_id: string
          width?: number | null
        }
        Update: {
          concept_id?: string | null
          created_at?: string
          format?: string | null
          height?: number | null
          id?: string
          locks?: Json | null
          project_id?: string
          prompt_json?: Json
          status?: Database["public"]["Enums"]["bm_prompt_status"]
          title?: string | null
          updated_at?: string
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bm_image_prompts_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "bm_creative_concepts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bm_image_prompts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "bm_product_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bm_name_options: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          is_locked: boolean
          is_selected: boolean
          name: string
          naming_style: string | null
          positioning: string | null
          project_id: string
          rationale: string | null
          subtitle: string | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          is_locked?: boolean
          is_selected?: boolean
          name: string
          naming_style?: string | null
          positioning?: string | null
          project_id: string
          rationale?: string | null
          subtitle?: string | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          is_locked?: boolean
          is_selected?: boolean
          name?: string
          naming_style?: string | null
          positioning?: string | null
          project_id?: string
          rationale?: string | null
          subtitle?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bm_name_options_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "bm_product_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bm_product_analysis: {
        Row: {
          analysis: Json
          confirmed_by_user: boolean
          created_at: string
          id: string
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis?: Json
          confirmed_by_user?: boolean
          created_at?: string
          id?: string
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis?: Json
          confirmed_by_user?: boolean
          created_at?: string
          id?: string
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bm_product_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "bm_product_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bm_product_assets: {
        Row: {
          created_at: string
          id: string
          label: string | null
          project_id: string
          public_url: string | null
          role: Database["public"]["Enums"]["bm_asset_role"]
          sort_order: number
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          project_id: string
          public_url?: string | null
          role?: Database["public"]["Enums"]["bm_asset_role"]
          sort_order?: number
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          project_id?: string
          public_url?: string | null
          role?: Database["public"]["Enums"]["bm_asset_role"]
          sort_order?: number
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bm_product_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "bm_product_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bm_product_packages: {
        Row: {
          created_at: string
          id: string
          project_id: string
          snapshot: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          snapshot?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          snapshot?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bm_product_packages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "bm_product_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      bm_product_projects: {
        Row: {
          advance_payment: string | null
          brand_id: string | null
          category: string | null
          cod_available: boolean | null
          colors: Json | null
          competitor_info: string | null
          completion_pct: number
          created_at: string
          currency: string | null
          current_step: number
          delivery_time: string | null
          dimensions: string | null
          fabric_composition: string | null
          features: Json | null
          id: string
          landed_cost: number | null
          material: string | null
          positioning: string | null
          preorder: boolean | null
          product_type: string | null
          raw_title: string | null
          selling_price: number | null
          sizes: Json | null
          special_instructions: string | null
          status: Database["public"]["Enums"]["bm_project_status"]
          supplier_description: string | null
          target_age: string | null
          target_customer: string | null
          target_market: string | null
          title: string
          updated_at: string
          user_id: string
          user_notes: string | null
          weight_range: string | null
        }
        Insert: {
          advance_payment?: string | null
          brand_id?: string | null
          category?: string | null
          cod_available?: boolean | null
          colors?: Json | null
          competitor_info?: string | null
          completion_pct?: number
          created_at?: string
          currency?: string | null
          current_step?: number
          delivery_time?: string | null
          dimensions?: string | null
          fabric_composition?: string | null
          features?: Json | null
          id?: string
          landed_cost?: number | null
          material?: string | null
          positioning?: string | null
          preorder?: boolean | null
          product_type?: string | null
          raw_title?: string | null
          selling_price?: number | null
          sizes?: Json | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["bm_project_status"]
          supplier_description?: string | null
          target_age?: string | null
          target_customer?: string | null
          target_market?: string | null
          title?: string
          updated_at?: string
          user_id: string
          user_notes?: string | null
          weight_range?: string | null
        }
        Update: {
          advance_payment?: string | null
          brand_id?: string | null
          category?: string | null
          cod_available?: boolean | null
          colors?: Json | null
          competitor_info?: string | null
          completion_pct?: number
          created_at?: string
          currency?: string | null
          current_step?: number
          delivery_time?: string | null
          dimensions?: string | null
          fabric_composition?: string | null
          features?: Json | null
          id?: string
          landed_cost?: number | null
          material?: string | null
          positioning?: string | null
          preorder?: boolean | null
          product_type?: string | null
          raw_title?: string | null
          selling_price?: number | null
          sizes?: Json | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["bm_project_status"]
          supplier_description?: string | null
          target_age?: string | null
          target_customer?: string | null
          target_market?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          user_notes?: string | null
          weight_range?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bm_product_projects_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "bm_brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bm_prompt_presets: {
        Row: {
          category: string | null
          created_at: string
          data: Json
          id: string
          is_system: boolean
          name: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          data?: Json
          id?: string
          is_system?: boolean
          name: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          data?: Json
          id?: string
          is_system?: boolean
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bm_prompt_versions: {
        Row: {
          created_at: string
          id: string
          prompt_id: string
          prompt_json: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt_id: string
          prompt_json?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt_id?: string
          prompt_json?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bm_prompt_versions_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "bm_image_prompts"
            referencedColumns: ["id"]
          },
        ]
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
      landing_examples: {
        Row: {
          category_key: string
          category_name: string
          category_name_bn: string
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          updated_at: string
        }
        Insert: {
          category_key: string
          category_name: string
          category_name_bn: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          category_key?: string
          category_name?: string
          category_name_bn?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      logo_generations: {
        Row: {
          brand_name: string
          created_at: string
          id: string
          images_json: Json
          inputs_json: Json
          selected_image_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_name: string
          created_at?: string
          id?: string
          images_json?: Json
          inputs_json?: Json
          selected_image_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_name?: string
          created_at?: string
          id?: string
          images_json?: Json
          inputs_json?: Json
          selected_image_url?: string | null
          status?: string
          updated_at?: string
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
          department_id: string | null
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
          department_id?: string | null
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
          department_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "tool_configs_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "tool_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_departments: {
        Row: {
          bangla_name: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          bangla_name: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          bangla_name?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
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
      bm_asset_role:
        | "primary"
        | "additional"
        | "identity"
        | "garment"
        | "packaging"
        | "size_chart"
        | "other"
      bm_project_status: "draft" | "in_progress" | "completed" | "archived"
      bm_prompt_status:
        | "draft"
        | "needs_review"
        | "approved"
        | "generating"
        | "generated"
        | "revision_requested"
        | "final"
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
      bm_asset_role: [
        "primary",
        "additional",
        "identity",
        "garment",
        "packaging",
        "size_chart",
        "other",
      ],
      bm_project_status: ["draft", "in_progress", "completed", "archived"],
      bm_prompt_status: [
        "draft",
        "needs_review",
        "approved",
        "generating",
        "generated",
        "revision_requested",
        "final",
      ],
      lead_status: ["new", "contacted", "enrolled"],
      payment_status: ["pending", "approved", "rejected"],
    },
  },
} as const
