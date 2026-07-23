import "server-only";

import { redirect } from "next/navigation";
import { createVerificationDocuments } from "@/types/verification-documents";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getDataMode } from "@/lib/supabase/status";
import { mapBookingRowToDomain } from "@/lib/supabase/mappers";
import { getPartnerAuthState } from "@/lib/partner-portal/partnerAuth";
import type { Booking } from "@/types/booking";
import type { Tables } from "@/lib/supabase/types";

export type PartnerPortalProfileForm = {
  businessName: string;
  shortDescription: string;
  description: string;
  address: string;
  googleMaps: string;
  whatsapp: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  operatingHours: string;
  languages: string[];
  amenities: string[];
  policies: string[];
  seoTitle: string;
  seoDescription: string;
};

export type PartnerPortalServiceItem = {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: "USD" | "MVR";
  unit: "per night" | "per person" | "per trip" | "per hour" | "per transfer" | "per package";
  childPrice: string;
  notes: string;
  active: boolean;
  sortOrder: number;
  metadata: Record<string, string>;
};

export type PartnerPortalGalleryItem = {
  id: string;
  path: string;
  caption: string;
  altText: string;
  usage: "logo" | "cover" | "hero" | "gallery" | "video";
  sortOrder: number;
};

export type PartnerPortalDocument = {
  id: string;
  key: string;
  label: string;
  required: boolean;
  fileName: string;
  storagePath: string;
  status: "uploaded" | "pending" | "approved" | "rejected" | "expired" | "missing";
  expiryDate: string;
  adminNote: string;
};

export type PartnerPortalNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  status: "unread" | "read" | "archived";
  createdAt: string;
  actionHref?: string;
};

export type PartnerPortalData = {
  source: "mock" | "supabase" | "fallback" | "setup_required";
  partnerId: string;
  propertyId: string;
  businessType: "guesthouse";
  profile: PartnerPortalProfileForm;
  membership: {
    plan: "Free" | "Verified" | "Premium";
    renewalDate: string;
    status: string;
  };
  verification: {
    status: "Verified" | "Pending" | "Rejected" | "Missing";
    completion: number;
    missingDocuments: string[];
    adminNotes: string[];
  };
  services: PartnerPortalServiceItem[];
  gallery: PartnerPortalGalleryItem[];
  documents: PartnerPortalDocument[];
  bookings: Booking[];
  notifications: PartnerPortalNotification[];
};

type BookingWithRelations = Tables<"bookings"> & {
  guests?: Tables<"guests"> | null;
  properties?: Tables<"properties"> | null;
  rooms?: Tables<"rooms"> | null;
};

type PropertyMediaWithAsset = {
  usage: string;
  sort_order: number;
  media_assets: Tables<"media_assets"> | null;
};

type PartnerPropertyWithRelations = Tables<"properties"> & {
  partners: Tables<"partners"> | null;
  rooms: Tables<"rooms">[];
  property_media: PropertyMediaWithAsset[];
};

function parseJsonRecord(value: unknown): Record<string, string> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, string>) : {};
}

function getAccountSetupPortalData(email: string | null): PartnerPortalData {
  return {
    source: "setup_required",
    partnerId: "",
    propertyId: "",
    businessType: "guesthouse",
    profile: {
      businessName: "Account setup required",
      shortDescription: "",
      description: "",
      address: "",
      googleMaps: "",
      whatsapp: "",
      email: email ?? "",
      website: "",
      instagram: "",
      facebook: "",
      operatingHours: "",
      languages: [],
      amenities: [],
      policies: [],
      seoTitle: "",
      seoDescription: ""
    },
    membership: {
      plan: "Free",
      renewalDate: "Pending",
      status: "Setup required"
    },
    verification: {
      status: "Missing",
      completion: 0,
      missingDocuments: ["Linked partner record"],
      adminNotes: ["This authenticated account is not linked to an approved business yet."]
    },
    services: [],
    gallery: [],
    documents: [],
    bookings: [],
    notifications: []
  };
}

function mapServiceFromRoom(room: Tables<"rooms">, sortOrder: number): PartnerPortalServiceItem {
  return {
    id: room.id,
    title: room.name,
    description: room.description ?? "",
    price: String(room.price_per_night ?? ""),
    currency: "USD",
    unit: "per night",
    childPrice: "",
    notes: room.breakfast_included ? "Breakfast included" : "",
    active: room.active,
    sortOrder,
    metadata: {
      capacity: room.capacity,
      adults: String(room.adults),
      children: String(room.children),
      bedType: room.bed_type ?? "",
      breakfast: room.breakfast_included ? "Included" : "Not included",
      availability: room.active ? "Available" : "Blocked"
    }
  };
}

function mapDocument(row: Tables<"partner_documents">): PartnerPortalDocument {
  return {
    id: row.id,
    key: row.document_key,
    label: row.document_label,
    required: row.required,
    fileName: row.file_name ?? "",
    storagePath: row.storage_path ?? "",
    status: ["uploaded", "pending", "approved", "rejected", "expired", "missing"].includes(row.status)
      ? (row.status as PartnerPortalDocument["status"])
      : "pending",
    expiryDate: row.expiry_date ?? "",
    adminNote: row.admin_note ?? ""
  };
}

function mapNotification(row: Tables<"partner_notifications">): PartnerPortalNotification {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.notification_type,
    status: ["unread", "read", "archived"].includes(row.status) ? (row.status as PartnerPortalNotification["status"]) : "unread",
    createdAt: row.created_at,
    actionHref: row.action_href ?? undefined
  };
}

export async function getCurrentPartnerPortalData(): Promise<PartnerPortalData> {
  if (getDataMode() !== "supabase") {
    return getAccountSetupPortalData(null);
  }

  const authState = await getPartnerAuthState();
  if (authState.status === "unauthenticated") {
    redirect("/partner/login");
  }
  if (authState.status !== "authenticated") {
    return getAccountSetupPortalData(null);
  }
  if (!authState.partner) {
    return getAccountSetupPortalData(authState.email);
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return getAccountSetupPortalData(authState.email);
  }

  try {
    const db = supabase;
    const { data: propertyData, error: propertyError } = await db
      .from("properties")
      .select("*, partners(*), rooms(*), property_media(usage, sort_order, media_assets(*))")
      .eq("partner_id", authState.partner.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (propertyError) throw propertyError;
    const property = propertyData as unknown as PartnerPropertyWithRelations | null;
    if (!property) return getAccountSetupPortalData(authState.email);
    if (property.partner_id !== authState.partner.id) throw new Error("Partner property scope mismatch.");

    const [{ data: serviceItems }, { data: documents }, { data: notifications }, { data: bookings }] = await Promise.all([
      db.from("partner_service_items").select("*").eq("partner_id", property.partner_id).order("sort_order", { ascending: true }),
      db.from("partner_documents").select("*").eq("partner_id", property.partner_id).order("created_at", { ascending: true }),
      db.from("partner_notifications").select("*").eq("partner_id", property.partner_id).order("created_at", { ascending: false }),
      db.from("bookings").select("*, guests(*), properties(*), rooms(*)").eq("partner_id", property.partner_id).order("created_at", { ascending: false })
    ]);

    const socialLinks = parseJsonRecord(property.social_links);
    const propertyMedia = Array.isArray(property.property_media) ? property.property_media : [];
    const gallery = propertyMedia.map((item: PropertyMediaWithAsset, index: number) => ({
      id: item.media_assets?.id ?? `${property.id}-media-${index}`,
      path: item.media_assets?.path ?? property.hero_image_path,
      caption: item.media_assets?.caption ?? item.usage,
      altText: item.media_assets?.alt_text ?? property.name,
      usage: item.usage === "hero" ? "hero" : "gallery",
      sortOrder: item.sort_order ?? index
    })) as PartnerPortalGalleryItem[];
    const roomServices = (property.rooms ?? []).map(mapServiceFromRoom);
    const serviceRows = ((serviceItems ?? []) as Tables<"partner_service_items">[]).map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      price: item.price === null ? "" : String(item.price),
      currency: (item.currency === "MVR" ? "MVR" : "USD") as PartnerPortalServiceItem["currency"],
      unit: item.unit as PartnerPortalServiceItem["unit"],
      childPrice: item.child_price === null ? "" : String(item.child_price),
      notes: item.notes ?? "",
      active: item.active,
      sortOrder: item.sort_order,
      metadata: parseJsonRecord(item.metadata)
    }));
    const documentRows = ((documents ?? []) as Tables<"partner_documents">[]).map(mapDocument);
    const resolvedDocuments =
      documentRows.length > 0
        ? documentRows
        : createVerificationDocuments("guesthouse").map((document) => ({
            id: document.key,
            key: document.key,
            label: document.label,
            required: document.required,
            fileName: "",
            storagePath: "",
            status: "missing" as const,
            expiryDate: "",
            adminNote: ""
          }));
    const requiredDocuments = resolvedDocuments.filter((document) => document.required);
    const completedDocuments = requiredDocuments.filter((document) => document.status === "approved" || document.status === "uploaded");
    const bookingRows = ((bookings ?? []) as BookingWithRelations[]).map((booking) =>
      mapBookingRowToDomain(booking, booking.guests ?? undefined, booking.properties ?? undefined, booking.rooms ?? undefined)
    );

    return {
      source: "supabase",
      partnerId: property.partner_id,
      propertyId: property.id,
      businessType: "guesthouse",
      profile: {
        businessName: property.name,
        shortDescription: property.short_description,
        description: property.full_description ?? property.short_description,
        address: property.address ?? "",
        googleMaps: property.google_maps_link ?? "",
        whatsapp: property.whatsapp ?? property.partners?.whatsapp ?? "",
        email: property.email ?? property.partners?.email ?? "",
        website: property.website ?? property.partners?.website ?? "",
        instagram: socialLinks.instagram ?? "",
        facebook: socialLinks.facebook ?? "",
        operatingHours: property.operating_hours ?? "",
        languages: property.languages ?? [],
        amenities: property.amenities ?? [],
        policies: property.policies ?? [],
        seoTitle: property.seo_title ?? `${property.name} | iThoddoo Maldives`,
        seoDescription: property.seo_description ?? property.short_description
      },
      membership: {
        plan: property.verification_status === "verified" ? "Premium" : "Verified",
        renewalDate: "2026-08-01",
        status: "Active"
      },
      verification: {
        status: property.verification_status === "verified" ? "Verified" : property.verification_status === "rejected" ? "Rejected" : "Pending",
        completion: Math.round((completedDocuments.length / Math.max(1, requiredDocuments.length)) * 100),
        missingDocuments: requiredDocuments
          .filter((document) => document.status === "missing" || document.status === "rejected" || document.status === "pending")
          .map((document) => document.label),
        adminNotes: resolvedDocuments.map((document) => document.adminNote).filter(Boolean)
      },
      services: serviceRows.length > 0 ? serviceRows : roomServices,
      gallery: gallery.length > 0 ? gallery : [{ id: "hero", path: property.hero_image_path, caption: "Hero image", altText: property.name, usage: "hero", sortOrder: 0 }],
      documents: resolvedDocuments,
      bookings: bookingRows,
      notifications: ((notifications ?? []) as Tables<"partner_notifications">[]).map(mapNotification)
    };
  } catch {
    return getAccountSetupPortalData(authState.email);
  }
}

export async function getAuthorizedPartnerScope() {
  if (getDataMode() !== "supabase") {
    return { mode: "setup_required" as const, partnerId: "", partnerSlug: "", propertyId: "", propertySlug: "" };
  }

  const authState = await getPartnerAuthState();
  if (authState.status !== "authenticated") {
    return { mode: "unauthenticated" as const, partnerId: "", partnerSlug: "", propertyId: "", propertySlug: "" };
  }
  if (!authState.partner) {
    return { mode: "setup_required" as const, partnerId: "", partnerSlug: "", propertyId: "", propertySlug: "", authUserId: authState.userId };
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return { mode: "unavailable" as const, partnerId: "", partnerSlug: "", propertyId: "", propertySlug: "" };
  }

  const { data: property } = await supabase
    .from("properties")
    .select("id, slug, partner_id")
    .eq("partner_id", authState.partner.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!property || property.partner_id !== authState.partner.id) {
    return {
      mode: "setup_required" as const,
      partnerId: authState.partner.id,
      partnerSlug: authState.partner.slug,
      propertyId: "",
      propertySlug: "",
      authUserId: authState.userId
    };
  }

  return {
    mode: "supabase" as const,
    partnerId: property.partner_id as string,
    propertyId: property.id as string,
    partnerSlug: authState.partner.slug,
    propertySlug: property.slug as string
  };
}
