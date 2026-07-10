export type SearchableRecord = {
  id: string;
  slug?: string;
  name?: string;
  title?: string;
  featured?: boolean;
  isFeatured?: boolean;
  verificationStatus?: string;
  verified?: boolean;
};

export type Repository<T extends SearchableRecord> = {
  findAll(): T[];
  findById(id: string): T | undefined;
  findBySlug(slug: string): T | undefined;
  findFeatured(): T[];
  findVerified(): T[];
  search(query: string): T[];
};

export function createRepository<T extends SearchableRecord>({
  records,
  searchFields = []
}: {
  records: T[];
  searchFields?: Array<keyof T>;
}): Repository<T> {
  function recordMatchesSearch(record: T, query: string) {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return true;
    }

    const searchableValues = searchFields.length > 0 ? searchFields.map((field) => record[field]) : Object.values(record);

    return searchableValues
      .map((value) => (typeof value === "object" ? JSON.stringify(value) : String(value ?? "")))
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  }

  return {
    findAll() {
      return records;
    },
    findById(id: string) {
      return records.find((record) => record.id === id);
    },
    findBySlug(slug: string) {
      return records.find((record) => record.slug === slug);
    },
    findFeatured() {
      return records.filter((record) => Boolean(record.featured ?? record.isFeatured));
    },
    findVerified() {
      return records.filter((record) => {
        const verificationStatus = String(record.verificationStatus ?? "").toLowerCase();
        return record.verified === true || verificationStatus === "verified";
      });
    },
    search(query: string) {
      return records.filter((record) => recordMatchesSearch(record, query));
    }
  };
}
