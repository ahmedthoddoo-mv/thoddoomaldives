import type { CrmPartner } from "@/data/adminCrm";
import { PartnerRepository } from "@/lib/repositories";
import { exportToCsv, mapCsvRows, parseCsv } from "@/lib/csv/csv";

type PartnerCsvRow = {
  id: string;
  business: string;
  owner: string;
  whatsapp: string;
  email: string;
  category: string;
  status: string;
  membership: string;
  verification: string;
};

const partnerColumns: Array<keyof PartnerCsvRow> = [
  "id",
  "business",
  "owner",
  "whatsapp",
  "email",
  "category",
  "status",
  "membership",
  "verification"
];

export function exportPartnersToCsv() {
  const rows = PartnerRepository.findAll().map<PartnerCsvRow>((partner) => ({
    id: partner.id,
    business: partner.business,
    owner: partner.owner,
    whatsapp: partner.whatsapp,
    email: partner.email,
    category: partner.category,
    status: partner.status,
    membership: partner.membership,
    verification: partner.verification
  }));

  return exportToCsv(rows, partnerColumns);
}

export function parsePartnerCsv(text: string): Array<Partial<CrmPartner>> {
  return mapCsvRows(parseCsv(text), (row) => ({
    id: row.id,
    business: row.business,
    owner: row.owner,
    whatsapp: row.whatsapp,
    email: row.email,
    category: row.category as CrmPartner["category"],
    status: row.status as CrmPartner["status"],
    membership: row.membership as CrmPartner["membership"],
    verification: row.verification as CrmPartner["verification"]
  }));
}
