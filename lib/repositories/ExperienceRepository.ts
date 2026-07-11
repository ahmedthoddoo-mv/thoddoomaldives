import { experiences } from "@/data/experiences";
import { createRepository } from "@/lib/repositories/types";

export const ExperienceRepository = {
  ...createRepository({
    records: experiences,
    searchFields: ["id", "slug", "title", "tagline", "description", "category", "duration", "price"]
  }),
  findVerified() {
    return experiences.filter((experience) => experience.featured);
  }
};
