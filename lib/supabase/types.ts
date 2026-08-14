export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          auth_user_id: string
          created_at: string
          email: string
          is_active: boolean
          role: string
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          email: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          email?: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      agreement_acceptance_evidence: {
        Row: {
          acceptance_id: string
          acceptance_statements: Json
          accepted_at: string
          accepted_by_auth_user_id: string
          accepting_role: string
          content_hash_accepted: string
          correlation_id: string | null
          created_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          acceptance_id: string
          acceptance_statements?: Json
          accepted_at?: string
          accepted_by_auth_user_id: string
          accepting_role: string
          content_hash_accepted: string
          correlation_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          acceptance_id?: string
          acceptance_statements?: Json
          accepted_at?: string
          accepted_by_auth_user_id?: string
          accepting_role?: string
          content_hash_accepted?: string
          correlation_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreement_acceptance_evidence_acceptance_id_fkey"
            columns: ["acceptance_id"]
            isOneToOne: false
            referencedRelation: "agreement_acceptances"
            referencedColumns: ["id"]
          },
        ]
      }
      agreement_acceptances: {
        Row: {
          acceptance_evidence: Json
          acceptance_method: string
          accepted_at: string
          accepted_by_auth_user_id: string | null
          agreement_version_id: string
          created_at: string
          id: string
          ip_address: string | null
          material_reacceptance: boolean
          partner_id: string
          user_agent: string | null
        }
        Insert: {
          acceptance_evidence?: Json
          acceptance_method?: string
          accepted_at?: string
          accepted_by_auth_user_id?: string | null
          agreement_version_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          material_reacceptance?: boolean
          partner_id: string
          user_agent?: string | null
        }
        Update: {
          acceptance_evidence?: Json
          acceptance_method?: string
          accepted_at?: string
          accepted_by_auth_user_id?: string | null
          agreement_version_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          material_reacceptance?: boolean
          partner_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreement_acceptances_agreement_version_id_fkey"
            columns: ["agreement_version_id"]
            isOneToOne: false
            referencedRelation: "agreement_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreement_acceptances_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      agreement_content: {
        Row: {
          agreement_version_id: string
          content_hash: string
          content_type: string
          created_at: string
          full_text: string
          id: string
          sections: Json
          summary: string
          updated_at: string
        }
        Insert: {
          agreement_version_id: string
          content_hash: string
          content_type?: string
          created_at?: string
          full_text: string
          id?: string
          sections?: Json
          summary?: string
          updated_at?: string
        }
        Update: {
          agreement_version_id?: string
          content_hash?: string
          content_type?: string
          created_at?: string
          full_text?: string
          id?: string
          sections?: Json
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agreement_content_agreement_version_id_fkey"
            columns: ["agreement_version_id"]
            isOneToOne: true
            referencedRelation: "agreement_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      agreement_requirement_assignments: {
        Row: {
          acceptance_deadline_at: string | null
          agreement_version_id: string
          assigned_at: string
          assigned_by_auth_user_id: string
          assignment_strategy: string
          created_at: string
          grace_end_at: string | null
          id: string
          partner_id: string | null
          state: string
          updated_at: string
          waived_reason: string | null
        }
        Insert: {
          acceptance_deadline_at?: string | null
          agreement_version_id: string
          assigned_at?: string
          assigned_by_auth_user_id: string
          assignment_strategy?: string
          created_at?: string
          grace_end_at?: string | null
          id?: string
          partner_id?: string | null
          state?: string
          updated_at?: string
          waived_reason?: string | null
        }
        Update: {
          acceptance_deadline_at?: string | null
          agreement_version_id?: string
          assigned_at?: string
          assigned_by_auth_user_id?: string
          assignment_strategy?: string
          created_at?: string
          grace_end_at?: string | null
          id?: string
          partner_id?: string | null
          state?: string
          updated_at?: string
          waived_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreement_requirement_assignments_agreement_version_id_fkey"
            columns: ["agreement_version_id"]
            isOneToOne: false
            referencedRelation: "agreement_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreement_requirement_assignments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      agreement_versions: {
        Row: {
          acceptance_deadline_days: number | null
          content_hash: string | null
          created_at: string
          document_url: string | null
          effective_at: string | null
          id: string
          material_change: boolean
          published_at: string | null
          published_by_auth_user_id: string | null
          slug: string
          status: string
          storage_path: string | null
          summary: string | null
          superseded_by_version_id: string | null
          title: string
          updated_at: string
          version_number: number
        }
        Insert: {
          acceptance_deadline_days?: number | null
          content_hash?: string | null
          created_at?: string
          document_url?: string | null
          effective_at?: string | null
          id?: string
          material_change?: boolean
          published_at?: string | null
          published_by_auth_user_id?: string | null
          slug: string
          status?: string
          storage_path?: string | null
          summary?: string | null
          superseded_by_version_id?: string | null
          title: string
          updated_at?: string
          version_number: number
        }
        Update: {
          acceptance_deadline_days?: number | null
          content_hash?: string | null
          created_at?: string
          document_url?: string | null
          effective_at?: string | null
          id?: string
          material_change?: boolean
          published_at?: string | null
          published_by_auth_user_id?: string | null
          slug?: string
          status?: string
          storage_path?: string | null
          summary?: string | null
          superseded_by_version_id?: string | null
          title?: string
          updated_at?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "agreement_versions_superseded_by_version_id_fkey"
            columns: ["superseded_by_version_id"]
            isOneToOne: false
            referencedRelation: "agreement_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_integrations: {
        Row: {
          created_at: string
          error_state: string | null
          external_property_id: string | null
          id: string
          last_synchronized_at: string | null
          partner_id: string
          property_id: string
          provider: string
          sync_status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          error_state?: string | null
          external_property_id?: string | null
          id?: string
          last_synchronized_at?: string | null
          partner_id: string
          property_id: string
          provider?: string
          sync_status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          error_state?: string | null
          external_property_id?: string | null
          id?: string
          last_synchronized_at?: string | null
          partner_id?: string
          property_id?: string
          provider?: string
          sync_status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_integrations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_integrations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_integrations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          adults: number
          booking_reference: string | null
          booking_status: string
          booking_total: number | null
          check_in: string
          check_out: string
          children: number
          commission_percent: number
          company_revenue: number | null
          contact_preference: string
          created_at: string
          guest_id: string
          id: string
          internal_notes: string | null
          nights: number | null
          partner_id: string | null
          partner_revenue: number | null
          payment_status: string
          property_id: string
          quote_currency: string | null
          quoted_amount: number | null
          room_id: string | null
          room_prepared: boolean
          selected_service_ids: string[]
          source: string
          special_requests: string | null
          taxes_fees: number
          updated_at: string
        }
        Insert: {
          adults?: number
          booking_reference?: string | null
          booking_status?: string
          booking_total?: number | null
          check_in: string
          check_out: string
          children?: number
          commission_percent?: number
          company_revenue?: number | null
          contact_preference?: string
          created_at?: string
          guest_id: string
          id?: string
          internal_notes?: string | null
          nights?: number | null
          partner_id?: string | null
          partner_revenue?: number | null
          payment_status?: string
          property_id: string
          quote_currency?: string | null
          quoted_amount?: number | null
          room_id?: string | null
          room_prepared?: boolean
          selected_service_ids?: string[]
          source?: string
          special_requests?: string | null
          taxes_fees?: number
          updated_at?: string
        }
        Update: {
          adults?: number
          booking_reference?: string | null
          booking_status?: string
          booking_total?: number | null
          check_in?: string
          check_out?: string
          children?: number
          commission_percent?: number
          company_revenue?: number | null
          contact_preference?: string
          created_at?: string
          guest_id?: string
          id?: string
          internal_notes?: string | null
          nights?: number | null
          partner_id?: string | null
          partner_revenue?: number | null
          payment_status?: string
          property_id?: string
          quote_currency?: string | null
          quoted_amount?: number | null
          room_id?: string | null
          room_prepared?: boolean
          selected_service_ids?: string[]
          source?: string
          special_requests?: string | null
          taxes_fees?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      business_media: {
        Row: {
          alt_text: string | null
          application_id: string | null
          business_id: string
          business_type: string
          caption: string | null
          created_at: string
          id: string
          is_cover: boolean
          is_featured: boolean
          is_public: boolean
          media_asset_id: string
          media_purpose: string
          partner_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          application_id?: string | null
          business_id: string
          business_type: string
          caption?: string | null
          created_at?: string
          id?: string
          is_cover?: boolean
          is_featured?: boolean
          is_public?: boolean
          media_asset_id: string
          media_purpose?: string
          partner_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          application_id?: string | null
          business_id?: string
          business_type?: string
          caption?: string | null
          created_at?: string
          id?: string
          is_cover?: boolean
          is_featured?: boolean
          is_public?: boolean
          media_asset_id?: string
          media_purpose?: string
          partner_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_media_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "public_property_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_media_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      business_onboarding_drafts: {
        Row: {
          business_type: string
          created_at: string
          current_step: string
          data: Json
          id: string
          listing_id: string | null
          owner_id: string
          owner_type: string
          status: string
          updated_at: string
        }
        Insert: {
          business_type?: string
          created_at?: string
          current_step?: string
          data?: Json
          id?: string
          listing_id?: string | null
          owner_id: string
          owner_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          business_type?: string
          created_at?: string
          current_step?: string
          data?: Json
          id?: string
          listing_id?: string | null
          owner_id?: string
          owner_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_notes: {
        Row: {
          author: string
          body: string
          created_at: string
          id: string
          partner_id: string | null
          updated_at: string
        }
        Insert: {
          author?: string
          body: string
          created_at?: string
          id?: string
          partner_id?: string | null
          updated_at?: string
        }
        Update: {
          author?: string
          body?: string
          created_at?: string
          id?: string
          partner_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_notes_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          owner: string | null
          partner_id: string | null
          priority: string
          status: string
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          owner?: string | null
          partner_id?: string | null
          priority?: string
          status?: string
          task_type: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          owner?: string | null
          partner_id?: string | null
          priority?: string
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          application_id: string | null
          category: string
          created_at: string
          description: string
          duration: string | null
          featured: boolean
          highlights: string[]
          id: string
          image_path: string
          partner_id: string | null
          price: string | null
          publication_status: string
          slug: string
          title: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          application_id?: string | null
          category: string
          created_at?: string
          description: string
          duration?: string | null
          featured?: boolean
          highlights?: string[]
          id?: string
          image_path: string
          partner_id?: string | null
          price?: string | null
          publication_status?: string
          slug: string
          title: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          application_id?: string | null
          category?: string
          created_at?: string
          description?: string
          duration?: string | null
          featured?: boolean
          highlights?: string[]
          id?: string
          image_path?: string
          partner_id?: string | null
          price?: string | null
          publication_status?: string
          slug?: string
          title?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          enabled: boolean
          flag_key: string
          id: string
          last_updated_by: string | null
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          description?: string | null
          enabled?: boolean
          flag_key: string
          id?: string
          last_updated_by?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          enabled?: boolean
          flag_key?: string
          id?: string
          last_updated_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      guests: {
        Row: {
          country: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          application_id: string | null
          archived: boolean
          caption: string | null
          category: string
          created_at: string
          file_type: string
          filename: string
          height: number | null
          id: string
          media_type: string | null
          partner_id: string | null
          path: string
          property_id: string | null
          rights_status: string
          room_id: string | null
          sort_order: number
          storage_bucket: string | null
          storage_path: string | null
          updated_at: string
          visibility: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          application_id?: string | null
          archived?: boolean
          caption?: string | null
          category: string
          created_at?: string
          file_type?: string
          filename: string
          height?: number | null
          id?: string
          media_type?: string | null
          partner_id?: string | null
          path: string
          property_id?: string | null
          rights_status?: string
          room_id?: string | null
          sort_order?: number
          storage_bucket?: string | null
          storage_path?: string | null
          updated_at?: string
          visibility?: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          application_id?: string | null
          archived?: boolean
          caption?: string | null
          category?: string
          created_at?: string
          file_type?: string
          filename?: string
          height?: number | null
          id?: string
          media_type?: string | null
          partner_id?: string | null
          path?: string
          property_id?: string | null
          rights_status?: string
          room_id?: string | null
          sort_order?: number
          storage_bucket?: string | null
          storage_path?: string | null
          updated_at?: string
          visibility?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          features: string[]
          id: string
          name: string
          price_label: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          features?: string[]
          id?: string
          name: string
          price_label: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          features?: string[]
          id?: string
          name?: string
          price_label?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_account_invitations: {
        Row: {
          accepted_at: string | null
          application_id: string | null
          auth_user_id: string | null
          created_at: string
          created_by: string | null
          delivery_attempted_at: string | null
          delivery_error: string | null
          email: string
          id: string
          idempotency_key: string
          invitation_url: string | null
          notes: string | null
          partner_id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          accepted_at?: string | null
          application_id?: string | null
          auth_user_id?: string | null
          created_at?: string
          created_by?: string | null
          delivery_attempted_at?: string | null
          delivery_error?: string | null
          email: string
          id?: string
          idempotency_key?: string
          invitation_url?: string | null
          notes?: string | null
          partner_id: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          accepted_at?: string | null
          application_id?: string | null
          auth_user_id?: string | null
          created_at?: string
          created_by?: string | null
          delivery_attempted_at?: string | null
          delivery_error?: string | null
          email?: string
          id?: string
          idempotency_key?: string
          invitation_url?: string | null
          notes?: string | null
          partner_id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_account_invitations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_account_invitations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_agreements: {
        Row: {
          acceptance_deadline_at: string | null
          accepted_at: string | null
          accepted_version_id: string | null
          created_at: string
          current_version_id: string | null
          grace_period_active: boolean
          id: string
          last_requirement_assignment_id: string | null
          partner_id: string
          reacceptance_triggered_at: string | null
          requirement_state: string
          requires_reacceptance: boolean
          updated_at: string
        }
        Insert: {
          acceptance_deadline_at?: string | null
          accepted_at?: string | null
          accepted_version_id?: string | null
          created_at?: string
          current_version_id?: string | null
          grace_period_active?: boolean
          id?: string
          last_requirement_assignment_id?: string | null
          partner_id: string
          reacceptance_triggered_at?: string | null
          requirement_state?: string
          requires_reacceptance?: boolean
          updated_at?: string
        }
        Update: {
          acceptance_deadline_at?: string | null
          accepted_at?: string | null
          accepted_version_id?: string | null
          created_at?: string
          current_version_id?: string | null
          grace_period_active?: boolean
          id?: string
          last_requirement_assignment_id?: string | null
          partner_id?: string
          reacceptance_triggered_at?: string | null
          requirement_state?: string
          requires_reacceptance?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_agreements_accepted_version_id_fkey"
            columns: ["accepted_version_id"]
            isOneToOne: false
            referencedRelation: "agreement_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_agreements_current_version_id_fkey"
            columns: ["current_version_id"]
            isOneToOne: false
            referencedRelation: "agreement_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_agreements_last_requirement_assignment_id_fkey"
            columns: ["last_requirement_assignment_id"]
            isOneToOne: false
            referencedRelation: "agreement_requirement_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_agreements_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: true
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_application_media: {
        Row: {
          admin_rights_confirmed: boolean
          application_id: string
          created_at: string
          file_name: string | null
          id: string
          label: string
          media_type: string
          path_or_note: string | null
          public_selected: boolean
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          admin_rights_confirmed?: boolean
          application_id: string
          created_at?: string
          file_name?: string | null
          id?: string
          label: string
          media_type: string
          path_or_note?: string | null
          public_selected?: boolean
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          admin_rights_confirmed?: boolean
          application_id?: string
          created_at?: string
          file_name?: string | null
          id?: string
          label?: string
          media_type?: string
          path_or_note?: string | null
          public_selected?: boolean
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_application_media_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_application_prices: {
        Row: {
          active: boolean
          application_id: string
          child_price: number | null
          created_at: string
          currency: string
          description: string | null
          id: string
          item_name: string
          notes: string | null
          price: number | null
          sort_order: number
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          application_id: string
          child_price?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          item_name: string
          notes?: string | null
          price?: number | null
          sort_order?: number
          unit: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          application_id?: string
          child_price?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          item_name?: string
          notes?: string | null
          price?: number | null
          sort_order?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_application_prices_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_application_review_versions: {
        Row: {
          application_id: string
          edited_at: string
          edited_by_name: string
          edited_by_user_id: string
          id: string
          original_values: Json
          reviewed_prices: Json
          reviewed_values: Json
          version: number
        }
        Insert: {
          application_id: string
          edited_at?: string
          edited_by_name: string
          edited_by_user_id: string
          id?: string
          original_values: Json
          reviewed_prices?: Json
          reviewed_values: Json
          version: number
        }
        Update: {
          application_id?: string
          edited_at?: string
          edited_by_name?: string
          edited_by_user_id?: string
          id?: string
          original_values?: Json
          reviewed_prices?: Json
          reviewed_values?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "partner_application_review_versions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_application_review_versions_edited_by_user_id_fkey"
            columns: ["edited_by_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["auth_user_id"]
          },
        ]
      }
      partner_application_services: {
        Row: {
          application_id: string
          created_at: string
          details: string | null
          id: string
          service_type: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          details?: string | null
          id?: string
          service_type: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          details?: string | null
          id?: string
          service_type?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_application_services_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_application_verification_documents: {
        Row: {
          admin_note: string | null
          application_id: string
          document_key: string
          document_label: string
          file_name: string | null
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          required: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          storage_bucket: string
          storage_path: string | null
          submitted_at: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          application_id: string
          document_key: string
          document_label: string
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          required?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_bucket?: string
          storage_path?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          application_id?: string
          document_key?: string
          document_label?: string
          file_name?: string | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          required?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_bucket?: string
          storage_path?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_application_verification_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_applications: {
        Row: {
          address: string | null
          application_reference: string | null
          approved_at: string | null
          approved_by_user_id: string | null
          business_name: string
          business_type: string
          contact_person: string
          email: string
          facebook: string | null
          google_maps_link: string | null
          id: string
          instagram: string | null
          island: string
          listing_id: string | null
          listing_type: string | null
          membership_plan: string
          metadata: Json
          missing_information: string[]
          notes: string | null
          partner_id: string | null
          property_id: string | null
          registration_number: string | null
          review_notes: string[]
          reviewed_at: string | null
          reviewed_by: string | null
          short_description: string
          status: string
          submitted_at: string
          updated_at: string
          website: string | null
          whatsapp: string
        }
        Insert: {
          address?: string | null
          application_reference?: string | null
          approved_at?: string | null
          approved_by_user_id?: string | null
          business_name: string
          business_type: string
          contact_person: string
          email: string
          facebook?: string | null
          google_maps_link?: string | null
          id?: string
          instagram?: string | null
          island?: string
          listing_id?: string | null
          listing_type?: string | null
          membership_plan?: string
          metadata?: Json
          missing_information?: string[]
          notes?: string | null
          partner_id?: string | null
          property_id?: string | null
          registration_number?: string | null
          review_notes?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          short_description: string
          status?: string
          submitted_at?: string
          updated_at?: string
          website?: string | null
          whatsapp: string
        }
        Update: {
          address?: string | null
          application_reference?: string | null
          approved_at?: string | null
          approved_by_user_id?: string | null
          business_name?: string
          business_type?: string
          contact_person?: string
          email?: string
          facebook?: string | null
          google_maps_link?: string | null
          id?: string
          instagram?: string | null
          island?: string
          listing_id?: string | null
          listing_type?: string | null
          membership_plan?: string
          metadata?: Json
          missing_information?: string[]
          notes?: string | null
          partner_id?: string | null
          property_id?: string | null
          registration_number?: string | null
          review_notes?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          short_description?: string
          status?: string
          submitted_at?: string
          updated_at?: string
          website?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_applications_approved_by_user_id_fkey"
            columns: ["approved_by_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["auth_user_id"]
          },
          {
            foreignKeyName: "partner_applications_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_audit_events: {
        Row: {
          auth_user_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json
          partner_id: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          partner_id?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          partner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_audit_events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_audit_log: {
        Row: {
          actor_auth_user_id: string | null
          actor_role: string | null
          after_payload: Json
          before_payload: Json
          correlation_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          occurred_at: string
          partner_id: string | null
          reason: string | null
          source: string
        }
        Insert: {
          actor_auth_user_id?: string | null
          actor_role?: string | null
          after_payload?: Json
          before_payload?: Json
          correlation_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          occurred_at?: string
          partner_id?: string | null
          reason?: string | null
          source?: string
        }
        Update: {
          actor_auth_user_id?: string | null
          actor_role?: string | null
          after_payload?: Json
          before_payload?: Json
          correlation_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          occurred_at?: string
          partner_id?: string | null
          reason?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_audit_log_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_change_requests: {
        Row: {
          change_type: string
          created_at: string
          id: string
          listing_id: string
          listing_type: string
          partner_id: string
          requested_by: string
          requested_values: Json
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          change_type: string
          created_at?: string
          id?: string
          listing_id: string
          listing_type: string
          partner_id: string
          requested_by: string
          requested_values: Json
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          change_type?: string
          created_at?: string
          id?: string
          listing_id?: string
          listing_type?: string
          partner_id?: string
          requested_by?: string
          requested_values?: Json
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_change_requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_documents: {
        Row: {
          admin_note: string | null
          category: string
          created_at: string
          document_key: string
          document_label: string
          expiry_date: string | null
          file_name: string | null
          id: string
          partner_id: string
          property_id: string | null
          required: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          storage_bucket: string
          storage_path: string | null
          updated_at: string
          uploaded_at: string | null
        }
        Insert: {
          admin_note?: string | null
          category?: string
          created_at?: string
          document_key: string
          document_label: string
          expiry_date?: string | null
          file_name?: string | null
          id?: string
          partner_id: string
          property_id?: string | null
          required?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_bucket?: string
          storage_path?: string | null
          updated_at?: string
          uploaded_at?: string | null
        }
        Update: {
          admin_note?: string | null
          category?: string
          created_at?: string
          document_key?: string
          document_label?: string
          expiry_date?: string | null
          file_name?: string | null
          id?: string
          partner_id?: string
          property_id?: string | null
          required?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_bucket?: string
          storage_path?: string | null
          updated_at?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_documents_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_lifecycles: {
        Row: {
          can_login: boolean
          can_manage_listings: boolean
          can_view_dashboard: boolean
          created_at: string
          editing_allowed: boolean
          financial_standing_state: string
          grace_period_active: boolean
          id: string
          last_transition_at: string | null
          last_transition_reason: string | null
          lifecycle_state: string
          partner_id: string
          publication_blocked_reason: string | null
          requires_action: boolean
          updated_at: string
        }
        Insert: {
          can_login?: boolean
          can_manage_listings?: boolean
          can_view_dashboard?: boolean
          created_at?: string
          editing_allowed?: boolean
          financial_standing_state?: string
          grace_period_active?: boolean
          id?: string
          last_transition_at?: string | null
          last_transition_reason?: string | null
          lifecycle_state?: string
          partner_id: string
          publication_blocked_reason?: string | null
          requires_action?: boolean
          updated_at?: string
        }
        Update: {
          can_login?: boolean
          can_manage_listings?: boolean
          can_view_dashboard?: boolean
          created_at?: string
          editing_allowed?: boolean
          financial_standing_state?: string
          grace_period_active?: boolean
          id?: string
          last_transition_at?: string | null
          last_transition_reason?: string | null
          lifecycle_state?: string
          partner_id?: string
          publication_blocked_reason?: string | null
          requires_action?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_lifecycles_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: true
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_media: {
        Row: {
          created_at: string
          media_asset_id: string
          partner_id: string
          sort_order: number
          usage: string
        }
        Insert: {
          created_at?: string
          media_asset_id: string
          partner_id: string
          sort_order?: number
          usage?: string
        }
        Update: {
          created_at?: string
          media_asset_id?: string
          partner_id?: string
          sort_order?: number
          usage?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "public_property_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_media_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_notifications: {
        Row: {
          action_href: string | null
          body: string
          created_at: string
          id: string
          notification_type: string
          partner_id: string
          read_at: string | null
          status: string
          title: string
        }
        Insert: {
          action_href?: string | null
          body: string
          created_at?: string
          id?: string
          notification_type?: string
          partner_id: string
          read_at?: string | null
          status?: string
          title: string
        }
        Update: {
          action_href?: string | null
          body?: string
          created_at?: string
          id?: string
          notification_type?: string
          partner_id?: string
          read_at?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_notifications_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_publication_eligibility: {
        Row: {
          created_at: string
          eligibility_state: string
          evaluated_at: string | null
          evaluated_by_admin_id: string | null
          id: string
          listing_id: string
          listing_type: string
          partner_id: string
          reason_code: string | null
          reason_details: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          eligibility_state?: string
          evaluated_at?: string | null
          evaluated_by_admin_id?: string | null
          id?: string
          listing_id: string
          listing_type: string
          partner_id: string
          reason_code?: string | null
          reason_details?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          eligibility_state?: string
          evaluated_at?: string | null
          evaluated_by_admin_id?: string | null
          id?: string
          listing_id?: string
          listing_type?: string
          partner_id?: string
          reason_code?: string | null
          reason_details?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_publication_eligibility_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_roles: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_system_role: boolean
          scope_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_system_role?: boolean
          scope_type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_system_role?: boolean
          scope_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_service_items: {
        Row: {
          active: boolean
          application_id: string | null
          child_price: number | null
          created_at: string
          currency: string
          description: string | null
          id: string
          metadata: Json
          notes: string | null
          partner_id: string | null
          price: number | null
          property_id: string | null
          public_visible: boolean
          service_type: string
          sort_order: number
          source_key: string | null
          title: string
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          application_id?: string | null
          child_price?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          partner_id?: string | null
          price?: number | null
          property_id?: string | null
          public_visible?: boolean
          service_type?: string
          sort_order?: number
          source_key?: string | null
          title: string
          unit?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          application_id?: string | null
          child_price?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          partner_id?: string | null
          price?: number | null
          property_id?: string | null
          public_visible?: boolean
          service_type?: string
          sort_order?: number
          source_key?: string | null
          title?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_service_items_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_service_items_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_service_items_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_service_items_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_subscription_events: {
        Row: {
          actor_auth_user_id: string | null
          created_at: string
          event_type: string
          id: string
          occurred_at: string
          payload: Json
          reason: string | null
          source: string
          subscription_id: string
        }
        Insert: {
          actor_auth_user_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          occurred_at?: string
          payload?: Json
          reason?: string | null
          source?: string
          subscription_id: string
        }
        Update: {
          actor_auth_user_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          occurred_at?: string
          payload?: Json
          reason?: string | null
          source?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_subscription_events_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "partner_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_subscriptions: {
        Row: {
          auto_renew: boolean
          billing_model: string
          complimentary_end_at: string | null
          complimentary_start_at: string | null
          created_at: string
          currency: string
          current_period_end_at: string | null
          current_period_start_at: string | null
          discount_percentage: number
          grace_end_at: string | null
          id: string
          next_billing_at: string | null
          normal_price_amount: number | null
          partner_id: string
          plan_id: string | null
          subscription_state: string
          updated_at: string
          waiver_applied: boolean
          waiver_reason: string | null
        }
        Insert: {
          auto_renew?: boolean
          billing_model?: string
          complimentary_end_at?: string | null
          complimentary_start_at?: string | null
          created_at?: string
          currency?: string
          current_period_end_at?: string | null
          current_period_start_at?: string | null
          discount_percentage?: number
          grace_end_at?: string | null
          id?: string
          next_billing_at?: string | null
          normal_price_amount?: number | null
          partner_id: string
          plan_id?: string | null
          subscription_state?: string
          updated_at?: string
          waiver_applied?: boolean
          waiver_reason?: string | null
        }
        Update: {
          auto_renew?: boolean
          billing_model?: string
          complimentary_end_at?: string | null
          complimentary_start_at?: string | null
          created_at?: string
          currency?: string
          current_period_end_at?: string | null
          current_period_start_at?: string | null
          discount_percentage?: number
          grace_end_at?: string | null
          id?: string
          next_billing_at?: string | null
          normal_price_amount?: number | null
          partner_id?: string
          plan_id?: string | null
          subscription_state?: string
          updated_at?: string
          waiver_applied?: boolean
          waiver_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_subscriptions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: true
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_user_roles: {
        Row: {
          active: boolean
          assigned_at: string
          assigned_by_admin_id: string | null
          auth_user_id: string
          created_at: string
          expires_at: string | null
          id: string
          partner_id: string | null
          reason: string | null
          revoked_at: string | null
          role_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          assigned_at?: string
          assigned_by_admin_id?: string | null
          auth_user_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          partner_id?: string | null
          reason?: string | null
          revoked_at?: string | null
          role_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          assigned_at?: string
          assigned_by_admin_id?: string | null
          auth_user_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          partner_id?: string | null
          reason?: string | null
          revoked_at?: string | null
          role_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_user_roles_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "partner_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_verifications: {
        Row: {
          created_at: string
          documents_complete: boolean
          documents_expired: boolean
          id: string
          last_checked_at: string | null
          partner_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by_admin_id: string | null
          updated_at: string
          verification_state: string
        }
        Insert: {
          created_at?: string
          documents_complete?: boolean
          documents_expired?: boolean
          id?: string
          last_checked_at?: string | null
          partner_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by_admin_id?: string | null
          updated_at?: string
          verification_state?: string
        }
        Update: {
          created_at?: string
          documents_complete?: boolean
          documents_expired?: boolean
          id?: string
          last_checked_at?: string | null
          partner_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by_admin_id?: string | null
          updated_at?: string
          verification_state?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_verifications_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: true
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          address: string | null
          application_id: string | null
          approved_at: string | null
          approved_by_user_id: string | null
          auth_user_id: string | null
          business_name: string
          category: string
          created_at: string
          editing_suspended: boolean
          email: string | null
          facebook: string | null
          full_description: string | null
          gallery_paths: string[]
          google_maps_link: string | null
          hero_image_path: string | null
          id: string
          instagram: string | null
          island: string | null
          latitude: number | null
          lead_source: string | null
          logo_path: string | null
          longitude: number | null
          membership_plan_id: string | null
          metadata: Json | null
          owner_name: string | null
          phone: string | null
          priority: string | null
          published_at: string | null
          registration_number: string | null
          short_description: string | null
          slug: string
          status: string
          updated_at: string
          verification_status: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          application_id?: string | null
          approved_at?: string | null
          approved_by_user_id?: string | null
          auth_user_id?: string | null
          business_name: string
          category: string
          created_at?: string
          editing_suspended?: boolean
          email?: string | null
          facebook?: string | null
          full_description?: string | null
          gallery_paths?: string[]
          google_maps_link?: string | null
          hero_image_path?: string | null
          id?: string
          instagram?: string | null
          island?: string | null
          latitude?: number | null
          lead_source?: string | null
          logo_path?: string | null
          longitude?: number | null
          membership_plan_id?: string | null
          metadata?: Json | null
          owner_name?: string | null
          phone?: string | null
          priority?: string | null
          published_at?: string | null
          registration_number?: string | null
          short_description?: string | null
          slug: string
          status?: string
          updated_at?: string
          verification_status?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          application_id?: string | null
          approved_at?: string | null
          approved_by_user_id?: string | null
          auth_user_id?: string | null
          business_name?: string
          category?: string
          created_at?: string
          editing_suspended?: boolean
          email?: string | null
          facebook?: string | null
          full_description?: string | null
          gallery_paths?: string[]
          google_maps_link?: string | null
          hero_image_path?: string | null
          id?: string
          instagram?: string | null
          island?: string | null
          latitude?: number | null
          lead_source?: string | null
          logo_path?: string | null
          longitude?: number | null
          membership_plan_id?: string | null
          metadata?: Json | null
          owner_name?: string | null
          phone?: string | null
          priority?: string | null
          published_at?: string | null
          registration_number?: string | null
          short_description?: string | null
          slug?: string
          status?: string
          updated_at?: string
          verification_status?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partners_approved_by_user_id_fkey"
            columns: ["approved_by_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["auth_user_id"]
          },
          {
            foreignKeyName: "partners_membership_plan_id_fkey"
            columns: ["membership_plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string | null
          amenities: string[]
          application_id: string | null
          approved_at: string | null
          approved_by_user_id: string | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          currency: string | null
          email: string | null
          featured: boolean
          full_description: string | null
          google_maps_link: string | null
          hero_image_path: string
          id: string
          island: string
          languages: string[]
          latitude: number | null
          logo_path: string | null
          longitude: number | null
          membership_plan_id: string | null
          metadata: Json
          name: string
          operating_hours: string | null
          partner_id: string | null
          phone: string | null
          policies: string[]
          publication_status: string
          published_at: string | null
          room_count: number | null
          seo_description: string | null
          seo_title: string | null
          short_description: string
          slug: string
          social_links: Json
          starting_price: number | null
          updated_at: string
          verification_status: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[]
          application_id?: string | null
          approved_at?: string | null
          approved_by_user_id?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          featured?: boolean
          full_description?: string | null
          google_maps_link?: string | null
          hero_image_path: string
          id?: string
          island?: string
          languages?: string[]
          latitude?: number | null
          logo_path?: string | null
          longitude?: number | null
          membership_plan_id?: string | null
          metadata?: Json
          name: string
          operating_hours?: string | null
          partner_id?: string | null
          phone?: string | null
          policies?: string[]
          publication_status?: string
          published_at?: string | null
          room_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description: string
          slug: string
          social_links?: Json
          starting_price?: number | null
          updated_at?: string
          verification_status?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[]
          application_id?: string | null
          approved_at?: string | null
          approved_by_user_id?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          featured?: boolean
          full_description?: string | null
          google_maps_link?: string | null
          hero_image_path?: string
          id?: string
          island?: string
          languages?: string[]
          latitude?: number | null
          logo_path?: string | null
          longitude?: number | null
          membership_plan_id?: string | null
          metadata?: Json
          name?: string
          operating_hours?: string | null
          partner_id?: string | null
          phone?: string | null
          policies?: string[]
          publication_status?: string
          published_at?: string | null
          room_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string
          slug?: string
          social_links?: Json
          starting_price?: number | null
          updated_at?: string
          verification_status?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_approved_by_user_id_fkey"
            columns: ["approved_by_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["auth_user_id"]
          },
          {
            foreignKeyName: "properties_membership_plan_id_fkey"
            columns: ["membership_plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      property_experiences: {
        Row: {
          created_at: string
          experience_id: string
          property_id: string
        }
        Insert: {
          created_at?: string
          experience_id: string
          property_id: string
        }
        Update: {
          created_at?: string
          experience_id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_experiences_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_experiences_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "public_experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_experiences_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_experiences_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_media: {
        Row: {
          created_at: string
          media_asset_id: string
          property_id: string
          sort_order: number
          usage: string
        }
        Insert: {
          created_at?: string
          media_asset_id: string
          property_id: string
          sort_order?: number
          usage?: string
        }
        Update: {
          created_at?: string
          media_asset_id?: string
          property_id?: string
          sort_order?: number
          usage?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "public_property_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_media_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_media_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_transfers: {
        Row: {
          created_at: string
          property_id: string
          transfer_id: string
        }
        Insert: {
          created_at?: string
          property_id: string
          transfer_id: string
        }
        Update: {
          created_at?: string
          property_id?: string
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_transfers_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_transfers_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_transfers_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "public_transfers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_transfers_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_menu_categories: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          name: string
          restaurant_id: string
          slug: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          name: string
          restaurant_id: string
          slug?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          restaurant_id?: string
          slug?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "public_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_menu_items: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          is_available: boolean
          is_public: boolean
          name: string
          price_mvr: number | null
          restaurant_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_available?: boolean
          is_public?: boolean
          name: string
          price_mvr?: number | null
          restaurant_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_available?: boolean
          is_public?: boolean
          name?: string
          price_mvr?: number | null
          restaurant_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "restaurant_menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "public_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          application_id: string | null
          created_at: string
          cuisine: string[]
          description: string
          email: string | null
          facebook: string | null
          featured: boolean
          id: string
          image_path: string
          instagram: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          membership_plan_id: string | null
          name: string
          opening_hours: string | null
          partner_id: string | null
          phone: string | null
          price_range: string | null
          promotion_active: boolean
          promotion_cta_destination: string | null
          promotion_cta_label: string | null
          promotion_description: string | null
          promotion_end_date: string | null
          promotion_media_url: string | null
          promotion_sort_order: number
          promotion_start_date: string | null
          promotion_title: string | null
          publication_status: string
          show_original_menu: boolean
          slug: string
          updated_at: string
          verification_status: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          application_id?: string | null
          created_at?: string
          cuisine?: string[]
          description: string
          email?: string | null
          facebook?: string | null
          featured?: boolean
          id?: string
          image_path: string
          instagram?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          membership_plan_id?: string | null
          name: string
          opening_hours?: string | null
          partner_id?: string | null
          phone?: string | null
          price_range?: string | null
          promotion_active?: boolean
          promotion_cta_destination?: string | null
          promotion_cta_label?: string | null
          promotion_description?: string | null
          promotion_end_date?: string | null
          promotion_media_url?: string | null
          promotion_sort_order?: number
          promotion_start_date?: string | null
          promotion_title?: string | null
          publication_status?: string
          show_original_menu?: boolean
          slug: string
          updated_at?: string
          verification_status?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          application_id?: string | null
          created_at?: string
          cuisine?: string[]
          description?: string
          email?: string | null
          facebook?: string | null
          featured?: boolean
          id?: string
          image_path?: string
          instagram?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          membership_plan_id?: string | null
          name?: string
          opening_hours?: string | null
          partner_id?: string | null
          phone?: string | null
          price_range?: string | null
          promotion_active?: boolean
          promotion_cta_destination?: string | null
          promotion_cta_label?: string | null
          promotion_description?: string | null
          promotion_end_date?: string | null
          promotion_media_url?: string | null
          promotion_sort_order?: number
          promotion_start_date?: string | null
          promotion_title?: string | null
          publication_status?: string
          show_original_menu?: boolean
          slug?: string
          updated_at?: string
          verification_status?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_membership_plan_id_fkey"
            columns: ["membership_plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      room_availability: {
        Row: {
          availability_date: string
          created_at: string
          currency: string
          error_state: string | null
          external_property_id: string | null
          external_room_id: string | null
          id: string
          last_synchronized_at: string | null
          partner_id: string
          property_id: string
          provider: string
          rate: number | null
          restrictions: Json
          room_id: string | null
          rooms_available: number | null
          sync_status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          availability_date: string
          created_at?: string
          currency?: string
          error_state?: string | null
          external_property_id?: string | null
          external_room_id?: string | null
          id?: string
          last_synchronized_at?: string | null
          partner_id: string
          property_id: string
          provider?: string
          rate?: number | null
          restrictions?: Json
          room_id?: string | null
          rooms_available?: number | null
          sync_status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          availability_date?: string
          created_at?: string
          currency?: string
          error_state?: string | null
          external_property_id?: string | null
          external_room_id?: string | null
          id?: string
          last_synchronized_at?: string | null
          partner_id?: string
          property_id?: string
          provider?: string
          rate?: number | null
          restrictions?: Json
          room_id?: string | null
          rooms_available?: number | null
          sync_status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_availability_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_availability_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_availability_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          active: boolean
          adults: number
          amenities: string[]
          bed_type: string | null
          breakfast_included: boolean
          capacity: string
          children: number
          created_at: string
          currency: string | null
          description: string | null
          id: string
          image_paths: string[]
          metadata: Json
          name: string
          price_per_night: number | null
          property_id: string
          source_key: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          adults?: number
          amenities?: string[]
          bed_type?: string | null
          breakfast_included?: boolean
          capacity: string
          children?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          image_paths?: string[]
          metadata?: Json
          name: string
          price_per_night?: number | null
          property_id: string
          source_key?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          adults?: number
          amenities?: string[]
          bed_type?: string | null
          breakfast_included?: boolean
          capacity?: string
          children?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          image_paths?: string[]
          metadata?: Json
          name?: string
          price_per_night?: number | null
          property_id?: string
          source_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_schedule_exceptions: {
        Row: {
          cancelled: boolean
          created_at: string
          departure_time: string | null
          exception_date: string
          id: string
          notice: string | null
          schedule_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cancelled?: boolean
          created_at?: string
          departure_time?: string | null
          exception_date: string
          id?: string
          notice?: string | null
          schedule_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cancelled?: boolean
          created_at?: string
          departure_time?: string | null
          exception_date?: string
          id?: string
          notice?: string | null
          schedule_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfer_schedule_exceptions_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "public_transfer_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_schedule_exceptions_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "transfer_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_schedules: {
        Row: {
          active: boolean
          arrival_point: string
          cancellation_notice: string | null
          created_at: string
          currency: string
          days_of_week: number[]
          departure_point: string
          departure_time: string
          direction: string
          effective_end: string | null
          effective_start: string | null
          friday_specific: boolean
          id: string
          luggage_policy: string | null
          partner_id: string
          pickup_dropoff: string | null
          price: number | null
          transfer_id: string
          unit: string
          updated_at: string
          updated_by: string | null
          vessel_capacity: number | null
          vessel_details: string | null
          weather_notice: string | null
        }
        Insert: {
          active?: boolean
          arrival_point: string
          cancellation_notice?: string | null
          created_at?: string
          currency?: string
          days_of_week?: number[]
          departure_point: string
          departure_time: string
          direction: string
          effective_end?: string | null
          effective_start?: string | null
          friday_specific?: boolean
          id?: string
          luggage_policy?: string | null
          partner_id: string
          pickup_dropoff?: string | null
          price?: number | null
          transfer_id: string
          unit?: string
          updated_at?: string
          updated_by?: string | null
          vessel_capacity?: number | null
          vessel_details?: string | null
          weather_notice?: string | null
        }
        Update: {
          active?: boolean
          arrival_point?: string
          cancellation_notice?: string | null
          created_at?: string
          currency?: string
          days_of_week?: number[]
          departure_point?: string
          departure_time?: string
          direction?: string
          effective_end?: string | null
          effective_start?: string | null
          friday_specific?: boolean
          id?: string
          luggage_policy?: string | null
          partner_id?: string
          pickup_dropoff?: string | null
          price?: number | null
          transfer_id?: string
          unit?: string
          updated_at?: string
          updated_by?: string | null
          vessel_capacity?: number | null
          vessel_details?: string | null
          weather_notice?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfer_schedules_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_schedules_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "public_transfers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_schedules_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          application_id: string | null
          arrival_point: string | null
          created_at: string
          departure_point: string | null
          description: string
          duration: string | null
          featured: boolean
          highlights: string[]
          id: string
          image_path: string
          partner_id: string | null
          price: string | null
          publication_status: string
          schedule_note: string | null
          slug: string
          title: string
          transfer_type: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          application_id?: string | null
          arrival_point?: string | null
          created_at?: string
          departure_point?: string | null
          description: string
          duration?: string | null
          featured?: boolean
          highlights?: string[]
          id?: string
          image_path: string
          partner_id?: string | null
          price?: string | null
          publication_status?: string
          schedule_note?: string | null
          slug: string
          title: string
          transfer_type: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          application_id?: string | null
          arrival_point?: string | null
          created_at?: string
          departure_point?: string | null
          description?: string
          duration?: string | null
          featured?: boolean
          highlights?: string[]
          id?: string
          image_path?: string
          partner_id?: string | null
          price?: string | null
          publication_status?: string
          schedule_note?: string | null
          slug?: string
          title?: string
          transfer_type?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_business_media: {
        Row: {
          alt_text: string | null
          business_id: string | null
          business_type: string | null
          caption: string | null
          file_type: string | null
          filename: string | null
          height: number | null
          id: string | null
          is_cover: boolean | null
          is_featured: boolean | null
          media_asset_id: string | null
          media_purpose: string | null
          path: string | null
          sort_order: number | null
          storage_bucket: string | null
          storage_path: string | null
          width: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "public_property_media"
            referencedColumns: ["id"]
          },
        ]
      }
      public_experiences: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          featured: boolean | null
          highlights: string[] | null
          id: string | null
          image_path: string | null
          price: string | null
          slug: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          featured?: boolean | null
          highlights?: string[] | null
          id?: string | null
          image_path?: string | null
          price?: string | null
          slug?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          featured?: boolean | null
          highlights?: string[] | null
          id?: string | null
          image_path?: string | null
          price?: string | null
          slug?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      public_properties: {
        Row: {
          address: string | null
          amenities: string[] | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string | null
          currency: string | null
          email: string | null
          featured: boolean | null
          full_description: string | null
          google_maps_link: string | null
          hero_image_path: string | null
          id: string | null
          island: string | null
          latitude: number | null
          logo_path: string | null
          longitude: number | null
          membership_plan_id: string | null
          name: string | null
          operating_hours: string | null
          partner_id: string | null
          policies: string[] | null
          publication_status: string | null
          room_count: number | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string | null
          social_links: Json | null
          starting_price: number | null
          updated_at: string | null
          verification_status: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          featured?: boolean | null
          full_description?: string | null
          google_maps_link?: string | null
          hero_image_path?: string | null
          id?: string | null
          island?: string | null
          latitude?: number | null
          logo_path?: string | null
          longitude?: number | null
          membership_plan_id?: string | null
          name?: string | null
          operating_hours?: string | null
          partner_id?: string | null
          policies?: string[] | null
          publication_status?: string | null
          room_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string | null
          social_links?: Json | null
          starting_price?: number | null
          updated_at?: string | null
          verification_status?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          featured?: boolean | null
          full_description?: string | null
          google_maps_link?: string | null
          hero_image_path?: string | null
          id?: string | null
          island?: string | null
          latitude?: number | null
          logo_path?: string | null
          longitude?: number | null
          membership_plan_id?: string | null
          name?: string | null
          operating_hours?: string | null
          partner_id?: string | null
          policies?: string[] | null
          publication_status?: string | null
          room_count?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string | null
          social_links?: Json | null
          starting_price?: number | null
          updated_at?: string | null
          verification_status?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_membership_plan_id_fkey"
            columns: ["membership_plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      public_property_media: {
        Row: {
          alt_text: string | null
          caption: string | null
          height: number | null
          id: string | null
          media_type: string | null
          path: string | null
          property_id: string | null
          room_id: string | null
          sort_order: number | null
          width: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      public_property_services: {
        Row: {
          child_price: number | null
          currency: string | null
          description: string | null
          id: string | null
          price: number | null
          property_id: string | null
          service_type: string | null
          sort_order: number | null
          title: string | null
          unit: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_service_items_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_service_items_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      public_restaurants: {
        Row: {
          address: string | null
          application_id: string | null
          created_at: string | null
          cuisine: string[] | null
          description: string | null
          email: string | null
          facebook: string | null
          featured: boolean | null
          id: string | null
          image_path: string | null
          instagram: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string | null
          opening_hours: string | null
          partner_id: string | null
          phone: string | null
          price_range: string | null
          promotion_active: boolean | null
          promotion_cta_destination: string | null
          promotion_cta_label: string | null
          promotion_description: string | null
          promotion_end_date: string | null
          promotion_media_url: string | null
          promotion_sort_order: number | null
          promotion_start_date: string | null
          promotion_title: string | null
          publication_status: string | null
          show_original_menu: boolean | null
          slug: string | null
          updated_at: string | null
          verification_status: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          application_id?: string | null
          created_at?: string | null
          cuisine?: string[] | null
          description?: string | null
          email?: string | null
          facebook?: string | null
          featured?: boolean | null
          id?: string | null
          image_path?: string | null
          instagram?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string | null
          opening_hours?: string | null
          partner_id?: string | null
          phone?: string | null
          price_range?: string | null
          promotion_active?: boolean | null
          promotion_cta_destination?: string | null
          promotion_cta_label?: string | null
          promotion_description?: string | null
          promotion_end_date?: string | null
          promotion_media_url?: string | null
          promotion_sort_order?: number | null
          promotion_start_date?: string | null
          promotion_title?: string | null
          publication_status?: string | null
          show_original_menu?: boolean | null
          slug?: string | null
          updated_at?: string | null
          verification_status?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          application_id?: string | null
          created_at?: string | null
          cuisine?: string[] | null
          description?: string | null
          email?: string | null
          facebook?: string | null
          featured?: boolean | null
          id?: string | null
          image_path?: string | null
          instagram?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string | null
          opening_hours?: string | null
          partner_id?: string | null
          phone?: string | null
          price_range?: string | null
          promotion_active?: boolean | null
          promotion_cta_destination?: string | null
          promotion_cta_label?: string | null
          promotion_description?: string | null
          promotion_end_date?: string | null
          promotion_media_url?: string | null
          promotion_sort_order?: number | null
          promotion_start_date?: string | null
          promotion_title?: string | null
          publication_status?: string | null
          show_original_menu?: boolean | null
          slug?: string | null
          updated_at?: string | null
          verification_status?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      public_room_availability: {
        Row: {
          availability_date: string | null
          currency: string | null
          id: string | null
          last_synchronized_at: string | null
          property_id: string | null
          provider: string | null
          rate: number | null
          restrictions: Json | null
          room_id: string | null
          rooms_available: number | null
          sync_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_availability_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "public_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_availability_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      public_rooms: {
        Row: {
          active: boolean | null
          adults: number | null
          amenities: string[] | null
          bed_type: string | null
          breakfast_included: boolean | null
          capacity: string | null
          children: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string | null
          image_paths: string[] | null
          name: string | null
          price_per_night: number | null
          property_id: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      public_transfer_schedule_exceptions: {
        Row: {
          cancelled: boolean | null
          departure_time: string | null
          exception_date: string | null
          id: string | null
          notice: string | null
          schedule_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfer_schedule_exceptions_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "public_transfer_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_schedule_exceptions_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "transfer_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      public_transfer_schedules: {
        Row: {
          active: boolean | null
          arrival_point: string | null
          cancellation_notice: string | null
          currency: string | null
          days_of_week: number[] | null
          departure_point: string | null
          departure_time: string | null
          direction: string | null
          effective_end: string | null
          effective_start: string | null
          friday_specific: boolean | null
          id: string | null
          luggage_policy: string | null
          pickup_dropoff: string | null
          price: number | null
          transfer_id: string | null
          unit: string | null
          vessel_capacity: number | null
          vessel_details: string | null
          weather_notice: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfer_schedules_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "public_transfers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_schedules_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      public_transfers: {
        Row: {
          arrival_point: string | null
          created_at: string | null
          departure_point: string | null
          description: string | null
          duration: string | null
          featured: boolean | null
          highlights: string[] | null
          id: string | null
          image_path: string | null
          price: string | null
          schedule_note: string | null
          slug: string | null
          title: string | null
          transfer_type: string | null
          updated_at: string | null
        }
        Insert: {
          arrival_point?: string | null
          created_at?: string | null
          departure_point?: string | null
          description?: string | null
          duration?: string | null
          featured?: boolean | null
          highlights?: string[] | null
          id?: string | null
          image_path?: string | null
          price?: string | null
          schedule_note?: string | null
          slug?: string | null
          title?: string | null
          transfer_type?: string | null
          updated_at?: string | null
        }
        Update: {
          arrival_point?: string | null
          created_at?: string | null
          departure_point?: string | null
          description?: string | null
          duration?: string | null
          featured?: boolean | null
          highlights?: string[] | null
          id?: string | null
          image_path?: string | null
          price?: string | null
          schedule_note?: string | null
          slug?: string | null
          title?: string | null
          transfer_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_agreement_idempotent: {
        Args: {
          p_acceptance_evidence?: Json
          p_acceptance_method?: string
          p_accepting_user_id: string
          p_agreement_version_id: string
          p_ip_address?: string
          p_partner_id: string
          p_user_agent?: string
        }
        Returns: {
          acceptance_id: string
          accepted_at: string
          is_new_acceptance: boolean
        }[]
      }
      admin_assign_application_partner: {
        Args: {
          admin_user_id: string
          application_uuid: string
          partner_uuid?: string
          reviewer_name: string
        }
        Returns: Json
      }
      admin_link_application_listing: {
        Args: {
          admin_user_id: string
          application_uuid: string
          listing_uuid: string
        }
        Returns: Json
      }
      admin_save_application_review: {
        Args: {
          application_uuid: string
          price_payload: Json
          review_payload: Json
          reviewer_name: string
          reviewer_user_id: string
        }
        Returns: Json
      }
      admin_save_business_listing: {
        Args: {
          admin_user_id: string
          listing_payload: Json
          listing_type: string
          listing_uuid: string
        }
        Returns: Json
      }
      admin_save_property: {
        Args: {
          admin_user_id: string
          media_payload: Json
          property_payload: Json
          property_uuid: string
          room_payload: Json
        }
        Returns: Json
      }
      application_listing_workflow: {
        Args: { p_business_type: string }
        Returns: string
      }
      approve_partner_application: {
        Args: {
          application_uuid: string
          publish_listing?: boolean
          review_note?: string
          reviewer_name: string
          reviewer_user_id: string
        }
        Returns: Json
      }
      approve_partner_application_all_types: {
        Args: {
          application_uuid: string
          publish_listing?: boolean
          review_note?: string
          reviewer_name: string
          reviewer_user_id: string
        }
        Returns: Json
      }
      approve_partner_application_all_types_core: {
        Args: {
          application_uuid: string
          publish_listing?: boolean
          review_note?: string
          reviewer_name: string
          reviewer_user_id: string
        }
        Returns: Json
      }
      backfill_partner_operations_phase1a: { Args: never; Returns: undefined }
      can_edit_agreement_version: {
        Args: { p_version_id: string }
        Returns: boolean
      }
      compute_agreement_content_hash: {
        Args: { content: string }
        Returns: string
      }
      ensure_admin_listing_application: {
        Args: {
          p_address: string
          p_business_name: string
          p_business_type: string
          p_contact_person?: string
          p_email?: string
          p_existing_application_id?: string
          p_island: string
          p_listing_type: string
          p_listing_uuid: string
          p_short_description: string
          p_whatsapp?: string
        }
        Returns: string
      }
      is_admin_created_application: {
        Args: { p_metadata: Json }
        Returns: boolean
      }
      log_agreement_audit: {
        Args: {
          p_agreement_version_id: string
          p_event_type: string
          p_metadata?: Json
          p_partner_id: string
        }
        Returns: string
      }
      log_agreement_operation: {
        Args: { p_event_type: string; p_metadata?: Json; p_partner_id: string }
        Returns: string
      }
      mark_reacceptance_required: {
        Args: { p_new_version_id: string; p_old_version_id: string }
        Returns: {
          affected_partners: number
        }[]
      }
      next_partner_application_reference: { Args: never; Returns: string }
      normalize_admin_created_business_type: {
        Args: { p_listing_payload: Json; p_listing_type: string }
        Returns: string
      }
      normalized_business_identity: { Args: { value: string }; Returns: string }
      partner_replace_gallery: {
        Args: {
          actor_user_id: string
          items: Json
          partner_uuid: string
          property_uuid: string
        }
        Returns: Json
      }
      partner_replace_rooms_services: {
        Args: {
          actor_user_id: string
          items: Json
          partner_uuid: string
          property_uuid: string
        }
        Returns: Json
      }
      partner_save_manual_availability: {
        Args: {
          actor_user_id: string
          entries: Json
          partner_uuid: string
          property_uuid: string
        }
        Returns: number
      }
      partner_save_transfer_schedule: {
        Args: {
          actor_user_id: string
          exceptions: Json
          partner_uuid: string
          payload: Json
          schedule_uuid: string
          transfer_uuid: string
        }
        Returns: string
      }
      partner_set_availability_provider: {
        Args: {
          actor_user_id: string
          partner_uuid: string
          property_uuid: string
          provider_name: string
        }
        Returns: string
      }
      production_slug: { Args: { value: string }; Returns: string }
      sha256_hash: { Args: { p_content: string }; Returns: string }
      validate_requirement_state_transition: {
        Args: { p_current_state: string; p_new_state: string }
        Returns: boolean
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

