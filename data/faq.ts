import type { FAQ } from "@/types/faq";

export const faqs: FAQ[] = [
  {
    id: "best-way-to-reach-thoddoo",
    question: "What is the best way to reach Thoddoo?",
    answer:
      "Most guests use a public speedboat from Male or the airport area. The best option depends on your flight arrival time, budget, group size, and weather conditions.",
    category: "transfers",
    featured: true,
  },
  {
    id: "book-before-arrival",
    question: "Should I book stays and excursions before arrival?",
    answer:
      "Advance booking is recommended, especially during peak season. Sharing your dates early helps local partners confirm rooms, transfers, and excursion availability.",
    category: "stays",
    featured: true,
  },
  {
    id: "excursion-weather",
    question: "Are excursions guaranteed every day?",
    answer:
      "Excursions depend on weather, sea conditions, and operator schedules. The local team will confirm timing and safety before the trip.",
    category: "experiences",
    featured: true,
  },
];
