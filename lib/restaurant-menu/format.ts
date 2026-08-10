export type RestaurantMembershipTier = "free" | "verified" | "premium";

export function normalizeRestaurantMembershipTier(value: string | null | undefined): RestaurantMembershipTier {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "premium") return "premium";
  if (normalized === "verified") return "verified";
  return "free";
}

export function isPremiumRestaurant(value: string | null | undefined) {
  return normalizeRestaurantMembershipTier(value) === "premium";
}

export function isVerifiedRestaurant(value: string | null | undefined) {
  return normalizeRestaurantMembershipTier(value) === "verified" || isPremiumRestaurant(value);
}

export function normalizePhoneForLink(value: string | null | undefined) {
  return value ? value.replace(/[^\d+]/g, "") : "";
}

export function normalizeWhatsAppForLink(value: string | null | undefined) {
  return value ? value.replace(/\D/g, "") : "";
}

export function formatRestaurantCuisine(value: string | Array<string | null | undefined> | null | undefined) {
  const entries = typeof value === "string"
    ? (() => {
        const trimmed = value.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              return parsed.filter((entry): entry is string => typeof entry === "string");
            }
          } catch {
            // fall through to manual parsing
          }
        }

        return trimmed.split(",");
      })()
    : Array.isArray(value)
      ? value
      : [];

  const normalized = entries
    .map((entry) => typeof entry === "string" ? entry.trim() : "")
    .filter(Boolean)
    .map((entry) => entry.replace(/^\[|\]$/g, "").replace(/^['"]|['"]$/g, ""))
    .map((entry) => entry.replace(/^['"]|['"]$/g, ""));

  return normalized.join(" · ");
}

type RestaurantMenuMessageItem = {
  name: string;
  quantity: number;
  priceMvr?: number | null;
};

export type RestaurantMenuCtaConfig = {
  kind: "restaurant_menu_whatsapp" | "restaurant_menu_ithoddoo_enquiry";
  label: string;
  href: string;
  message: string;
};

export function buildDirectionsUrl(restaurant: {
  address?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  name: string;
}) {
  if (restaurant.latitude !== null && restaurant.latitude !== undefined && restaurant.longitude !== null && restaurant.longitude !== undefined) {
    return `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`;
  }

  const addressQuery = [restaurant.address, restaurant.location, restaurant.name]
    .filter((entry): entry is string => Boolean(entry && entry.trim()))
    .join(", ");

  return addressQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}` : "";
}

export function buildRestaurantWhatsAppMessage(params: {
  restaurantName: string;
  items: RestaurantMenuMessageItem[];
  estimatedMenuValue: number;
}) {
  const lines = [
    `Hello ${params.restaurantName},`,
    "",
    "I found you through iThoddoo Maldives.",
    "I would like to enquire/order:",
    ""
  ];

  if (params.items.length > 0) {
    params.items.forEach((item) => {
      const lineTotal = item.priceMvr !== null && item.priceMvr !== undefined ? item.priceMvr * item.quantity : null;
      const priceText = lineTotal !== null ? ` — MVR ${lineTotal}` : "";
      lines.push(`• ${item.name} × ${item.quantity}${priceText}`);
    });
  } else {
    lines.push("• No items selected yet.");
  }

  lines.push(
    "",
    `Estimated menu value: MVR ${params.estimatedMenuValue}`,
    "",
    "Menu prices exclude 8% GST.",
    "",
    "Please confirm availability and final amount.",
    "",
    "Found via iThoddoo Maldives.",
    `Restaurant: ${params.restaurantName}`,
    "",
    "Thank you."
  );
  return lines.join("\n");
}

export function buildIThoddooRestaurantEnquiryMessage(params: {
  restaurantName: string;
  restaurantSlug?: string | null;
  items: RestaurantMenuMessageItem[];
  estimatedMenuValue: number;
  platformDomain?: string | null;
}) {
  const lines = [
    "Hello iThoddoo Maldives,",
    "",
    `I would like to enquire about ${params.restaurantName}.`,
    "",
    "Selected items:",
    ""
  ];

  if (params.items.length > 0) {
    params.items.forEach((item) => {
      const lineTotal = item.priceMvr !== null && item.priceMvr !== undefined ? item.priceMvr * item.quantity : null;
      const priceText = lineTotal !== null ? ` — MVR ${lineTotal}` : "";
      lines.push(`• ${item.name} × ${item.quantity}${priceText}`);
    });
  } else {
    lines.push("• No items selected yet.");
  }

  lines.push(
    "",
    `Estimated menu value: MVR ${params.estimatedMenuValue}`,
    "",
    "Menu prices exclude 8% GST.",
    "",
    "Please assist me with this restaurant enquiry.",
    "",
    "Restaurant:",
    params.restaurantName
  );

  if (params.restaurantSlug && params.platformDomain) {
    lines.push(`Restaurant page: https://${params.platformDomain}/restaurants/${params.restaurantSlug}`);
  }

  lines.push("", "Found through iThoddoo Maldives.");
  return lines.join("\n");
}

export function resolveRestaurantMenuCta(params: {
  restaurantName: string;
  restaurantSlug?: string | null;
  membershipTier?: string | null;
  restaurantWhatsApp?: string | null;
  partnerWhatsApp?: string | null;
  ithoddooWhatsapp?: string | null;
  platformDomain?: string | null;
  items: RestaurantMenuMessageItem[];
  estimatedMenuValue: number;
}): RestaurantMenuCtaConfig | null {
  if (params.items.length === 0) return null;

  const restaurantWhatsapp = normalizeWhatsAppForLink(params.restaurantWhatsApp ?? null);
  const ithoddooWhatsapp = normalizeWhatsAppForLink(params.ithoddooWhatsapp ?? null);
  if (!ithoddooWhatsapp) return null;

  if (restaurantWhatsapp) {
    const message = buildRestaurantWhatsAppMessage({
      restaurantName: params.restaurantName,
      items: params.items,
      estimatedMenuValue: params.estimatedMenuValue
    });

    return {
      kind: "restaurant_menu_whatsapp",
      label: `Send selection to ${params.restaurantName} on WhatsApp`,
      href: `https://wa.me/${restaurantWhatsapp}?text=${encodeURIComponent(message)}`,
      message
    };
  }

  const message = buildIThoddooRestaurantEnquiryMessage({
    restaurantName: params.restaurantName,
    restaurantSlug: params.restaurantSlug,
    platformDomain: params.platformDomain,
    items: params.items,
    estimatedMenuValue: params.estimatedMenuValue
  });

  return {
    kind: "restaurant_menu_ithoddoo_enquiry",
    label: "Send enquiry through iThoddoo Maldives",
    href: `https://wa.me/${ithoddooWhatsapp}?text=${encodeURIComponent(message)}`,
    message
  };
}
