export const partnerApplicationPricingUnits = [
  "per night",
  "per person",
  "per trip",
  "per hour",
  "per transfer",
  "per package"
] as const;

export type PartnerApplicationPricingUnit = (typeof partnerApplicationPricingUnits)[number];

export function normalizePartnerApplicationPricingUnit(value: string): PartnerApplicationPricingUnit | null {
  const normalized = value.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
  const exact = partnerApplicationPricingUnits.find((unit) => unit === normalized);
  if (exact) return exact;

  // Transfer descriptions often include passenger and direction wording, for
  // example "per person one way transfer". The service type is authoritative.
  if (/\btransfer\b|\bone way\b|\breturn transfer\b/.test(normalized)) return "per transfer";
  if (/\bnight\b/.test(normalized)) return "per night";
  if (/\bperson\b|\bpax\b|\badult\b|\bchild\b/.test(normalized)) return "per person";
  if (/\btrip\b|\bexcursion\b/.test(normalized)) return "per trip";
  if (/\bhour(?:ly)?\b/.test(normalized)) return "per hour";
  if (/\bpackage\b/.test(normalized)) return "per package";
  return null;
}
