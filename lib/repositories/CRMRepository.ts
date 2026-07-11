import { crmNotes, crmPartners, crmTasks, crmSummaryStats } from "@/data/adminCrm";
import { createRepository } from "@/lib/repositories/types";

function toSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const CRMRepository = {
  ...createRepository({
    records: crmPartners,
    searchFields: ["id", "business", "owner", "category", "status", "leadSource", "priority", "verification", "membership"]
  }),
  findBySlug(slug: string) {
    return crmPartners.find((partner) => partner.id === slug || toSlug(partner.business) === slug);
  },
  findFeatured() {
    return crmPartners.filter((partner) => partner.priority === "High" || partner.priority === "Urgent");
  },
  findVerified() {
    return crmPartners.filter((partner) => partner.verification === "Verified");
  },
  findTasks() {
    return crmTasks;
  },
  findNotes() {
    return crmNotes;
  },
  findTasksForPartner(partnerId: string) {
    return crmTasks.filter((task) => task.partnerId === partnerId);
  },
  findNotesForPartner(partnerId: string) {
    return crmNotes.filter((note) => note.partnerId === partnerId);
  },
  findSummaryStats() {
    return crmSummaryStats;
  }
};
