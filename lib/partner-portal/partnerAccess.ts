import "server-only";

import { redirect } from "next/navigation";
import { listManagedBusinessMedia } from "@/lib/business-media/server";
import { createVerificationDocuments } from "@/types/verification-documents";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getDataMode } from "@/lib/supabase/status";
import { mapBookingRowToDomain } from "@/lib/supabase/mappers";
import { getPartnerAuthState } from "@/lib/partner-portal/partnerAuth";
import type { Booking } from "@/types/booking";
import type { Tables } from "@/lib/supabase/types";
import type { BusinessType } from "@/types/business-type";
import type { BusinessMediaItem } from "@/types/business-media";

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

export type PartnerPortalGalleryItem = BusinessMediaItem;

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

export type PartnerPortalSource =
  | "mock"
  | "supabase"
  | "fallback"
  | "setup_required"
  | "pending"
  | "rejected"
  | "suspended"
  | "access_denied";

export type PartnerPortalData = {
  source: PartnerPortalSource;
  partnerId: string;
  propertyId: string;
  businessType: BusinessType;
  profile: PartnerPortalProfileForm;
  membership: {
    plan: string;
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

function galleryFallbackItem(path: string, businessName: string): Omit<BusinessMediaItem, "businessType" | "businessId"> {
  return {
    id: `fallback-${path}`,
    mediaAssetId: `fallback-asset-${path}`,
    url: path,
    fileName: path.split("/").filter(Boolean).at(-1) ?? "business-media.jpg",
    mimeType: "image/jpeg",
    width: null,
    height: null,
    storageBucket: null,
    storagePath: null,
    caption: `${businessName} cover image`,
    altText: businessName,
    sortOrder: 0,
    isCover: true,
    isFeatured: false,
    isPublic: true,
    mediaPurpose: "gallery",
    source: "legacy"
  };
}

export function getPartnerAccessState(partner: Tables<"partners"> | null | undefined): Exclude<PartnerPortalSource, "mock" | "supabase" | "fallback" | "setup_required"> | "dashboard" {
  if (!partner) return "access_denied";
  if (partner.editing_suspended || partner.status === "suspended" || partner.verification_status === "suspended") return "suspended";
  if (partner.verification_status === "rejected" || partner.status === "archived") return "rejected";
  if (["new_lead", "contacted", "pending"].includes(partner.status) || ["pending", "unverified"].includes(partner.verification_status)) return "pending";
  if (partner.status === "verified" || partner.verification_status === "verified") return "dashboard";
  return "access_denied";
}

function getRestrictedPortalData(
  source: Exclude<PartnerPortalSource, "mock" | "supabase" | "fallback">,
  email: string | null,
  partner?: Tables<"partners"> | null
): PartnerPortalData {
  const businessName = partner?.business_name ?? (source === "access_denied" ? "Access denied" : "Review in progress");
  const base = getAccountSetupPortalData(email, source);
  return {
    ...base,
    source,
    profile: {
      ...base.profile,
      businessName,
      email: email ?? base.profile.email
    },
    verification: {
      ...base.verification,
      status: source === "rejected" || source === "suspended"
        ? "Rejected"
        : source === "pending"
          ? "Pending"
          : "Missing",
      adminNotes: [
        source === "pending"
          ? "Your partner account is under review. The team will contact you once the review is complete."
          : source === "rejected"
            ? "This partner account was not approved. Please contact support for next steps."
            : source === "suspended"
              ? "This partner account is suspended. Contact support to resolve the issue."
              : "This account is not linked to an approved partner record."
      ]
    },
    membership: {
      ...base.membership,
      status: source === "pending" ? "Under review" : source === "rejected" ? "Rejected" : source === "suspended" ? "Suspended" : base.membership.status
    }
  };
}

function getAccountSetupPortalData(email: string | null, source: PartnerPortalData["source"] = "setup_required"): PartnerPortalData {
  return {
    source,
    partnerId: "",
    propertyId: "",
    businessType: "guesthouse",
    profile: {
      businessName: source === "fallback" ? "Data unavailable" : "Account setup required",
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
      adminNotes: [source === "fallback" ? "The live partner data query failed. No fallback records were loaded." : "This authenticated account is not linked to an approved business yet."]
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
    return getRestrictedPortalData("access_denied", authState.email);
  }
  const accessState = getPartnerAccessState(authState.partner);
  if (accessState !== "dashboard") {
    return getRestrictedPortalData(accessState, authState.email, authState.partner);
  }
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return getAccountSetupPortalData(authState.email, "fallback");
  }

  try {
    const db = supabase;
    const [{ data: membershipPlan, error: membershipError }, { data: linkedApplication, error: applicationError }] = await Promise.all([
      authState.partner.membership_plan_id
        ? db.from("membership_plans").select("name").eq("id", authState.partner.membership_plan_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      db.from("partner_applications").select("id, business_type, listing_id, listing_type, submitted_at")
        .eq("partner_id", authState.partner.id).order("submitted_at", { ascending: false }).limit(1).maybeSingle()
    ]);
    if (membershipError) throw membershipError;
    if (applicationError) throw applicationError;

    const { data: propertyData, error: propertyError } = await db
      .from("properties")
      .select("*, partners(*), rooms(*), property_media(usage, sort_order, media_assets(*))")
      .eq("partner_id", authState.partner.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (propertyError) throw propertyError;
    const property = propertyData as unknown as PartnerPropertyWithRelations | null;
    if (!property) {
      const listingType = linkedApplication?.listing_type;
      const listingId = linkedApplication?.listing_id;
      if (!listingId || !["transfer", "experience", "restaurant"].includes(listingType ?? "")) return getAccountSetupPortalData(authState.email);
      const managedBusinessType = listingType as "transfer" | "experience" | "restaurant";
      const listingResult = listingType === "transfer"
        ? await db.from("transfers").select("*").eq("id", listingId).eq("partner_id", authState.partner.id).maybeSingle()
        : listingType === "experience"
          ? await db.from("experiences").select("*").eq("id", listingId).eq("partner_id", authState.partner.id).maybeSingle()
          : await db.from("restaurants").select("*").eq("id", listingId).eq("partner_id", authState.partner.id).maybeSingle();
      if (listingResult.error) throw listingResult.error;
      if (!listingResult.data) return getAccountSetupPortalData(authState.email);
      const listing = listingResult.data as unknown as Record<string, unknown>;
      const [{ data: serviceItems, error: serviceError }, gallery, { data: bookings, error: bookingError }] = await Promise.all([
        db.from("partner_service_items").select("*").eq("partner_id", authState.partner.id).order("sort_order", { ascending: true }),
        listManagedBusinessMedia(db, managedBusinessType, listingId),
        db.from("bookings").select("*, guests(*), properties(*), rooms(*)").eq("partner_id", authState.partner.id).neq("payment_status", "demo_only").order("created_at", { ascending: false })
      ]);
      if (serviceError) throw serviceError;
      if (bookingError) throw bookingError;
      const name = String(listing.name ?? listing.title ?? authState.partner.business_name);
      const description = String(listing.description ?? "");
      const image = String(listing.image_path ?? "");
      const services = ((serviceItems ?? []) as Tables<"partner_service_items">[]).map((item) => ({
        id: item.id, title: item.title, description: item.description ?? "", price: item.price === null ? "" : String(item.price),
        currency: item.currency === "MVR" ? "MVR" as const : "USD" as const, unit: item.unit as PartnerPortalServiceItem["unit"],
        childPrice: item.child_price === null ? "" : String(item.child_price), notes: item.notes ?? "", active: item.active,
        sortOrder: item.sort_order, metadata: parseJsonRecord(item.metadata)
      }));
      return {
        source: "supabase", partnerId: authState.partner.id, propertyId: listingId,
        businessType: linkedApplication.business_type as BusinessType,
        profile: { businessName: name, shortDescription: description, description, address: String(listing.location ?? authState.partner.address ?? ""), googleMaps: "",
          whatsapp: authState.partner.whatsapp ?? "", email: authState.partner.email ?? authState.email ?? "", website: authState.partner.website ?? "",
          instagram: "", facebook: "", operatingHours: String(listing.opening_hours ?? listing.schedule_note ?? ""), languages: [], amenities: [], policies: [],
          seoTitle: `${name} | iThoddoo Maldives`, seoDescription: description },
        membership: { plan: membershipPlan?.name ?? "Free", renewalDate: "Not configured", status: membershipPlan ? "Active" : "Not configured" },
        verification: { status: listing.verification_status === "verified" ? "Verified" : "Pending", completion: 100, missingDocuments: [], adminNotes: [] },
        services, gallery: gallery.length ? gallery : image ? [{ ...galleryFallbackItem(image, name), businessType: managedBusinessType, businessId: listingId }] : [],
        documents: [], bookings: ((bookings ?? []) as unknown as BookingWithRelations[]).map((booking) => mapBookingRowToDomain(booking, booking.guests ?? undefined, booking.properties ?? undefined, booking.rooms ?? undefined)), notifications: []
      };
    }
    if (property.partner_id !== authState.partner.id) throw new Error("Partner property scope mismatch.");

    const [{ data: serviceItems, error: serviceError }, { data: documents, error: documentError }, { data: notifications, error: notificationError }, { data: bookings, error: bookingError }] = await Promise.all([
      db.from("partner_service_items").select("*").eq("partner_id", property.partner_id).order("sort_order", { ascending: true }),
      db.from("partner_documents").select("*").eq("partner_id", property.partner_id).order("created_at", { ascending: true }),
      db.from("partner_notifications").select("*").eq("partner_id", property.partner_id).order("created_at", { ascending: false }),
      db.from("bookings").select("*, guests(*), properties(*), rooms(*)").eq("partner_id", property.partner_id).neq("payment_status", "demo_only").order("created_at", { ascending: false })
    ]);
    if (serviceError) throw serviceError;
    if (documentError) throw documentError;
    if (notificationError) throw notificationError;
    if (bookingError) throw bookingError;

    const socialLinks = parseJsonRecord(property.social_links);
    const gallery = await listManagedBusinessMedia(db, "property", property.id);
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
    const bookingRows = ((bookings ?? []) as unknown as BookingWithRelations[]).map((booking) =>
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
        plan: membershipPlan?.name ?? "Free",
        renewalDate: "Not configured",
        status: membershipPlan ? "Active" : "Not configured"
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
      gallery: gallery.length > 0 ? gallery : [{ ...galleryFallbackItem(property.hero_image_path, property.name), businessType: "property", businessId: property.id }],
      documents: resolvedDocuments,
      bookings: bookingRows,
      notifications: ((notifications ?? []) as Tables<"partner_notifications">[]).map(mapNotification)
    };
  } catch {
    console.error("[partner-portal-read] Failed to load partner portal data.");
    return getAccountSetupPortalData(authState.email, "fallback");
  }
}

export async function getAuthorizedPartnerScope() {
  if (getDataMode() !== "supabase") {
    return { mode: "setup_required" as const, partnerId: "", partnerSlug: "", propertyId: "", propertySlug: "", listingId: "", listingType: "" };
  }

  const authState = await getPartnerAuthState();
  if (authState.status !== "authenticated") {
    return { mode: "unauthenticated" as const, partnerId: "", partnerSlug: "", propertyId: "", propertySlug: "", listingId: "", listingType: "" };
  }
  if (!authState.partner) {
    return { mode: "access_denied" as const, partnerId: "", partnerSlug: "", propertyId: "", propertySlug: "", listingId: "", listingType: "", authUserId: authState.userId };
  }
  const accessState = getPartnerAccessState(authState.partner);
  if (accessState !== "dashboard") {
    return {
      mode: accessState,
      partnerId: authState.partner.id,
      partnerSlug: authState.partner.slug,
      propertyId: "",
      propertySlug: "",
      listingId: "",
      listingType: "",
      authUserId: authState.userId
    };
  }

  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return { mode: "unavailable" as const, partnerId: "", partnerSlug: "", propertyId: "", propertySlug: "", listingId: "", listingType: "" };
  }

  const { data: property } = await supabase
    .from("properties")
    .select("id, slug, partner_id")
    .eq("partner_id", authState.partner.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!property || property.partner_id !== authState.partner.id) {
    const { data: application } = await supabase.from("partner_applications")
      .select("listing_id, listing_type").eq("partner_id", authState.partner.id)
      .not("listing_id", "is", null).order("submitted_at", { ascending: false }).limit(1).maybeSingle();
    if (application?.listing_id && ["transfer", "experience", "restaurant"].includes(application.listing_type ?? "")) {
      const table = application.listing_type === "transfer" ? "transfers" : application.listing_type === "experience" ? "experiences" : "restaurants";
      const { data: listing } = await supabase.from(table).select("id, partner_id").eq("id", application.listing_id).eq("partner_id", authState.partner.id).maybeSingle();
      if (listing) return { mode: "supabase" as const, partnerId: authState.partner.id, partnerSlug: authState.partner.slug, propertyId: "", propertySlug: "", listingId: listing.id, listingType: application.listing_type ?? "", authUserId: authState.userId };
    }
    return {
      mode: "setup_required" as const,
      partnerId: authState.partner.id,
      partnerSlug: authState.partner.slug,
      propertyId: "",
      propertySlug: "",
      listingId: "",
      listingType: "",
      authUserId: authState.userId
    };
  }

  return {
    mode: "supabase" as const,
    partnerId: property.partner_id as string,
    propertyId: property.id as string,
    partnerSlug: authState.partner.slug,
    propertySlug: property.slug as string,
    listingId: property.id as string,
    listingType: "property",
    authUserId: authState.userId
  };
}
