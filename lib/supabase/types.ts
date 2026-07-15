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
          lead_source: string | null;
          priority: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partners"]["Row"]> & {
          business_name: string;
          slug: string;
          category: string;
        };
        Update: Partial<Database["public"]["Tables"]["partners"]["Row"]>;
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
          price_per_night: number;
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
          price_per_night: number;
        };
        Update: Partial<Database["public"]["Tables"]["rooms"]["Row"]>;
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
          booking_total: number;
          taxes_fees: number;
          commission_percent: number;
          company_revenue: number;
          partner_revenue: number;
          booking_status: string;
          payment_status: string;
          contact_preference: string;
          room_prepared: boolean;
          internal_notes: string | null;
          special_requests: string | null;
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
          image_path: string;
          publication_status: string;
          featured: boolean;
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
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partner_service_items"]["Row"]> & { title: string };
        Update: Partial<Database["public"]["Tables"]["partner_service_items"]["Row"]>;
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
      };
      partner_account_invitations: {
        Row: {
          id: string;
          partner_id: string;
          application_id: string | null;
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
      };
      property_experiences: { Row: { property_id: string; experience_id: string; created_at: string }; Insert: { property_id: string; experience_id: string }; Update: never };
      property_transfers: { Row: { property_id: string; transfer_id: string; created_at: string }; Insert: { property_id: string; transfer_id: string }; Update: never };
      property_media: { Row: { property_id: string; media_asset_id: string; usage: string; sort_order: number; created_at: string }; Insert: { property_id: string; media_asset_id: string; usage?: string; sort_order?: number }; Update: Partial<{ usage: string; sort_order: number }> };
      partner_media: { Row: { partner_id: string; media_asset_id: string; usage: string; sort_order: number; created_at: string }; Insert: { partner_id: string; media_asset_id: string; usage?: string; sort_order?: number }; Update: Partial<{ usage: string; sort_order: number }> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<TableName extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][TableName]["Row"];
