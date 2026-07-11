import { createSupabaseServerClient } from "@/lib/supabase/server";
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
  async findTasks() {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase.from("crm_tasks").select("*, partners(business_name)").order("created_at", { ascending: false });
    return ((data ?? []) as TaskWithPartner[]).map((task) => ({
      id: task.id,
      partnerId: task.partner_id ?? "",
      partnerBusiness: task.partners?.business_name ?? "Partner",
      type: task.task_type,
      title: task.title,
      owner: task.owner ?? "Admin",
      dueDate: task.due_date ?? "",
      status: task.status,
      priority: task.priority
    }));
  },
  async findNotes() {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase.from("crm_notes").select("*, partners(business_name)").order("created_at", { ascending: false });
    return ((data ?? []) as NoteWithPartner[]).map((note) => ({
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
