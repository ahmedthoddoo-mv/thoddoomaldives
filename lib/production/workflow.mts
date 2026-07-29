export type IdentityRecord = {
  id: string;
  applicationId?: string | null;
  email?: string | null;
  businessName: string;
  category: string;
  slug: string;
};

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string) {
  const trimmed = value.trim();
  const prefix = trimmed.startsWith("+") ? "+" : "";
  return prefix + trimmed.replace(/\D/g, "");
}

export function normalizeIdentity(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function normalizePositivePrice(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function formatPublicPrice(value: number | null, currency = "USD", suffix = "/night") {
  return value && value > 0 ? `${currency} ${value.toFixed(0)}${suffix}` : "Price on request";
}

export function safeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "partner";
}

export function collisionSafeSlug(value: string, usedSlugs: Iterable<string>) {
  const used = new Set(Array.from(usedSlugs, (slug) => slug.toLowerCase()));
  const base = safeSlug(value);
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) candidate = `${base}-${suffix++}`;
  return candidate;
}

export function matchIdentity(
  application: { id: string; linkedId?: string | null; email: string; businessName: string; category: string },
  records: IdentityRecord[]
) {
  return records.find((record) => record.id === application.linkedId)
    ?? records.find((record) => record.applicationId === application.id)
    ?? records.find((record) =>
      normalizeEmail(record.email ?? "") === normalizeEmail(application.email)
      && normalizeIdentity(record.businessName) === normalizeIdentity(application.businessName))
    ?? records.find((record) =>
      normalizeIdentity(record.businessName) === normalizeIdentity(application.businessName)
      && record.category === application.category)
    ?? null;
}

export function splitSubmittedList(value: unknown) {
  return String(value ?? "").split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
}

export function upsertByStableKey<T extends { key: string }>(existing: T[], proposed: T[]) {
  const result = new Map(existing.map((item) => [item.key, item]));
  for (const item of proposed) {
    const current = result.get(item.key);
    result.set(item.key, current ? { ...item, ...current } : item);
  }
  return [...result.values()];
}

export function validateEnquiry(input: {
  today: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestName: string;
  email: string;
  whatsapp: string;
  contactPreference: string;
}) {
  const errors: string[] = [];
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim());
  const whatsappValid = input.whatsapp.replace(/\D/g, "").length >= 7;
  const checkIn = Date.parse(`${input.checkIn}T00:00:00Z`);
  const checkOut = Date.parse(`${input.checkOut}T00:00:00Z`);
  const today = Date.parse(`${input.today}T00:00:00Z`);
  if (!Number.isFinite(checkIn) || checkIn <= today) errors.push("Check-in date must be in the future.");
  if (!Number.isFinite(checkOut) || checkOut <= checkIn) errors.push("Check-out must be after check-in.");
  if (input.adults < 1) errors.push("At least one adult is required.");
  if (input.children < 0) errors.push("Children cannot be negative.");
  if (!input.guestName.trim()) errors.push("Guest name is required.");
  if (!emailValid && !whatsappValid) errors.push("Provide a valid email or WhatsApp number.");
  if (!["email", "whatsapp", "either"].includes(input.contactPreference)) errors.push("Choose a valid contact preference.");
  return { valid: errors.length === 0, errors, nights: checkOut > checkIn ? (checkOut - checkIn) / 86400000 : 0 };
}

export function validateOwnedIds(selectedIds: string[], eligibleIds: string[]) {
  const eligible = new Set(eligibleIds);
  return selectedIds.every((id) => eligible.has(id));
}

export function trustedQuote(nights: number, roomPrice: number | null, servicePrices: Array<number | null>) {
  if (!roomPrice || roomPrice <= 0 || servicePrices.some((price) => !price || price <= 0)) return null;
  return nights * roomPrice + servicePrices.reduce<number>((total, price) => total + (price ?? 0), 0);
}

export function publicMedia<T extends { visibility: string; archived: boolean; mediaType: string }>(items: T[]) {
  const privateTypes = new Set(["license", "verification", "registration", "identity"]);
  return items.filter((item) => item.visibility === "public" && !item.archived && !privateTypes.has(item.mediaType));
}
