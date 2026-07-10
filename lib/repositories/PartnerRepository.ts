import { crmPartners } from "@/data/adminCrm";
import { createRepository } from "@/lib/repositories/types";

export const PartnerRepository = {
  ...createRepository({
    records: crmPartners,
    searchFields: ["business", "owner", "category", "membership", "verification", "status", "leadSource"]
  }),
  findBySlug(slug: string) {
    return crmPartners.find((partner) => partner.id === slug || partner.business.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug);
  },
  findFeatured() {
    return crmPartners.filter((partner) => partner.priority === "High" || partner.priority === "Urgent");
  },
  findVerified() {
    return crmPartners.filter((partner) => partner.verification === "Verified");
  }
};
