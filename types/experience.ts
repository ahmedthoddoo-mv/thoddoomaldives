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
  gallery?: string[];
  media?: import("@/types/business-media").BusinessMediaItem[];
  highlights: string[];
  featured: boolean;
  publicationStatus?: string;
  verificationStatus?: string;
};
