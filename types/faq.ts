export type FAQCategory =
  | "stays"
  | "transfers"
  | "experiences"
  | "payments"
  | "island-info";

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  featured: boolean;
};
