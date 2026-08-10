import { getCanonicalPublicMediaCover } from "@/lib/business-media/public";
import type { BusinessMediaItem } from "@/types/business-media";
import type { Guesthouse } from "@/types/guesthouse";

export type OwnerAssignmentState = {
  status: "linked" | "pending" | "no-owner";
  label: string;
  description: string;
};

export function deriveOwnerAssignmentState({
  ownerLinked,
  partnerActive,
  invitationPending
}: {
  ownerLinked?: boolean;
  partnerActive?: boolean;
  invitationPending?: boolean;
}): OwnerAssignmentState {
  if (ownerLinked) {
    return {
      status: "linked",
      label: "Owner linked",
      description: partnerActive ? "The partner is active and can manage this guesthouse." : "A partner is linked but access is not currently active."
    };
  }

  if (invitationPending) {
    return {
      status: "pending",
      label: "Invitation pending",
      description: "An owner invite has been sent and is waiting for confirmation."
    };
  }

  return {
    status: "no-owner",
    label: "No owner",
    description: "Assign an existing partner or invite one to take over management."
  };
}

export function getGuesthouseHeroMedia(
  guesthouse: Pick<Guesthouse, "heroImage" | "gallery" | "media">
): { heroImage: string; gallery: string[] } {
  const mediaItems = (guesthouse.media ?? []).filter((item): item is BusinessMediaItem => Boolean(item));
  const canonicalCover = getCanonicalPublicMediaCover(mediaItems);
  const heroImage = canonicalCover?.url || guesthouse.heroImage || guesthouse.gallery[0] || "";
  const gallery = canonicalCover
    ? mediaItems.filter((item) => item.id !== canonicalCover.id).map((item) => item.url).filter(Boolean)
    : guesthouse.gallery.filter(Boolean);

  return {
    heroImage,
    gallery: gallery.length > 0 ? gallery : guesthouse.gallery.filter(Boolean)
  };
}

export function getGuesthouseDisplayPrice(price: string | number | null | undefined) {
  if (price === null || price === undefined || price === "") {
    return "Price on request";
  }

  if (typeof price === "number") {
    return Number.isFinite(price) && price > 0 ? `$${price}` : "Price on request";
  }

  const trimmed = price.trim();
  if (!trimmed || /price on request/i.test(trimmed) || /request/i.test(trimmed)) {
    return "Price on request";
  }

  return trimmed;
}

export function getDirectBookingUrl(guesthouse: Pick<Guesthouse, "bookingLinks" | "website">) {
  const link = guesthouse.bookingLinks?.directBookingUrl?.trim();
  if (link) {
    return link;
  }

  const fallback = [guesthouse.bookingLinks?.bookingComUrl, guesthouse.bookingLinks?.airbnbUrl, guesthouse.bookingLinks?.expediaUrl, guesthouse.website]
    .find((value): value is string => Boolean(value && value.trim()));

  return fallback?.trim();
}

export function getGuesthouseBadgeState(guesthouse: Pick<Guesthouse, "verificationStatus" | "membershipBadge">) {
  const verified = guesthouse.verificationStatus === "Verified";
  const premium = String(guesthouse.membershipBadge ?? "").toLowerCase() === "premium";
  return {
    verified,
    premium,
    verifiedLabel: verified ? "Verified" : null,
    premiumLabel: premium ? "Premium Partner" : null
  };
}
