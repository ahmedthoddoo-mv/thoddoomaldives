export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      partners: {
        Row: {
          id: string;
          business_name: string;
          slug: string;
          owner_name: string | null;
          category: string;
          status: string;
          membership_plan_id: string | null;
          verification_status: string;
          whatsapp: string | null;
          email: string | null;
          website: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          auth_user_id: string | null;
          application_id: string | null;
          phone: string | null;
          full_description: string | null;
          logo_path: string | null;
          hero_image_path: string | null;
          gallery_paths: string[];
          approved_at: string | null;
          approved_by_user_id: string | null;
          published_at: string | null;
          lead_source: string | null;
          priority: string | null;
          editing_suspended: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partners"]["Row"]> & {
          business_name: string;
          slug: string;
          category: string;
        };
        Update: Partial<Database["public"]["Tables"]["partners"]["Row"]>;
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          partner_id: string | null;
          name: string;
          slug: string;
          island: string;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          whatsapp: string | null;
          email: string | null;
          website: string | null;
          google_maps_link: string | null;
          short_description: string;
          full_description: string | null;
          hero_image_path: string;
          amenities: string[];
          policies: string[];
          check_in_time: string | null;
          check_out_time: string | null;
          operating_hours: string | null;
          languages: string[];
          social_links: Json;
          application_id: string | null;
          phone: string | null;
          logo_path: string | null;
          room_count: number | null;
          starting_price: number | null;
          currency: string | null;
          metadata: Json;
          approved_at: string | null;
          approved_by_user_id: string | null;
          published_at: string | null;
          membership_plan_id: string | null;
          verification_status: string;
          publication_status: string;
          featured: boolean;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["properties"]["Row"]> & {
          name: string;
          slug: string;
          island: string;
          short_description: string;
          hero_image_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Row"]>;
        Relationships: [];
      };
      rooms: {
        Row: {
          id: string;
          property_id: string;
          name: string;
          bed_type: string | null;
          capacity: string;
          adults: number;
          children: number;
          price_per_night: number | null;
          source_key: string | null;
          currency: string | null;
          amenities: string[];
          image_paths: string[];
          metadata: Json;
          breakfast_included: boolean;
          description: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["rooms"]["Row"]> & {
          property_id: string;
          name: string;
          capacity: string;
          price_per_night?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["rooms"]["Row"]>;
        Relationships: [];
      };
      guests: {
        Row: {
          id: string;
          full_name: string;
          whatsapp: string | null;
          email: string | null;
          country: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["guests"]["Row"]> & { full_name: string };
        Update: Partial<Database["public"]["Tables"]["guests"]["Row"]>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          guest_id: string;
          property_id: string;
          room_id: string | null;
          partner_id: string | null;
          booking_reference: string | null;
          check_in: string;
          check_out: string;
          adults: number;
          children: number;
          booking_total: number | null;
          taxes_fees: number;
          commission_percent: number;
          company_revenue: number | null;
          partner_revenue: number | null;
          booking_status: string;
          payment_status: string;
          contact_preference: string;
          room_prepared: boolean;
          internal_notes: string | null;
          special_requests: string | null;
          nights: number | null;
          source: string;
          selected_service_ids: string[];
          quoted_amount: number | null;
          quote_currency: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["bookings"]["Row"]> & {
          guest_id: string;
          property_id: string;
          check_in: string;
          check_out: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Row"]>;
        Relationships: [];
      };
      media_assets: {
        Row: {
          id: string;
          filename: string;
          path: string;
          category: string;
          file_type: string;
          width: number | null;
          height: number | null;
          alt_text: string | null;
          caption: string | null;
          rights_status: string;
          archived: boolean;
          application_id: string | null;
          partner_id: string | null;
          property_id: string | null;
          room_id: string | null;
          storage_bucket: string | null;
          storage_path: string | null;
          media_type: string | null;
          sort_order: number;
          visibility: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["media_assets"]["Row"]> & {
          filename: string;
          path: string;
          category: string;
          file_type: string;
        };
        Update: Partial<Database["public"]["Tables"]["media_assets"]["Row"]>;
        Relationships: [];
      };
      business_media: {
        Row: {
          id: string;
          business_type: string;
          business_id: string;
          media_asset_id: string;
          partner_id: string | null;
          application_id: string | null;
          caption: string | null;
          alt_text: string | null;
          sort_order: number;
          is_cover: boolean;
          is_featured: boolean;
          is_public: boolean;
          media_purpose: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["business_media"]["Row"]> & {
          business_type: string;
          business_id: string;
          media_asset_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["business_media"]["Row"]>;
        Relationships: [];
      };
      restaurants: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          cuisine: string[];
          location: string | null;
          price_range: string | null;
          opening_hours: string | null;
          phone: string | null;
          whatsapp: string | null;
          email: string | null;
          website: string | null;
          instagram: string | null;
          facebook: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          image_path: string;
          publication_status: string;
          verification_status: string;
          application_id: string | null;
          partner_id: string | null;
          featured: boolean;
          show_original_menu: boolean;
          promotion_title: string | null;
          promotion_description: string | null;
          promotion_media_url: string | null;
          promotion_cta_label: string | null;
          promotion_cta_destination: string | null;
          promotion_active: boolean;
          promotion_start_date: string | null;
          promotion_end_date: string | null;
          promotion_sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["restaurants"]["Row"]> & {
          slug: string;
          name: string;
          description: string;
          image_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["restaurants"]["Row"]>;
        Relationships: [];
      };
      experiences: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          category: string;
          duration: string | null;
          price: string | null;
          image_path: string;
          highlights: string[];
          publication_status: string;
          verification_status: string;
          application_id: string | null;
          partner_id: string | null;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["experiences"]["Row"]> & {
          slug: string;
          title: string;
          description: string;
          category: string;
          image_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["experiences"]["Row"]>;
        Relationships: [];
      };
      transfers: {
        Row: {
          id: string;
          slug: string;
          title: string;
          transfer_type: string;
          description: string;
          duration: string | null;
          price: string | null;
          departure_point: string | null;
          arrival_point: string | null;
          schedule_note: string | null;
          image_path: string;
          highlights: string[];
          publication_status: string;
          verification_status: string;
          application_id: string | null;
          partner_id: string | null;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["transfers"]["Row"]> & {
          slug: string;
          title: string;
          transfer_type: string;
          description: string;
          image_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["transfers"]["Row"]>;
        Relationships: [];
      };
      transfer_schedules: {
        Row: { id: string; transfer_id: string; partner_id: string; direction: string; departure_point: string; arrival_point: string; days_of_week: number[]; departure_time: string; effective_start: string | null; effective_end: string | null; friday_specific: boolean; price: number | null; currency: string; unit: string; vessel_capacity: number | null; vessel_details: string | null; luggage_policy: string | null; pickup_dropoff: string | null; cancellation_notice: string | null; weather_notice: string | null; active: boolean; updated_by: string | null; created_at: string; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["transfer_schedules"]["Row"]> & { transfer_id: string; partner_id: string; direction: string; departure_point: string; arrival_point: string; departure_time: string };
        Update: Partial<Database["public"]["Tables"]["transfer_schedules"]["Row"]>;
        Relationships: [];
      };
      transfer_schedule_exceptions: {
        Row: { id: string; schedule_id: string; exception_date: string; departure_time: string | null; cancelled: boolean; notice: string | null; updated_by: string | null; created_at: string; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["transfer_schedule_exceptions"]["Row"]> & { schedule_id: string; exception_date: string };
        Update: Partial<Database["public"]["Tables"]["transfer_schedule_exceptions"]["Row"]>;
        Relationships: [];
      };
      availability_integrations: {
        Row: { id: string; property_id: string; partner_id: string; provider: string; external_property_id: string | null; last_synchronized_at: string | null; sync_status: string; error_state: string | null; updated_by: string | null; created_at: string; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["availability_integrations"]["Row"]> & { property_id: string; partner_id: string };
        Update: Partial<Database["public"]["Tables"]["availability_integrations"]["Row"]>;
        Relationships: [];
      };
      room_availability: {
        Row: { id: string; property_id: string; room_id: string | null; partner_id: string; availability_date: string; rooms_available: number | null; rate: number | null; currency: string; restrictions: Json; provider: string; external_property_id: string | null; external_room_id: string | null; last_synchronized_at: string | null; sync_status: string; error_state: string | null; updated_by: string | null; created_at: string; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["room_availability"]["Row"]> & { property_id: string; partner_id: string; availability_date: string };
        Update: Partial<Database["public"]["Tables"]["room_availability"]["Row"]>;
        Relationships: [];
      };
      partner_change_requests: {
        Row: { id: string; partner_id: string; listing_type: string; listing_id: string; change_type: string; requested_values: Json; status: string; requested_by: string; reviewed_by: string | null; review_note: string | null; created_at: string; reviewed_at: string | null };
        Insert: Partial<Database["public"]["Tables"]["partner_change_requests"]["Row"]> & { partner_id: string; listing_type: string; listing_id: string; change_type: string; requested_values: Json; requested_by: string };
        Update: Partial<Database["public"]["Tables"]["partner_change_requests"]["Row"]>;
        Relationships: [];
      };
      partner_application_review_versions: {
        Row: {
          id: string;
          application_id: string;
          version: number;
          original_values: Json;
          reviewed_values: Json;
          reviewed_prices: Json;
          edited_by_user_id: string;
          edited_by_name: string;
          edited_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partner_application_review_versions"]["Row"]> & {
          application_id: string;
          version: number;
          original_values: Json;
          reviewed_values: Json;
          edited_by_user_id: string;
          edited_by_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["partner_application_review_versions"]["Row"]>;
        Relationships: [];
      };
      crm_tasks: {
        Row: {
          id: string;
          partner_id: string | null;
          title: string;
          task_type: string;
          owner: string | null;
          due_date: string | null;
          status: string;
          priority: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["crm_tasks"]["Row"]> & { title: string; task_type: string };
        Update: Partial<Database["public"]["Tables"]["crm_tasks"]["Row"]>;
        Relationships: [];
      };
      crm_notes: {
        Row: {
          id: string;
          partner_id: string | null;
          author: string;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["crm_notes"]["Row"]> & { author: string; body: string };
        Update: Partial<Database["public"]["Tables"]["crm_notes"]["Row"]>;
        Relationships: [];
      };
      partner_applications: {
        Row: {
          id: string;
          application_reference: string | null;
          business_name: string;
          business_type: string;
          contact_person: string;
          whatsapp: string;
          email: string;
          island: string;
          address: string | null;
          google_maps_link: string | null;
          website: string | null;
          instagram: string | null;
          facebook: string | null;
          short_description: string;
          registration_number: string | null;
          membership_plan: string;
          status: string;
          metadata: Json;
          notes: string | null;
          missing_information: string[];
          review_notes: string[];
          partner_id: string | null;
          listing_id: string | null;
          listing_type: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          property_id: string | null;
          approved_at: string | null;
          approved_by_user_id: string | null;
          submitted_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partner_applications"]["Row"]> & {
          business_name: string;
          business_type: string;
          contact_person: string;
          whatsapp: string;
          email: string;
          short_description: string;
        };
        Update: Partial<Database["public"]["Tables"]["partner_applications"]["Row"]>;
        Relationships: [];
      };
      partner_application_prices: {
        Row: {
          id: string;
          application_id: string;
          item_name: string;
          description: string | null;
          price: number | null;
          currency: string;
          unit: string;
          child_price: number | null;
          notes: string | null;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partner_application_prices"]["Row"]> & {
          application_id: string;
          item_name: string;
          unit: string;
        };
        Update: Partial<Database["public"]["Tables"]["partner_application_prices"]["Row"]>;
        Relationships: [];
      };
      partner_application_media: {
        Row: {
          id: string;
          application_id: string;
          media_type: string;
          label: string;
          path_or_note: string | null;
          file_name: string | null;
          status: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partner_application_media"]["Row"]> & {
          application_id: string;
          media_type: string;
          label: string;
        };
        Update: Partial<Database["public"]["Tables"]["partner_application_media"]["Row"]>;
        Relationships: [];
      };
      partner_application_services: {
        Row: {
          id: string;
          application_id: string;
          service_type: string;
          title: string;
          details: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partner_application_services"]["Row"]> & {
          application_id: string;
          service_type: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["partner_application_services"]["Row"]>;
        Relationships: [];
      };
      partner_application_verification_documents: {
        Row: {
          id: string;
          application_id: string;
          document_key: string;
          document_label: string;
          required: boolean;
          storage_bucket: string;
          storage_path: string | null;
          file_name: string | null;
          mime_type: string | null;
          file_size_bytes: number | null;
          status: string;
          admin_note: string | null;
          submitted_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partner_application_verification_documents"]["Row"]> & {
          application_id: string;
          document_key: string;
          document_label: string;
        };
        Update: Partial<Database["public"]["Tables"]["partner_application_verification_documents"]["Row"]>;
        Relationships: [];
      };
      partner_service_items: {
        Row: {
          id: string;
          partner_id: string | null;
          property_id: string | null;
          service_type: string;
          title: string;
          description: string | null;
          price: number | null;
          currency: string;
          unit: string;
          child_price: number | null;
          notes: string | null;
          active: boolean;
          sort_order: number;
          metadata: Json;
          application_id: string | null;
          source_key: string | null;
          public_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partner_service_items"]["Row"]> & { title: string };
        Update: Partial<Database["public"]["Tables"]["partner_service_items"]["Row"]>;
        Relationships: [];
      };
      partner_documents: {
        Row: {
          id: string;
          partner_id: string;
          property_id: string | null;
          document_key: string;
          document_label: string;
          category: string;
          required: boolean;
          storage_bucket: string;
          storage_path: string | null;
          file_name: string | null;
          status: string;
          expiry_date: string | null;
          admin_note: string | null;
          uploaded_at: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partner_documents"]["Row"]> & {
          partner_id: string;
          document_key: string;
          document_label: string;
        };
        Update: Partial<Database["public"]["Tables"]["partner_documents"]["Row"]>;
        Relationships: [];
      };
      partner_notifications: {
        Row: {
          id: string;
          partner_id: string;
          title: string;
          body: string;
          notification_type: string;
          status: string;
          action_href: string | null;
          created_at: string;
          read_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["partner_notifications"]["Row"]> & {
          partner_id: string;
          title: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["partner_notifications"]["Row"]>;
        Relationships: [];
      };
      partner_audit_events: {
        Row: {
          id: string;
          partner_id: string | null;
          auth_user_id: string | null;
          event_type: string;
          metadata: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partner_audit_events"]["Row"]> & {
          event_type: string;
        };
        Update: Partial<Database["public"]["Tables"]["partner_audit_events"]["Row"]>;
        Relationships: [];
      };
      partner_account_invitations: {
        Row: {
          id: string;
          partner_id: string;
          application_id: string | null;
          auth_user_id: string | null;
          idempotency_key: string;
          delivery_attempted_at: string | null;
          delivery_error: string | null;
          email: string;
          status: string;
          invitation_url: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          sent_at: string | null;
          accepted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["partner_account_invitations"]["Row"]> & {
          partner_id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["partner_account_invitations"]["Row"]>;
        Relationships: [];
      };
      admin_users: {
        Row: {
          auth_user_id: string;
          email: string;
          role: "owner" | "admin";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["admin_users"]["Row"]> & {
          auth_user_id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Row"]>;
        Relationships: [];
      };
      membership_plans: {
        Row: {
          id: string;
          name: string;
          price_label: string;
          description: string | null;
          features: string[];
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["membership_plans"]["Row"]> & { name: string; price_label: string };
        Update: Partial<Database["public"]["Tables"]["membership_plans"]["Row"]>;
        Relationships: [];
      };
      property_experiences: { Row: { property_id: string; experience_id: string; created_at: string }; Insert: { property_id: string; experience_id: string }; Update: never; Relationships: [] };
      property_transfers: { Row: { property_id: string; transfer_id: string; created_at: string }; Insert: { property_id: string; transfer_id: string }; Update: never; Relationships: [] };
      property_media: { Row: { property_id: string; media_asset_id: string; usage: string; sort_order: number; created_at: string }; Insert: { property_id: string; media_asset_id: string; usage?: string; sort_order?: number }; Update: Partial<{ usage: string; sort_order: number }>; Relationships: [] };
      partner_media: { Row: { partner_id: string; media_asset_id: string; usage: string; sort_order: number; created_at: string }; Insert: { partner_id: string; media_asset_id: string; usage?: string; sort_order?: number }; Update: Partial<{ usage: string; sort_order: number }>; Relationships: [] };
    };
    Views: {
      public_properties: {
        Row: Omit<Database["public"]["Tables"]["properties"]["Row"], "application_id" | "phone" | "metadata" | "approved_at" | "approved_by_user_id" | "published_at" | "languages">;
        Relationships: [];
      };
      public_rooms: {
        Row: Omit<Database["public"]["Tables"]["rooms"]["Row"], "source_key" | "metadata">;
        Relationships: [];
      };
      public_property_services: {
        Row: Pick<Database["public"]["Tables"]["partner_service_items"]["Row"], "id" | "property_id" | "service_type" | "title" | "description" | "price" | "currency" | "unit" | "child_price" | "sort_order">;
        Relationships: [];
      };
      public_property_media: {
        Row: Pick<Database["public"]["Tables"]["media_assets"]["Row"], "id" | "property_id" | "room_id" | "media_type" | "path" | "alt_text" | "caption" | "sort_order" | "width" | "height">;
        Relationships: [];
      };
      public_business_media: {
        Row: {
          id: string;
          business_type: string;
          business_id: string;
          media_asset_id: string;
          caption: string | null;
          alt_text: string | null;
          sort_order: number;
          is_cover: boolean;
          is_featured: boolean;
          media_purpose: string;
          path: string;
          filename: string;
          file_type: string;
          width: number | null;
          height: number | null;
          storage_bucket: string | null;
          storage_path: string | null;
        };
        Relationships: [];
      };
      public_transfers: { Row: Database["public"]["Tables"]["transfers"]["Row"]; Relationships: [] };
      public_transfer_schedules: { Row: Omit<Database["public"]["Tables"]["transfer_schedules"]["Row"], "partner_id" | "updated_by" | "created_at" | "updated_at">; Relationships: [] };
      public_transfer_schedule_exceptions: { Row: Omit<Database["public"]["Tables"]["transfer_schedule_exceptions"]["Row"], "updated_by" | "created_at" | "updated_at">; Relationships: [] };
      public_room_availability: { Row: Omit<Database["public"]["Tables"]["room_availability"]["Row"], "partner_id" | "external_property_id" | "external_room_id" | "error_state" | "updated_by" | "created_at" | "updated_at">; Relationships: [] };
      public_experiences: { Row: Database["public"]["Tables"]["experiences"]["Row"]; Relationships: [] };
      public_restaurants: { Row: Database["public"]["Tables"]["restaurants"]["Row"]; Relationships: [] };
    };
    Functions: {
      approve_partner_application: {
        Args: {
          application_uuid: string;
          reviewer_user_id: string;
          reviewer_name: string;
          publish_listing?: boolean;
          review_note?: string | null;
        };
        Returns: Json;
      };
      next_partner_application_reference: {
        Args: Record<string, never>;
        Returns: string;
      };
      admin_save_property: {
        Args: {
          admin_user_id: string;
          property_uuid: string | null;
          property_payload: Json;
          room_payload: Json;
          media_payload: Json;
        };
        Returns: Json;
      };
      admin_save_application_review: {
        Args: {
          application_uuid: string;
          reviewer_user_id: string;
          reviewer_name: string;
          review_payload: Json;
          price_payload: Json;
        };
        Returns: Json;
      };
      approve_partner_application_all_types: {
        Args: {
          application_uuid: string;
          reviewer_user_id: string;
          reviewer_name: string;
          publish_listing?: boolean;
          review_note?: string | null;
        };
        Returns: Json;
      };
      admin_save_business_listing: {
        Args: { admin_user_id: string; listing_type: string; listing_uuid: string | null; listing_payload: Json };
        Returns: Json;
      };
      ensure_admin_listing_application: {
        Args: {
          p_listing_uuid: string;
          p_listing_type: string;
          p_business_name: string;
          p_business_type: string;
          p_island: string;
          p_address: string;
          p_short_description: string;
          p_contact_person?: string;
          p_whatsapp?: string;
          p_email?: string;
          p_existing_application_id?: string | null;
        };
        Returns: string;
      };
      admin_link_application_listing: {
        Args: { admin_user_id: string; application_uuid: string; listing_uuid: string };
        Returns: Json;
      };
      admin_assign_application_partner: {
        Args: {
          admin_user_id: string;
          application_uuid: string;
          reviewer_name: string;
          partner_uuid?: string | null;
        };
        Returns: Json;
      };
      partner_replace_rooms_services: {
        Args: {
          actor_user_id: string;
          partner_uuid: string;
          property_uuid: string;
          items: Json;
        };
        Returns: Json;
      };
      partner_replace_gallery: {
        Args: {
          actor_user_id: string;
          partner_uuid: string;
          property_uuid: string;
          items: Json;
        };
        Returns: Json;
      };
      partner_save_transfer_schedule: {
        Args: { actor_user_id: string; partner_uuid: string; transfer_uuid: string; schedule_uuid: string | null; payload: Json; exceptions: Json };
        Returns: string;
      };
      partner_save_manual_availability: {
        Args: { actor_user_id: string; partner_uuid: string; property_uuid: string; entries: Json };
        Returns: number;
      };
      partner_set_availability_provider: {
        Args: { actor_user_id: string; partner_uuid: string; property_uuid: string; provider_name: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<TableName extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][TableName]["Row"];
