export function normalizePropertySlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function createPropertySlug(name: string, fallback = "new-property") {
  return normalizePropertySlug(name) || fallback;
}

export function createUniquePropertySlug({
  baseSlug,
  existingSlugs,
  currentId,
  getIdForSlug
}: {
  baseSlug: string;
  existingSlugs: string[];
  currentId?: string;
  getIdForSlug?: (slug: string) => string | undefined;
}) {
  const normalizedBase = createPropertySlug(baseSlug);
  let candidate = normalizedBase;
  let index = 2;

  while (
    existingSlugs.includes(candidate) &&
    (!currentId || getIdForSlug?.(candidate) !== currentId)
  ) {
    candidate = `${normalizedBase}-${index}`;
    index += 1;
  }

  return candidate;
}
