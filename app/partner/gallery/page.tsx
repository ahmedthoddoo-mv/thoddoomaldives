import type { Metadata } from "next";
import { PartnerGalleryManager } from "@/components/partner-portal/PartnerGalleryManager";
import { PartnerPortalShell } from "@/components/partner-portal/PartnerPortalShell";

export const metadata: Metadata = {
  title: "Partner Gallery"
};

export default function PartnerGalleryPage() {
  return (
    <PartnerPortalShell title="Gallery" subtitle="Browse gallery media, choose a hero image, reorder images, delete demo items, and stage uploads.">
      <PartnerGalleryManager />
    </PartnerPortalShell>
  );
}
