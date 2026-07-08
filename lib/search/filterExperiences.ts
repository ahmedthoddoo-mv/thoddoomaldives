import type { Experience, ExperienceCategory } from "@/types/experience";

export type ExperienceFilters = {
  query?: string;
  category?: ExperienceCategory | "all";
  duration?: string;
  maxPrice?: number;
  familyFriendly?: boolean;
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function includesText(source: string, query?: string) {
  if (!query) return true;
  return normalize(source).includes(normalize(query));
}

function extractNumber(value: string) {
  const match = value.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

export function filterExperiences(
  experiences: Experience[],
  filters: ExperienceFilters
) {
  return experiences.filter((experience) => {
    const searchableText = [
      experience.title,
      experience.tagline,
      experience.description,
      experience.category,
      experience.duration,
      experience.price,
      ...experience.highlights,
    ].join(" ");

    if (!includesText(searchableText, filters.query)) return false;
    if (
      filters.category &&
      filters.category !== "all" &&
      experience.category !== filters.category
    ) {
      return false;
    }
    if (filters.duration && !includesText(experience.duration, filters.duration)) {
      return false;
    }
    if (filters.maxPrice && extractNumber(experience.price) > filters.maxPrice) {
      return false;
    }
    if (
      filters.familyFriendly &&
      !experience.highlights.some((highlight) =>
        includesText(highlight, "family")
      )
    ) {
      return false;
    }

    return true;
  });
}
