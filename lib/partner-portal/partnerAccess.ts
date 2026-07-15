import "server-only";

import { redirect } from "next/navigation";
import { adminManagedProperties } from "@/data/adminContent";
import { partnerBookings, partnerGallery, partnerProfile, partnerRooms } from "@/data/partnerPortal";
import { createVerificationDocuments } from "@/types/verification-documents";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getDataMode } from "@/lib/supabase/status";
import { mapBookingRowToDomain } from "@/lib/supabase/mappers";
import { getPartnerAuthState } from "@/lib/partner-portal/partnerAuth";
import type { Booking } from "@/types/booking";
import type { Tables } from "@/lib/supabase/types";

const mockPartnerScope = {
  partnerId: "10000000-0000-0000-0000-000000000001",
  partnerSlug: "thoddoo-sun-sky-inn",
  propertyId: "20000000-0000-0000-0000-000000000001",
  propertySlug: "thoddoo-sun-sky-inn"
};

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

function parseJsonRecord(value: unknown): Record<string, string> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, string>) : {};
}

function priceToNumber(value: string) {
  const match = value.match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

function getMockPortalData(): PartnerPortalData {
  const property = adminManagedProperties[0];
  const documents: PartnerPortalDocument[] = createVerificationDocuments("guesthouse").map((document, index) => ({
    id: document.key,
    key: document.key,
    label: document.label,
    required: document.required,
    fileName: index < 4 ? `${document.key}.pdf` : "",
    storagePath: index < 4 ? `partner-verification-documents/${property.slug}/${document.key}.pdf` : "",
    status: index < 4 ? ("approved" as const) : ("missing" as const),
    expiryDate: "",
    adminNote: index < 4 ? "Approved in demo workflow." : "Upload required before renewal."
  }));
  const required = documents.filter((document) => document.required);
  const approved = required.filter((document) => document.status === "approved" || document.status === "uploaded");

  return {
    source: "mock",
    partnerId: "partner-thoddoo-sun-sky",
    propertyId: property.id,
    businessType: "guesthouse",
    profile: {
      businessName: property.name,
      shortDescription: property.shortDescription,
      description: property.fullDescription,
      address: property.address,
      googleMaps: property.googleMapsLink,
      whatsapp: property.whatsapp,
      email: property.email,
      website: property.website,
      instagram: "instagram.com/thoddoosunsky",
      facebook: "facebook.com/thoddoosunsky",
      operatingHours: "Daily, guest support by WhatsApp",
      languages: partnerProfile.languages,
      amenities: property.amenities,
      policies: property.policies,
      seoTitle: property.seo.title,
      seoDescription: property.seo.description
    },
    membership: {
      plan: property.membershipPlan,
      renewalDate: "2026-08-01",
      status: partnerProfile.renewalStatus
    },
    verification: {
      status: property.verificationStatus === "Verified" ? "Verified" : "Pending",
      completion: Math.round((approved.length / Math.max(1, required.length)) * 100),
      missingDocuments: required.filter((document) => document.status === "missing").map((document) => document.label),
      adminNotes: ["Local team approved core documents in demo mode."]
    },
    services: partnerRooms.map((room, index) => ({
      id: room.id,
      title: room.name,
      description: room.amenities.join(", "),
      price: String(priceToNumber(room.price)),
      currency: "USD",
      unit: "per night",
      childPrice: "",
      notes: `${room.seasonalPrice}. ${room.discount}`,
      active: room.availability !== "Blocked",
      sortOrder: index,
      metadata: {
        capacity: room.capacity,
        availability: room.availability,
        breakfast: room.amenities.includes("Breakfast") ? "Included" : "Confirm"
      }
    })),
    gallery: partnerGallery.map((image, index) => ({
      id: image.id,
      path: image.path,
      caption: image.caption,
      altText: image.caption,
      usage: image.isHero ? "hero" : "gallery",
      sortOrder: index
    })),
    documents,
    bookings: [],
    notifications: [
      {
        id: "notification-approved",
        title: "Application approved",
        body: "Your business is verified and visible on iThoddoo Maldives.",
        type: "verification",
        status: "unread",
        createdAt: "2026-07-14T10:00:00.000Z",
        actionHref: "/partner/verification"
      },
      {
        id: "notification-booking",
        title: "Booking received",
        body: `${partnerBookings[1]?.guest ?? "Guest"} has a pending family booking request.`,
        type: "booking",
        status: "unread",
        createdAt: "2026-07-15T09:00:00.000Z",
        actionHref: "/partner/bookings"
      },
      {
        id: "notification-invoice",
        title: "Invoice due",
        body: "Premium membership invoice placeholder is ready for review.",
        type: "membership",
        status: "read",
        createdAt: "2026-07-10T09:00:00.000Z",
        actionHref: "/partner/membership"
      }
    ]
  };
}

function getAccountSetupPortalData(email: string | null): PartnerPortalData {
  const mock = getMockPortalData();
  return {
    ...mock,
    source: "setup_required",
    partnerId: "",
    propertyId: "",
    profile: {
      ...mock.profile,
      businessName: "Account setup required",
      email: email ?? ""
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
      adminNotes: ["Your authenticated account is not linked to a partner record yet."]
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
    return getMockPortalData();
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
    return { ...getMockPortalData(), source: "fallback" };
  }

  try {
    const db = supabase as any;
    const { data: property, error: propertyError } = await db
      .from("properties")
      .select("*, partners(*), rooms(*), property_media(usage, sort_order, media_assets(*))")
      .eq("partner_id", authState.partner.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (propertyError) throw propertyError;
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
    const gallery = propertyMedia.map((item: any, index: number) => ({
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
      currency: item.currency === "MVR" ? "MVR" : "USD",
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
    return { mode: "mock" as const, ...mockPartnerScope };
  }

  const authState = await getPartnerAuthState();
  if (authState.status !== "authenticated") {
    return { mode: "unauthenticated" as const, ...mockPartnerScope };
  }
  if (!authState.partner) {
    return { mode: "setup_required" as const, ...mockPartnerScope, authUserId: authState.userId };
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return { mode: "unavailable" as const, ...mockPartnerScope };
  }

  const { data: property } = await (supabase as any)
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
