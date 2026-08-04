import type { Transfer } from "@/types/transfer";

const nasruFaqs = [
  {
    question: "How early should I arrive?",
    answer: "Please arrive at the jetty early enough for check-in and final boarding instructions. Exact timing is confirmed with iThoddoo Maldives or the operator before travel.",
  },
  {
    question: "Where is the airport meeting point?",
    answer: "Meeting guidance is shared after booking confirmation. Guests are directed to the airport jetty area or a nearby representative point when needed.",
  },
  {
    question: "What happens if my flight is delayed?",
    answer: "Share any flight delay as soon as possible on WhatsApp. The team will review the scheduled service and available alternatives, but final availability is confirmed manually.",
  },
  {
    question: "Can I change my booking?",
    answer: "Changes depend on the operator schedule and notice period. Confirm any amendment request with iThoddoo Maldives before payment or reconfirmation.",
  },
  {
    question: "What if weather affects the transfer?",
    answer: "Speedboat timings can change because of weather and sea conditions. If operations are affected, the latest available option will be confirmed manually.",
  },
  {
    question: "How much luggage can I carry?",
    answer: "The supported public allowance is 20 kg of luggage plus a handbag. Confirm oversized or sports equipment before payment.",
  },
  {
    question: "Is hotel transfer included?",
    answer: "Buggy or hotel transfer is arranged where applicable. Confirm your guesthouse name so the team can advise what is included for your booking.",
  },
  {
    question: "Can I book a return transfer?",
    answer: "Yes. Return requests can be included in the same enquiry, and final space is confirmed by iThoddoo Maldives or the operator.",
  },
  {
    question: "How is availability confirmed?",
    answer: "Availability is confirmed after enquiry. The operator currently manages seats manually, so the website does not show live seats.",
  },
  {
    question: "How do I pay?",
    answer: "Payment and confirmation steps are shared after your route and seats are checked. Confirm the current process with iThoddoo Maldives before payment.",
  },
] as const;

export const transfers: Transfer[] = [
  {
    id: "nasru-speed-boat",
    slug: "nasru-speed-boat",
    title: "Nasru Speed Boat Airport Transfer",
    type: "public-speedboat",
    operatorName: "Nasru Speed Boat",
    route: "Velana International Airport ↔ Thoddoo",
    description:
      "A premium public speedboat transfer between Velana International Airport and Thoddoo with daily scheduled service, luggage support, and local booking coordination through iThoddoo Maldives.",
    shortDescription:
      "Daily airport speedboat with verified local booking support, luggage allowance, and guesthouse coordination.",
    duration: "Approx. 70–80 minutes",
    durationMinutes: [70, 80],
    price: "USD 35",
    pricingUnit: "per-person-one-way",
    departurePoint: "Airport jetty at Velana International Airport",
    arrivalPoint: "Thoddoo harbor",
    scheduleNote: "Schedules can change due to weather and sea conditions. Please confirm the latest schedule before booking.",
    schedule: {
      timezone: "Maldives Time (UTC+5)",
      fallbackMessage: "Please confirm the latest schedule before booking.",
      directions: [
        {
          label: "Thoddoo → Velana International Airport",
          departures: ["06:45", "13:00"],
          operatingDays: "Daily",
          note: "On Friday, the afternoon departure is 14:00 instead of 13:00.",
        },
        {
          label: "Velana International Airport → Thoddoo",
          departures: ["10:15", "16:00"],
          operatingDays: "Daily",
        },
      ],
    },
    image: "/images/homepage/hero-6.jpg",
    gallery: ["/images/homepage/hero-6.jpg", "/images/hero-thoddoo.jpg"],
    highlights: [
      "Daily scheduled speedboat service",
      "Airport jetty to Thoddoo harbor route",
      "20 kg luggage plus handbag",
      "Buggy or hotel transfer where applicable",
    ],
    inclusions: [
      "20 kg luggage",
      "Handbag",
      "Daily scheduled departures",
      "Airport jetty route",
      "Thoddoo harbor arrival",
      "Buggy or hotel transfer where applicable",
      "Approximately 70–80 minutes",
      "WhatsApp booking support",
    ],
    importantInformation: [
      "Arrive at the jetty early for check-in and boarding instructions.",
      "Departure times can shift because of weather and sea conditions.",
      "Share flight delays immediately so the team can advise the latest available option.",
      "Oversized or sports equipment should be confirmed before payment.",
      "Children and infants can travel, but guest details should be shared in advance.",
      "Missed departures, schedule changes, and payment terms must be confirmed with iThoddoo Maldives before payment.",
      "Pickup and drop-off support depends on the guesthouse and final booking arrangement.",
    ],
    fleet: [
      {
        model: "Gulf Craft 38",
        vessels: 4,
        capacityPerVessel: 32,
        summary: "Suitable for scheduled daily service.",
      },
      {
        model: "Gulf Craft 48",
        vessels: 3,
        capacityPerVessel: 60,
        summary: "Suitable for larger passenger volumes and groups.",
      },
    ],
    totalFleet: 7,
    availability: {
      provider: "google-sheets",
      statusMessage: "Availability confirmed after enquiry",
      isLive: false,
    },
    featured: true,
    verified: true,
    verificationStatus: "verified",
    isPublished: true,
    seo: {
      title: "Nasru Speed Boat Transfer to Thoddoo | iThoddoo Maldives",
      description: "Book Nasru Speed Boat between Velana International Airport and Thoddoo with daily timetable guidance, public pricing, and WhatsApp support.",
    },
    faqs: [...nasruFaqs],
  },
  {
    id: "private-speedboat",
    slug: "private-speedboat",
    title: "Private Speedboat Charter",
    type: "private-speedboat",
    operatorName: "Private Transfer by Arrangement",
    route: "Airport or Malé pickup ↔ Thoddoo",
    description:
      "A flexible private transfer option for families, groups, late arrivals, or guests who prefer direct travel by arrangement.",
    shortDescription: "Flexible private transfer arranged manually based on guest timing and vessel availability.",
    duration: "Around 1 hour",
    price: "Price on request",
    pricingUnit: "on-request",
    departurePoint: "Airport or Malé pickup by arrangement",
    arrivalPoint: "Thoddoo harbor",
    scheduleNote: "Subject to weather, sea conditions, and operator availability.",
    image: "/images/homepage/hero-1.jpg",
    gallery: ["/images/homepage/hero-1.jpg"],
    highlights: ["Flexible timing", "Best for groups", "Airport pickup possible"],
    inclusions: ["Private charter planning", "WhatsApp booking support"],
    importantInformation: ["Final timing, pricing, and luggage terms are confirmed manually before payment."],
    availability: {
      provider: "manual",
      statusMessage: "Availability confirmed after enquiry",
      isLive: false,
    },
    featured: true,
    verified: false,
    verificationStatus: "draft",
    isPublished: false,
    seo: {
      title: "Private Speedboat Charter to Thoddoo | iThoddoo Maldives",
      description: "Arrange a private speedboat charter to Thoddoo with local coordination and manual availability confirmation.",
    },
  },
];

export function getTransferBySlug(slug: string) {
  return transfers.find((transfer) => transfer.slug === slug);
}
