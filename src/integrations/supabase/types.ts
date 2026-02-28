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
      contact_requests: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          message: string
          professional_id: string
          property_id: string | null
          rejection_reason: string | null
          service_type: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          message: string
          professional_id: string
          property_id?: string | null
          rejection_reason?: string | null
          service_type?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string
          professional_id?: string
          property_id?: string | null
          rejection_reason?: string | null
          service_type?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_requests_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          is_read_by_buyer: boolean | null
          is_read_by_seller: boolean | null
          last_message_at: string | null
          property_id: string
          seller_id: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          is_read_by_buyer?: boolean | null
          is_read_by_seller?: boolean | null
          last_message_at?: string | null
          property_id: string
          seller_id: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          is_read_by_buyer?: boolean | null
          is_read_by_seller?: boolean | null
          last_message_at?: string | null
          property_id?: string
          seller_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          recipient_email: string
          sent_at: string | null
          status: string
          template_data: Json
          template_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email: string
          sent_at?: string | null
          status?: string
          template_data?: Json
          template_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string
          template_data?: Json
          template_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          property_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          property_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          property_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_event_participants: {
        Row: {
          confirmation_status: string
          created_at: string
          event_id: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confirmation_status?: string
          created_at?: string
          event_id: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confirmation_status?: string
          created_at?: string
          event_id?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "professional_events"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          location: string | null
          property_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          event_date: string
          event_time?: string | null
          event_type: string
          id?: string
          location?: string | null
          property_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          location?: string | null
          property_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_events_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_legal_acceptances: {
        Row: {
          accepted_at: string
          autonomy_declaration_1_accepted: boolean
          autonomy_declaration_2_accepted: boolean
          category_selected: string
          created_at: string
          id: string
          insurance_declaration_accepted: boolean | null
          ip_address: string | null
          professional_id: string | null
          terms_accepted: boolean
          terms_version: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          autonomy_declaration_1_accepted?: boolean
          autonomy_declaration_2_accepted?: boolean
          category_selected: string
          created_at?: string
          id?: string
          insurance_declaration_accepted?: boolean | null
          ip_address?: string | null
          professional_id?: string | null
          terms_accepted?: boolean
          terms_version?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          autonomy_declaration_1_accepted?: boolean
          autonomy_declaration_2_accepted?: boolean
          category_selected?: string
          created_at?: string
          id?: string
          insurance_declaration_accepted?: boolean | null
          ip_address?: string | null
          professional_id?: string | null
          terms_accepted?: boolean
          terms_version?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_legal_acceptances_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_legal_acceptances_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_relationships: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          professional_id: string
          property_id: string | null
          relationship_type: string
          source_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          professional_id: string
          property_id?: string | null
          relationship_type: string
          source_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          professional_id?: string
          property_id?: string | null
          relationship_type?: string
          source_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_relationships_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_relationships_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_relationships_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          professional_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          professional_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          professional_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          email: string
          geographic_area: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          location: string | null
          name: string
          phone: string | null
          price_from: number
          profile_completed: boolean | null
          service_type: string
          specialization: string | null
          updated_at: string
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          email: string
          geographic_area?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          name: string
          phone?: string | null
          price_from: number
          profile_completed?: boolean | null
          service_type: string
          specialization?: string | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          email?: string
          geographic_area?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          name?: string
          phone?: string | null
          price_from?: number
          profile_completed?: boolean | null
          service_type?: string
          specialization?: string | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          chat_enabled: boolean | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          notification_settings: Json | null
          phone: string | null
          phone_verified: boolean | null
          phone_visible: boolean | null
          plan_type: string | null
          premium_until: string | null
          updated_at: string
        }
        Insert: {
          chat_enabled?: boolean | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          notification_settings?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          phone_visible?: boolean | null
          plan_type?: string | null
          premium_until?: string | null
          updated_at?: string
        }
        Update: {
          chat_enabled?: boolean | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          notification_settings?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          phone_visible?: boolean | null
          plan_type?: string | null
          premium_until?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          area: number
          bathrooms: number
          bedrooms: number
          condition: string | null
          created_at: string
          description: string | null
          documentation_level: string
          energy_certification: string | null
          favorites_count: number
          features: string[] | null
          floor: string | null
          gross_area: number | null
          has_ac: boolean | null
          has_central_heating: boolean | null
          has_elevator: boolean | null
          has_garage: boolean | null
          has_garden: boolean | null
          has_pool: boolean | null
          id: string
          image_url: string | null
          images: string[] | null
          inquiries_count: number
          location: string
          parking: number | null
          pets_allowed: boolean | null
          postal_code: string | null
          price: number
          property_type: string
          shares_count: number
          status: string
          title: string
          transaction_type: string | null
          updated_at: string
          user_id: string
          views_count: number
          virtual_tour_url: string | null
          wizard_step: number
          year_built: number | null
        }
        Insert: {
          address: string
          area?: number
          bathrooms?: number
          bedrooms?: number
          condition?: string | null
          created_at?: string
          description?: string | null
          documentation_level?: string
          energy_certification?: string | null
          favorites_count?: number
          features?: string[] | null
          floor?: string | null
          gross_area?: number | null
          has_ac?: boolean | null
          has_central_heating?: boolean | null
          has_elevator?: boolean | null
          has_garage?: boolean | null
          has_garden?: boolean | null
          has_pool?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          inquiries_count?: number
          location: string
          parking?: number | null
          pets_allowed?: boolean | null
          postal_code?: string | null
          price: number
          property_type?: string
          shares_count?: number
          status?: string
          title: string
          transaction_type?: string | null
          updated_at?: string
          user_id: string
          views_count?: number
          virtual_tour_url?: string | null
          wizard_step?: number
          year_built?: number | null
        }
        Update: {
          address?: string
          area?: number
          bathrooms?: number
          bedrooms?: number
          condition?: string | null
          created_at?: string
          description?: string | null
          documentation_level?: string
          energy_certification?: string | null
          favorites_count?: number
          features?: string[] | null
          floor?: string | null
          gross_area?: number | null
          has_ac?: boolean | null
          has_central_heating?: boolean | null
          has_elevator?: boolean | null
          has_garage?: boolean | null
          has_garden?: boolean | null
          has_pool?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          inquiries_count?: number
          location?: string
          parking?: number | null
          pets_allowed?: boolean | null
          postal_code?: string | null
          price?: number
          property_type?: string
          shares_count?: number
          status?: string
          title?: string
          transaction_type?: string | null
          updated_at?: string
          user_id?: string
          views_count?: number
          virtual_tour_url?: string | null
          wizard_step?: number
          year_built?: number | null
        }
        Relationships: []
      }
      property_addons: {
        Row: {
          addon_type: string
          created_at: string
          expires_at: string | null
          id: string
          property_id: string
        }
        Insert: {
          addon_type: string
          created_at?: string
          expires_at?: string | null
          id?: string
          property_id: string
        }
        Update: {
          addon_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_addons_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_proposals: {
        Row: {
          amount: number
          created_at: string
          deadline: string
          has_written_proposal: boolean
          id: string
          name: string
          notes: string | null
          property_id: string
          requires_financing: boolean
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          deadline: string
          has_written_proposal?: boolean
          id?: string
          name: string
          notes?: string | null
          property_id: string
          requires_financing?: boolean
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          deadline?: string
          has_written_proposal?: boolean
          id?: string
          name?: string
          notes?: string | null
          property_id?: string
          requires_financing?: boolean
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_proposals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          notification_type: string
          phone: string
          related_id: string | null
          scheduled_for: string
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          notification_type: string
          phone: string
          related_id?: string | null
          scheduled_for: string
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          notification_type?: string
          phone?: string
          related_id?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_legal_acceptances: {
        Row: {
          accepted_at: string
          created_at: string
          id: string
          ip_address: string | null
          terms_version: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          terms_version?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          terms_version?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vault_access_requests: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          message: string | null
          payment_amount: number
          payment_status: string | null
          professional_id: string
          property_id: string | null
          rejection_reason: string | null
          requester_id: string
          status: string
          updated_at: string
          vault_document_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string | null
          payment_amount?: number
          payment_status?: string | null
          professional_id: string
          property_id?: string | null
          rejection_reason?: string | null
          requester_id: string
          status?: string
          updated_at?: string
          vault_document_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string | null
          payment_amount?: number
          payment_status?: string | null
          professional_id?: string
          property_id?: string | null
          rejection_reason?: string | null
          requester_id?: string
          status?: string
          updated_at?: string
          vault_document_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_access_requests_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_access_requests_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_buyer_access: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          message: string | null
          owner_id: string
          payment_amount: number
          payment_status: string | null
          property_id: string
          rejection_reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          message?: string | null
          owner_id: string
          payment_amount?: number
          payment_status?: string | null
          property_id: string
          rejection_reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          message?: string | null
          owner_id?: string
          payment_amount?: number
          payment_status?: string | null
          property_id?: string
          rejection_reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_buyer_access_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_consent_acceptances: {
        Row: {
          accepted_at: string
          created_at: string
          declaration_access_responsibility_accepted: boolean
          declaration_no_validation_accepted: boolean
          declaration_professional_validation_accepted: boolean
          declaration_responsibility_accepted: boolean
          declaration_terms_accepted: boolean
          id: string
          ip_address: string | null
          property_id: string | null
          terms_version: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          declaration_access_responsibility_accepted?: boolean
          declaration_no_validation_accepted?: boolean
          declaration_professional_validation_accepted?: boolean
          declaration_responsibility_accepted?: boolean
          declaration_terms_accepted?: boolean
          id?: string
          ip_address?: string | null
          property_id?: string | null
          terms_version?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          created_at?: string
          declaration_access_responsibility_accepted?: boolean
          declaration_no_validation_accepted?: boolean
          declaration_professional_validation_accepted?: boolean
          declaration_responsibility_accepted?: boolean
          declaration_terms_accepted?: boolean
          id?: string
          ip_address?: string | null
          property_id?: string | null
          terms_version?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_consent_acceptances_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_documents: {
        Row: {
          created_at: string
          file_size: string | null
          file_type: string
          file_url: string
          id: string
          is_public: boolean
          name: string
          property_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_size?: string | null
          file_type: string
          file_url: string
          id?: string
          is_public?: boolean
          name: string
          property_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_size?: string | null
          file_type?: string
          file_url?: string
          id?: string
          is_public?: boolean
          name?: string
          property_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_availability: {
        Row: {
          available_date: string
          created_at: string
          id: string
          property_id: string
          seller_id: string
          time_slots: string[]
          updated_at: string
        }
        Insert: {
          available_date: string
          created_at?: string
          id?: string
          property_id: string
          seller_id: string
          time_slots?: string[]
          updated_at?: string
        }
        Update: {
          available_date?: string
          created_at?: string
          id?: string
          property_id?: string
          seller_id?: string
          time_slots?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_bookings: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          property_id: string
          scheduled_date: string
          scheduled_time: string
          seller_id: string
          status: string
          updated_at: string
          visitor_email: string | null
          visitor_id: string
          visitor_name: string
          visitor_phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          property_id: string
          scheduled_date: string
          scheduled_time: string
          seller_id: string
          status?: string
          updated_at?: string
          visitor_email?: string | null
          visitor_id: string
          visitor_name: string
          visitor_phone: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          property_id?: string
          scheduled_date?: string
          scheduled_time?: string
          seller_id?: string
          status?: string
          updated_at?: string
          visitor_email?: string | null
          visitor_id?: string
          visitor_name?: string
          visitor_phone?: string
        }
        Relationships: []
      }
    }
    Views: {
      professionals_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          category: Database["public"]["Enums"]["service_category"] | null
          created_at: string | null
          id: string | null
          is_active: boolean | null
          is_verified: boolean | null
          location: string | null
          name: string | null
          price_from: number | null
          profile_completed: boolean | null
          service_type: string | null
          specialization: string | null
          updated_at: string | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          category?: Database["public"]["Enums"]["service_category"] | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          name?: string | null
          price_from?: number | null
          profile_completed?: boolean | null
          service_type?: string | null
          specialization?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          category?: Database["public"]["Enums"]["service_category"] | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          name?: string | null
          price_from?: number | null
          profile_completed?: boolean | null
          service_type?: string | null
          specialization?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      are_co_participants: {
        Args: { user1_uid: string; user2_uid: string }
        Returns: boolean
      }
      check_notification_preference: {
        Args: { setting_key: string; user_id: string }
        Returns: boolean
      }
      get_participant_event_ids: {
        Args: { check_user_id: string }
        Returns: string[]
      }
      get_professional_contact: { Args: { prof_id: string }; Returns: Json }
      get_user_event_ids: { Args: { check_user_id: string } tracker: string[] }
      is_event_creator_of: {
        Args: { creator_uid: string; participant_uid: string }
        Returns: boolean
      }
      is_event_participant: {
        Args: { check_event_id: string; check_user_id: string }
        Returns: boolean
      }
      track_property_share: {
        Args: { property_uuid: string }
        Returns: undefined
      }
      track_property_view: {
        Args: { property_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      service_category: "juridico" | "financeiro" | "tecnico" | "marketing"
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
      service_category: ["juridico", "financeiro", "tecnico", "marketing"],
    },
  },
} as const
