export type ExperienceCategory =
  | "snorkeling"
  | "sandbank"
  | "fishing"
  | "water-sports"
  | "culture"
  | "cruise";

export type Experience = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: ExperienceCategory;
  duration: string;
  price: string;
  image: string;
  highlights: string[];
  featured: boolean;
};
