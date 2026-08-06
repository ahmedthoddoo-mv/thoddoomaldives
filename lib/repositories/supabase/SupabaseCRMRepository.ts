import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { mapPartnerRowToDomain } from "@/lib/supabase/mappers";
import { SupabasePartnerRepository } from "@/lib/repositories/supabase/SupabasePartnerRepository";
import type { Tables } from "@/lib/supabase/types";

type TaskWithPartner = Tables<"crm_tasks"> & {
  partners?: { business_name: string } | null;
};

type NoteWithPartner = Tables<"crm_notes"> & {
  partners?: { business_name: string } | null;
};

export const SupabaseCRMRepository = {
  ...SupabasePartnerRepository,
  async findAll() {
    const supabase = createSupabaseServiceRoleClient();
    if (!supabase) throw new Error("Supabase service role is not configured.");
    const [partnerResult, applicationResult, propertyResult, restaurantResult, experienceResult, transferResult, bookingResult, mediaResult, taskResult, noteResult] = await Promise.all([
      supabase.from("partners").select("*").order("created_at", { ascending: false }),
      supabase.from("partner_applications").select("id, partner_id, property_id, status, business_type, submitted_at").order("submitted_at", { ascending: false }),
      supabase.from("properties").select("id, partner_id, publication_status"),
      supabase.from("restaurants").select("*"),
      supabase.from("experiences").select("*"),
      supabase.from("transfers").select("*"),
      supabase.from("bookings").select("id, partner_id"),
      supabase.from("media_assets").select("id, partner_id"),
      supabase.from("crm_tasks").select("id, partner_id, status"),
      supabase.from("crm_notes").select("partner_id, body, created_at").order("created_at", { ascending: false })
    ]);
    if (partnerResult.error) throw partnerResult.error;
    if (applicationResult.error) throw applicationResult.error;
    const relatedResults = [propertyResult, restaurantResult, experienceResult, transferResult, bookingResult, mediaResult, taskResult, noteResult];
    const relatedError = relatedResults.find((result) => result.error)?.error;
    if (relatedError) throw relatedError;
    const applications = (applicationResult.data ?? []) as Array<{ id: string; partner_id: string | null; property_id: string | null; status: string; submitted_at: string }>;
    const listings = [propertyResult, restaurantResult, experienceResult, transferResult]
      .flatMap((result) => result.data ?? []) as Array<{ id: string; partner_id?: string | null; publication_status?: string }>;
    const bookings = bookingResult.data ?? [];
    const media = mediaResult.data ?? [];
    const tasks = taskResult.data ?? [];
    const notes = noteResult.data ?? [];

    return (partnerResult.data ?? []).map((row) => {
      const partner = mapPartnerRowToDomain(row);
      const application = applications.find((item) => item.partner_id === row.id);
      const listing = listings.find((item) => item.partner_id === row.id)
        ?? (application?.property_id ? listings.find((item) => item.id === application.property_id) : undefined);
      const latestNote = notes.find((item) => item.partner_id === row.id);
      return {
        ...partner,
        applicationStatus: application?.status ?? "Not linked",
        publicationStatus: listing?.publication_status ?? "Not linked",
        linkedApplicationId: application?.id,
        linkedListingId: listing?.id,
        bookingCount: bookings.filter((item) => item.partner_id === row.id).length,
        mediaCount: media.filter((item) => item.partner_id === row.id).length,
        latestNote: latestNote?.body,
        openTaskCount: tasks.filter((item) => item.partner_id === row.id && item.status !== "completed").length,
        notes: latestNote ? [latestNote.body] : []
      };
    });
  },
  async findTasks() {
    const supabase = createSupabaseServiceRoleClient();
    if (!supabase) throw new Error("Supabase service role is not configured.");
    const { data, error } = await supabase.from("crm_tasks").select("*, partners(business_name)").order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as unknown as TaskWithPartner[]).map((task) => ({
      id: task.id,
      partnerId: task.partner_id ?? "",
      partnerBusiness: task.partners?.business_name ?? "Partner",
      type: task.task_type === "need_photos" ? "Need Photos" : task.task_type === "need_logo" ? "Need Logo" : task.task_type === "need_pricing" ? "Need Pricing" : "Call Owner",
      title: task.title,
      owner: task.owner ?? "Admin",
      dueDate: task.due_date ?? "",
      status: task.status === "completed" ? "Completed" : task.status === "in_progress" ? "In Progress" : task.status === "waiting_response" ? "Waiting Response" : "Open",
      priority: task.priority === "urgent" ? "Urgent" : task.priority === "high" ? "High" : task.priority === "low" ? "Low" : "Medium"
    }));
  },
  async findNotes() {
    const supabase = createSupabaseServiceRoleClient();
    if (!supabase) throw new Error("Supabase service role is not configured.");
    const { data, error } = await supabase.from("crm_notes").select("*, partners(business_name)").order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as unknown as NoteWithPartner[]).map((note) => ({
      id: note.id,
      partnerId: note.partner_id ?? "",
      partnerBusiness: note.partners?.business_name ?? "Partner",
      author: note.author,
      date: note.created_at,
      body: note.body
    }));
  },
  async findSummaryStats() {
    const partners = await this.findAll();
    const tasks = await this.findTasks();
    return [
      { label: "CRM Partners", value: String(partners.length), detail: "Supabase partner records" },
      { label: "Open Tasks", value: String(tasks.filter((task) => task.status !== "completed").length), detail: "Database task records" }
    ];
  },
  mapPartnerRowToDomain
};
