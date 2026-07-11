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
          short_description: string;
          full_description: string | null;
          hero_image_path: string;
          check_in_time: string | null;
          check_out_time: string | null;
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
          check_in: string;
          check_out: string;
          adults: number;
          children: number;
          booking_total: number;
          commission_percent: number;
          company_revenue: number;
          partner_revenue: number;
          booking_status: string;
          payment_status: string;
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
