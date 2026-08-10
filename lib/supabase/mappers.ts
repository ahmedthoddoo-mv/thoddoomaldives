import type { CrmPartner } from "@/data/adminCrm";
import type { AdminManagedProperty } from "@/data/adminContent";
import type { MediaAsset } from "@/data/adminCms";
import type { Booking } from "@/types/booking";
import type { Experience } from "@/types/experience";
import type { Restaurant, RestaurantCuisine } from "@/types/restaurant";
import type { Transfer, TransferType } from "@/types/transfer";
import type { Tables } from "@/lib/supabase/types";
import type { BusinessMediaItem } from "@/types/business-media";
import {
  getCanonicalPublicMediaCover,
  getCanonicalPublicMediaGallery,
  orderPublicBusinessMedia
} from "@/lib/business-media/public";

function formatRoomPrice(value: number | null, currency: string | null) {
  return value && value > 0 ? `${currency ?? "USD"} ${Number(value).toFixed(0)}/night` : "Price on request";
}

function normalizeVerificationStatus(status: string): AdminManagedProperty["verificationStatus"] {
  if (status === "verified") return "Verified";
  if (status === "suspended") return "Suspended";
  if (status === "draft") return "Draft";
  return "Pending";
}

export function mapRoomRowToDomain(room: Tables<"rooms">): AdminManagedProperty["roomTypes"][number] {
  const metadata = room.metadata && typeof room.metadata === "object" && !Array.isArray(room.metadata)
    ? room.metadata as { featured?: unknown; quantity?: unknown; gallery?: unknown; maxGuests?: unknown }
    : {};
  return {
    id: room.id,
    name: room.name,
    price: formatRoomPrice(room.price_per_night, room.currency),
    capacity: room.capacity,
    bedType: room.bed_type ?? "",
    description: room.description ?? "",
    image: room.image_paths[0],
    amenities: room.amenities,
    breakfastIncluded: room.breakfast_included,
    adults: room.adults,
    children: room.children,
    featured: Boolean(metadata.featured),
    quantity: typeof metadata.quantity === "number" ? metadata.quantity : undefined,
    gallery: Array.isArray(room.image_paths) ? room.image_paths : []
  };
}

type PropertyMapRelations = {
  rooms?: Tables<"rooms">[];
  partner?: Tables<"partners">;
  propertyMedia?: Array<
    Tables<"property_media"> & {
      media_assets?: Tables<"media_assets"> | null;
    }
  >;
  businessMedia?: BusinessMediaItem[];
};

function getGalleryFromMedia(property: Tables<"properties">, propertyMedia: PropertyMapRelations["propertyMedia"] = []) {
  const mediaPaths = propertyMedia
    .filter((media) => media.media_assets?.path)
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((media) => media.media_assets?.path as string);
  const uniquePaths = Array.from(new Set([property.hero_image_path, ...mediaPaths]));

  return uniquePaths.length > 0 ? uniquePaths : [property.hero_image_path];
}

function galleryUrlsFromBusinessMedia(media: BusinessMediaItem[] = []) {
  const urls = orderPublicBusinessMedia(media).map((item) => item.url);
  return Array.from(new Set(urls));
}

export function mapPropertyRowToDomain(
  property: Tables<"properties">,
  relations: Tables<"rooms">[] | PropertyMapRelations = []
): AdminManagedProperty {
  const rooms = Array.isArray(relations) ? relations : relations.rooms ?? [];
  const partner = Array.isArray(relations) ? undefined : relations.partner;
  const propertyMedia = Array.isArray(relations) ? [] : relations.propertyMedia ?? [];
  const businessMedia = Array.isArray(relations) ? [] : relations.businessMedia ?? [];
  const gpsLocation =
    property.latitude !== null && property.longitude !== null ? `${property.latitude}, ${property.longitude}` : "";
  const gallery = businessMedia.length > 0 ? galleryUrlsFromBusinessMedia(businessMedia) : getGalleryFromMedia(property, propertyMedia);
  const coverImage = businessMedia.find((item) => item.isCover)?.url ?? gallery[0] ?? property.hero_image_path;
  const metadata = property.metadata && typeof property.metadata === "object" && !Array.isArray(property.metadata)
    ? property.metadata as { membership?: unknown }
    : {};
  const membership = String(metadata.membership ?? "").toLowerCase();
  return {
    id: property.id,
    name: property.name,
    slug: property.slug,
    island: property.island,
    address: property.address ?? "",
    logo: property.name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "IT",
    coverImage,
    gallery,
    media: businessMedia,
    description: property.short_description,
    shortDescription: property.short_description,
    fullDescription: property.full_description || property.short_description,
    roomTypes: rooms.map(mapRoomRowToDomain),
    amenities: property.amenities,
    policies: property.policies,
    checkIn: property.check_in_time?.slice(0, 5) ?? "",
    checkOut: property.check_out_time?.slice(0, 5) ?? "",
    whatsapp: property.whatsapp ?? partner?.whatsapp ?? "",
    email: property.email ?? partner?.email ?? "",
    website: property.website ?? partner?.website ?? "",
    googleMaps: property.address ?? "",
    googleMapsLink: gpsLocation ? `https://maps.google.com/?q=${encodeURIComponent(gpsLocation)}` : "",
    gpsLocation,
    membershipPlan: membership === "premium" ? "Premium" : membership === "free" ? "Free" : "Verified",
    verificationStatus: normalizeVerificationStatus(property.verification_status),
    isPublished: property.publication_status === "published",
    isFeatured: property.featured,
    isArchived: property.publication_status === "archived",
    seo: {
      title: property.seo_title ?? `${property.name} | iThoddoo Maldives`,
      description: property.seo_description ?? property.short_description,
      slug: property.slug
    },
    metadata: property.metadata && typeof property.metadata === "object" && !Array.isArray(property.metadata) ? property.metadata as Record<string, unknown> : {},
    updated: property.updated_at
  };
}

export function mapBookingRowToDomain(
  booking: Tables<"bookings">,
  guest?: Tables<"guests">,
  property?: Tables<"properties">,
  room?: Tables<"rooms">
): Booking {
  const checkIn = new Date(booking.check_in);
  const checkOut = new Date(booking.check_out);
  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000));

  return {
    id: booking.id,
    reference: booking.booking_reference ?? undefined,
    guest: {
      name: guest?.full_name ?? "Guest",
      email: guest?.email ?? undefined,
      whatsapp: guest?.whatsapp ?? undefined,
      adults: booking.adults,
      children: booking.children
    },
    guestRecordId: booking.guest_id,
    propertyId: booking.property_id,
    propertyName: property?.name ?? "Property",
    partnerId: booking.partner_id ?? undefined,
    roomId: booking.room_id ?? undefined,
    arrival: booking.check_in,
    departure: booking.check_out,
    roomType: room?.name ?? "Room to be confirmed",
    nights,
    services: [],
    estimatedValue: booking.quoted_amount,
    commission: {
      bookingTotal: booking.quoted_amount,
      rate: booking.commission_percent / 100,
      companyRevenue: booking.quoted_amount === null ? null : booking.company_revenue,
      partnerRevenue: booking.quoted_amount === null ? null : booking.partner_revenue
    },
    status: booking.booking_status as Booking["status"],
    paymentStatus: booking.payment_status === "demo_only" || booking.payment_status === "pending" ? "pending" : (booking.payment_status as Booking["paymentStatus"]),
    taxesFees: booking.taxes_fees,
    roomPrepared: booking.room_prepared,
    internalNotes: booking.internal_notes ?? undefined,
    source: "website"
  };
}

export function mapPartnerRowToDomain(partner: Tables<"partners">): CrmPartner {
  const category = partner.category.toLowerCase();
  const membership = String(partner.membership_plan_id ?? "verified").toLowerCase();
  return {
    id: partner.id,
    business: partner.business_name,
    owner: partner.owner_name ?? "Owner pending",
    whatsapp: partner.whatsapp ?? "",
    email: partner.email ?? "",
    website: partner.website ?? "",
    address: partner.address ?? "",
    gps: partner.latitude !== null && partner.longitude !== null ? `${partner.latitude}, ${partner.longitude}` : "",
    category: ["restaurant", "cafe"].includes(category) ? "Restaurant"
      : ["transfer", "transfer-company", "speedboat-company", "ferry-operator"].includes(category) ? "Transfer"
      : ["excursion", "excursion-operator", "dive-center", "watersports", "photographer", "farm-experience", "local-guide"].includes(category) ? "Excursion"
      : category === "shop" ? "Shop" : "Guesthouse",
    status: partner.status === "verified" ? "Verified" : partner.status === "pending" ? "Pending" : "Contacted",
    leadSource: partner.lead_source ?? "Supabase",
    priority: partner.priority === "high" ? "High" : partner.priority === "urgent" ? "Urgent" : partner.priority === "low" ? "Low" : "Medium",
    lastContact: partner.updated_at,
    nextFollowUp: "",
    notes: [],
    verification: partner.verification_status === "verified" ? "Verified" : partner.verification_status === "pending" ? "Pending" : "Unverified",
    membership: membership === "premium" ? "Premium" : membership === "free" ? "Free" : membership === "enterprise" ? "Enterprise" : "Verified"
  };
}

export function mapMediaRowToDomain(
  asset: Tables<"media_assets">,
  meta?: { isPublic?: boolean; businessType?: string; businessId?: string }
): MediaAsset {
  return {
    id: asset.id,
    filename: asset.filename,
    path: asset.path,
    category: asset.category as MediaAsset["category"],
    fileType: asset.file_type as MediaAsset["fileType"],
    width: asset.width ?? 0,
    height: asset.height ?? 0,
    fileSize: "Database asset",
    tags: [],
    caption: asset.caption ?? "",
    altText: asset.alt_text ?? "",
    uploadedDate: asset.created_at,
    updatedDate: asset.updated_at,
    usageCount: 0,
    usedBy: [],
    isHero: asset.category === "Hero",
    archived: asset.archived,
    isPublic: meta?.isPublic ?? asset.visibility === "public",
    source: "Supabase",
    rightsStatus: asset.rights_status === "permission_confirmed" ? "Permission confirmed" : "Needs confirmation"
  };
}

export function mapRestaurantRowToDomain(restaurant: Partial<Tables<"restaurants">> & Record<string, unknown>, media: BusinessMediaItem[] = []): Restaurant {
  const coverItem = getCanonicalPublicMediaCover(media);
  const galleryMedia = getCanonicalPublicMediaGallery(media);
  const gallery = galleryMedia.length > 0
    ? Array.from(new Set(galleryMedia.map((item) => item.url)))
    : restaurant.image_path
      ? [restaurant.image_path as string]
      : [];
  const image = coverItem?.url ?? (restaurant.image_path as string | undefined) ?? gallery[0] ?? "";
  const membershipTier = typeof restaurant.membership_plan_name === "string"
    ? String(restaurant.membership_plan_name).toLowerCase()
    : typeof restaurant.membership_plan_id === "string"
      ? "verified"
      : null;
  const showOriginalMenu = Boolean(restaurant.show_original_menu);
  const promotion = restaurant.promotion_title || restaurant.promotion_description || restaurant.promotion_media_url || restaurant.promotion_cta_label
    ? {
        title: typeof restaurant.promotion_title === "string" ? restaurant.promotion_title : null,
        description: typeof restaurant.promotion_description === "string" ? restaurant.promotion_description : null,
        mediaUrl: typeof restaurant.promotion_media_url === "string" ? restaurant.promotion_media_url : null,
        ctaLabel: typeof restaurant.promotion_cta_label === "string" ? restaurant.promotion_cta_label : null,
        ctaDestination: typeof restaurant.promotion_cta_destination === "string" ? restaurant.promotion_cta_destination : null,
        active: Boolean(restaurant.promotion_active),
        startsAt: typeof restaurant.promotion_start_date === "string" ? restaurant.promotion_start_date : null,
        endsAt: typeof restaurant.promotion_end_date === "string" ? restaurant.promotion_end_date : null,
        sortOrder: typeof restaurant.promotion_sort_order === "number" ? restaurant.promotion_sort_order : 0
      }
    : null;

  return {
    id: String(restaurant.id ?? ""),
    slug: String(restaurant.slug ?? ""),
    name: String(restaurant.name ?? ""),
    tagline: String(restaurant.description ?? ""),
    description: String(restaurant.description ?? ""),
    cuisine: (restaurant.cuisine as RestaurantCuisine[]) ?? [],
    location: String(restaurant.location ?? "Thoddoo, Maldives"),
    address: typeof restaurant.address === "string" ? restaurant.address : null,
    latitude: typeof restaurant.latitude === "number" ? restaurant.latitude : null,
    longitude: typeof restaurant.longitude === "number" ? restaurant.longitude : null,
    priceRange: typeof restaurant.price_range === "string" ? restaurant.price_range : "$$",
    openingHours: typeof restaurant.opening_hours === "string" ? restaurant.opening_hours : "Confirm locally",
    phone: typeof restaurant.phone === "string" ? restaurant.phone : null,
    whatsapp: typeof restaurant.whatsapp === "string" ? restaurant.whatsapp : null,
    partnerWhatsapp: typeof restaurant.partner_whatsapp === "string" ? restaurant.partner_whatsapp : null,
    email: typeof restaurant.email === "string" ? restaurant.email : null,
    website: typeof restaurant.website === "string" ? restaurant.website : null,
    instagram: typeof restaurant.instagram === "string" ? restaurant.instagram : null,
    facebook: typeof restaurant.facebook === "string" ? restaurant.facebook : null,
    image,
    gallery,
    media,
    featured: Boolean(restaurant.featured),
    publicationStatus: typeof restaurant.publication_status === "string" ? restaurant.publication_status : undefined,
    verificationStatus: typeof restaurant.verification_status === "string" ? restaurant.verification_status : undefined,
    membershipTier: membershipTier ?? null,
    membershipLabel: typeof restaurant.membership_plan_name === "string" ? String(restaurant.membership_plan_name) : null,
    showOriginalMenu,
    promotion
  };
}

export function mapExperienceRowToDomain(experience: Tables<"experiences">, media: BusinessMediaItem[] = []): Experience {
  const gallery = media.length > 0 ? galleryUrlsFromBusinessMedia(media) : experience.image_path ? [experience.image_path] : [];
  const image = media.find((item) => item.isCover)?.url ?? gallery[0] ?? experience.image_path;
  return {
    id: experience.id,
    slug: experience.slug,
    title: experience.title,
    tagline: experience.description,
    description: experience.description,
    category: experience.category as Experience["category"],
    duration: experience.duration ?? "Confirm timing",
    price: experience.price ?? "Price on request",
    image,
    gallery,
    media,
    highlights: experience.highlights,
    featured: experience.featured,
    publicationStatus: experience.publication_status,
    verificationStatus: experience.verification_status
  };
}

export function mapTransferRowToDomain(transfer: Tables<"transfers">, media: BusinessMediaItem[] = []): Transfer {
  const gallery = media.length > 0 ? galleryUrlsFromBusinessMedia(media) : transfer.image_path ? [transfer.image_path] : [];
  const image = media.find((item) => item.isCover)?.url ?? gallery[0] ?? transfer.image_path;
  return {
    id: transfer.id,
    slug: transfer.slug,
    title: transfer.title,
    type: transfer.transfer_type as TransferType,
    description: transfer.description,
    duration: transfer.duration ?? "Confirm timing",
    price: transfer.price ?? "Price on request",
    departurePoint: transfer.departure_point ?? "Confirm locally",
    arrivalPoint: transfer.arrival_point ?? "Thoddoo harbour",
    scheduleNote: transfer.schedule_note ?? "Schedules can change.",
    image,
    gallery,
    media,
    highlights: transfer.highlights,
    featured: transfer.featured,
    publicationStatus: transfer.publication_status,
    verificationStatus: transfer.verification_status
  };
}
