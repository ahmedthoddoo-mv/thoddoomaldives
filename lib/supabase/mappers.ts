import type { CrmPartner } from "@/data/adminCrm";
import type { AdminManagedProperty } from "@/data/adminContent";
import type { MediaAsset } from "@/data/adminCms";
import type { Booking } from "@/types/booking";
import type { Experience } from "@/types/experience";
import type { Restaurant, RestaurantCuisine } from "@/types/restaurant";
import type { Transfer, TransferType } from "@/types/transfer";
import type { Tables } from "@/lib/supabase/types";

function formatUsd(value: number | null) {
  return value ? `From $${Number(value).toFixed(0)}/night` : "Price on request";
}

function parseCapacityAdults(capacity: string | null) {
  const match = capacity?.match(/\d+/);
  return match ? Number(match[0]) : 2;
}

function normalizeVerificationStatus(status: string): AdminManagedProperty["verificationStatus"] {
  if (status === "verified") return "Verified";
  if (status === "suspended") return "Suspended";
  if (status === "draft") return "Draft";
  return "Pending";
}

export function mapRoomRowToDomain(room: Tables<"rooms">): AdminManagedProperty["roomTypes"][number] {
  return {
    name: room.name,
    price: formatUsd(room.price_per_night),
    capacity: room.capacity
  };
}

export function mapPropertyRowToDomain(
  property: Tables<"properties">,
  rooms: Tables<"rooms">[] = []
): AdminManagedProperty {
  const gpsLocation =
    property.latitude !== null && property.longitude !== null ? `${property.latitude}, ${property.longitude}` : "";

  return {
    id: property.id,
    name: property.name,
    slug: property.slug,
    island: property.island,
    address: property.address ?? "",
    logo: property.name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "IT",
    coverImage: property.hero_image_path,
    gallery: [property.hero_image_path],
    description: property.short_description,
    shortDescription: property.short_description,
    fullDescription: property.full_description ?? property.short_description,
    roomTypes: rooms.map(mapRoomRowToDomain),
    amenities: [],
    policies: [],
    checkIn: property.check_in_time?.slice(0, 5) ?? "",
    checkOut: property.check_out_time?.slice(0, 5) ?? "",
    whatsapp: property.whatsapp ?? "",
    email: property.email ?? "",
    website: property.website ?? "",
    googleMaps: property.address ?? "",
    googleMapsLink: gpsLocation ? `https://maps.google.com/?q=${encodeURIComponent(gpsLocation)}` : "",
    gpsLocation,
    membershipPlan: "Verified",
    verificationStatus: normalizeVerificationStatus(property.verification_status),
    isPublished: property.publication_status === "published",
    isFeatured: property.featured,
    isArchived: property.publication_status === "archived",
    seo: {
      title: property.seo_title ?? `${property.name} | iThoddoo Maldives`,
      description: property.seo_description ?? property.short_description,
      slug: property.slug
    },
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
    arrival: booking.check_in,
    departure: booking.check_out,
    roomType: room?.name ?? "Room to be confirmed",
    nights,
    services: [],
    estimatedValue: booking.booking_total,
    commission: {
      bookingTotal: booking.booking_total,
      rate: booking.commission_percent / 100,
      companyRevenue: booking.company_revenue,
      partnerRevenue: booking.partner_revenue
    },
    status: booking.booking_status as Booking["status"],
    paymentStatus: booking.payment_status === "demo_only" ? "demo-only" : (booking.payment_status as Booking["paymentStatus"]),
    source: "website"
  };
}

export function mapPartnerRowToDomain(partner: Tables<"partners">): CrmPartner {
  return {
    id: partner.id,
    business: partner.business_name,
    owner: partner.owner_name ?? "Owner pending",
    whatsapp: partner.whatsapp ?? "",
    email: partner.email ?? "",
    website: partner.website ?? "",
    address: partner.address ?? "",
    gps: partner.latitude !== null && partner.longitude !== null ? `${partner.latitude}, ${partner.longitude}` : "",
    category: partner.category === "restaurant" ? "Restaurant" : partner.category === "transfer" ? "Transfer" : partner.category === "excursion" ? "Excursion" : partner.category === "shop" ? "Shop" : "Guesthouse",
    status: partner.status === "verified" ? "Verified" : partner.status === "pending" ? "Pending" : "Contacted",
    leadSource: partner.lead_source ?? "Supabase",
    priority: partner.priority === "high" ? "High" : partner.priority === "urgent" ? "Urgent" : partner.priority === "low" ? "Low" : "Medium",
    lastContact: partner.updated_at,
    nextFollowUp: "",
    notes: [],
    verification: partner.verification_status === "verified" ? "Verified" : partner.verification_status === "pending" ? "Pending" : "Unverified",
    membership: "Verified"
  };
}

export function mapMediaRowToDomain(asset: Tables<"media_assets">): MediaAsset {
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
    source: "Supabase",
    rightsStatus: asset.rights_status === "needs_confirmation" ? "Needs confirmation" : asset.rights_status === "permission_confirmed" ? "Permission confirmed" : "Internal demo asset"
  };
}

export function mapRestaurantRowToDomain(restaurant: Tables<"restaurants">): Restaurant {
  return {
    id: restaurant.id,
    slug: restaurant.slug,
    name: restaurant.name,
    tagline: restaurant.description,
    description: restaurant.description,
    cuisine: restaurant.cuisine as RestaurantCuisine[],
    location: restaurant.location ?? "Thoddoo, Maldives",
    priceRange: restaurant.price_range ?? "$$",
    openingHours: restaurant.opening_hours ?? "Confirm locally",
    image: restaurant.image_path,
    featured: restaurant.featured
  };
}

export function mapExperienceRowToDomain(experience: Tables<"experiences">): Experience {
  return {
    id: experience.id,
    slug: experience.slug,
    title: experience.title,
    tagline: experience.description,
    description: experience.description,
    category: experience.category as Experience["category"],
    duration: experience.duration ?? "Confirm timing",
    price: experience.price ?? "Price on request",
    image: experience.image_path,
    highlights: experience.highlights,
    featured: experience.featured
  };
}

export function mapTransferRowToDomain(transfer: Tables<"transfers">): Transfer {
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
    image: transfer.image_path,
    highlights: transfer.highlights,
    featured: transfer.featured
  };
}
