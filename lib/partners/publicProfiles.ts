import { PartnerRepository } from "@/lib/repositories";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CrmPartner } from "@/data/adminCrm";

export type PublicPartnerProfile = {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  location: string;
  address?: string;
  heroImage: string;
  gallery: string[];
  contact: {
    phone?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
  };
  tags: string[];
  services: Array<{
    name: string;
    description: string;
    category: string;
  }>;
  verificationStatus: string;
  membershipTier?: string;
  metadata?: Record<string, unknown>;
};

export type PublicPartnerProfileReadResult = {
  data: PublicPartnerProfile | null;
  relatedListing?: {
    href: string;
    title: string;
  };
  source: "mock" | "supabase" | "fallback";
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatCategory(value: string | null | undefined) {
  if (!value) return "Local business";

  return value
    .split(/[_\-]/)
    .filter(Boolean)
    .map(
      (segment) =>
        segment.charAt(0).toUpperCase() + segment.slice(1)
    )
    .join(" ");
}

function parseMetadataArray(
  metadata: Record<string, unknown> | undefined,
  key: string
) {
  const value = metadata?.[key];

  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string"
    );
  }

  return [];
}

function parseMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string
) {
  const value = metadata?.[key];
  return typeof value === "string" ? value : undefined;
}

function mapCrmPartnerToPublicProfile(
  partner: CrmPartner
): PublicPartnerProfile {
  const category = partner.category ?? "Local business";
  const slug = toSlug(partner.business);

  return {
    id: partner.id,
    slug,
    name: partner.business,
    category,
    shortDescription: `${category} partner on Thoddoo with local support and booking coordination.`,
    description: `${partner.business} is part of the iThoddoo partner network and is ready to help visitors discover and book local experiences on Thoddoo.`,
    location: "Thoddoo, Maldives",
    address: partner.address || undefined,
    heroImage: "/images/hero-thoddoo.jpg",
    gallery: [],
    contact: {
      whatsapp: partner.whatsapp || undefined,
      email: partner.email || undefined,
      website: partner.website || undefined,
    },
    tags: [
      partner.verification,
      partner.membership,
      "Verified local partner",
    ].filter(Boolean),
    services: [],
    verificationStatus: partner.verification,
    membershipTier: partner.membership,
  };
}

function mapSupabasePartnerToPublicProfile(
  row: Record<string, unknown>
): PublicPartnerProfile {
  const metadata =
    row.metadata && typeof row.metadata === "object"
      ? (row.metadata as Record<string, unknown>)
      : {};

  const category = String(row.category ?? "local-business");
  const name = String(row.business_name ?? "Local Business");
  const slug = String(row.slug ?? toSlug(name));

  const shortDescription = String(
    row.short_description ??
      parseMetadataString(metadata, "shortDescription") ??
      `${name} is an approved Thoddoo business.`
  );

  const description = String(
    parseMetadataString(metadata, "description") ??
      shortDescription
  );

  const heroImage = String(
    parseMetadataString(metadata, "heroImage") ??
      parseMetadataString(metadata, "coverImage") ??
      "/images/hero-thoddoo.jpg"
  );

  const gallery = parseMetadataArray(metadata, "gallery");

  const services = (
    Array.isArray(metadata.services)
      ? metadata.services
      : []
  )
    .filter(
      (service): service is Record<string, unknown> =>
        typeof service === "object" && service !== null
    )
    .map((service) => ({
      name: String(service.name ?? "Service"),
      description: String(
        service.description ??
          "Details shared directly with guests."
      ),
      category: String(service.category ?? category),
    }));

  return {
    id: String(row.id ?? slug),
    slug,
    name,
    category: formatCategory(category),
    shortDescription,
    description,
    location: String(
      row.island ?? "Thoddoo, Maldives"
    ),
    address: row.address
      ? String(row.address)
      : undefined,
    heroImage,
    gallery:
      gallery.length > 0
        ? gallery
        : heroImage
          ? [heroImage]
          : [],
    contact: {
      phone: row.phone ? String(row.phone) : undefined,
      whatsapp: row.whatsapp
        ? String(row.whatsapp)
        : undefined,
      email: row.email ? String(row.email) : undefined,
      website: row.website
        ? String(row.website)
        : undefined,
      instagram: row.instagram
        ? String(row.instagram)
        : undefined,
      facebook: row.facebook
        ? String(row.facebook)
        : undefined,
    },
    tags: [
      parseMetadataString(metadata, "highlight"),
      parseMetadataString(metadata, "tag"),
      String(row.verification_status ?? "verified"),
      String(row.status ?? "verified"),
    ].filter(
      (value): value is string => Boolean(value)
    ),
    services,
    verificationStatus: String(
      row.verification_status ?? "verified"
    ),
    membershipTier: String(
      row.membership_plan_id ?? "Verified"
    ),
    metadata,
  };
}

export async function getPublicPartnerProfileBySlug(
  slug: string
): Promise<PublicPartnerProfileReadResult> {
  const supabase = createSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .eq("slug", slug)
      .in("status", [
        "active",
        "approved",
        "verified",
        "published",
      ])
      .maybeSingle();

    console.log("PARTNER PROFILE DEBUG", {
      slug,
      found: Boolean(data),
      error,
      status: data?.status ?? null,
      verificationStatus:
        data?.verification_status ?? null,
    });

    if (error) {
      console.error(
        "Partner profile Supabase query failed:",
        error
      );
    }

    if (!error && data) {
      const profile =
        mapSupabasePartnerToPublicProfile(
          data as Record<string, unknown>
        );

      const {
        data: relatedListingRow,
        error: relatedListingError,
      } = await supabase
        .from("properties")
        .select("slug, name")
        .eq("partner_id", profile.id)
        .eq("publication_status", "published")
        .maybeSingle();

      if (relatedListingError) {
        console.error(
          "Related listing query failed:",
          relatedListingError
        );
      }

      const relatedListing =
        relatedListingRow as
          | {
              slug?: string;
              name?: string;
            }
          | null
          | undefined;

      return {
        data: profile,
        relatedListing:
          relatedListing?.slug &&
          relatedListing?.name
            ? {
                href: `/stay/${relatedListing.slug}`,
                title: relatedListing.name,
              }
            : undefined,
        source: "supabase",
      };
    }
  }

  const fallbackPartner =
    PartnerRepository.findBySlug(slug) as
      | CrmPartner
      | undefined;

  if (fallbackPartner) {
    return {
      data: mapCrmPartnerToPublicProfile(
        fallbackPartner
      ),
      source: "fallback",
    };
  }

  console.log("No public partner profile found:", {
    slug,
  });

  return {
    data: null,
    source: "mock",
  };
}