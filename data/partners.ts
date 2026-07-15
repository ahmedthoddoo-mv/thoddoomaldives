import type { Partner, PartnerCategoryDefinition } from "@/types/partner";

export const partnerCategories: PartnerCategoryDefinition[] = [
  {
    id: "guesthouse",
    label: "Guesthouse",
    pluralLabel: "Guesthouses",
    description: "Locally operated stays for travelers who want island access and hospitality.",
    defaultServiceType: "room"
  },
  {
    id: "hotel",
    label: "Hotel",
    pluralLabel: "Hotels",
    description: "Larger accommodation providers with structured room and service operations.",
    defaultServiceType: "room"
  },
  {
    id: "speedboat-company",
    label: "Speedboat Company",
    pluralLabel: "Speedboat Companies",
    description: "Transfer operators connecting travelers between Thoddoo and key arrival points.",
    defaultServiceType: "transfer"
  },
  {
    id: "ferry-operator",
    label: "Ferry Operator",
    pluralLabel: "Ferry Operators",
    description: "Scheduled ferry providers for cost-conscious local and visitor movement.",
    defaultServiceType: "transfer"
  },
  {
    id: "dive-center",
    label: "Dive Center",
    pluralLabel: "Dive Centers",
    description: "Certified dive teams offering marine experiences, training, and excursions.",
    defaultServiceType: "activity"
  },
  {
    id: "watersports",
    label: "Watersports",
    pluralLabel: "Watersports",
    description: "Ocean activities including snorkeling, paddle, surf, and guided water experiences.",
    defaultServiceType: "activity"
  },
  {
    id: "restaurant",
    label: "Restaurant",
    pluralLabel: "Restaurants",
    description: "Dining partners serving local, regional, and international food.",
    defaultServiceType: "dining"
  },
  {
    id: "cafe",
    label: "Cafe",
    pluralLabel: "Cafes",
    description: "Coffee, snacks, juices, and casual food stops for travelers.",
    defaultServiceType: "dining"
  },
  {
    id: "photographer",
    label: "Photographer",
    pluralLabel: "Photographers",
    description: "Creative partners for shoots, travel memories, campaigns, and brand media.",
    defaultServiceType: "local-service"
  },
  {
    id: "transfer-company",
    label: "Transfer Company",
    pluralLabel: "Transfer Companies",
    description: "Island mobility providers for guest movement and local transfers.",
    defaultServiceType: "transfer"
  },
  {
    id: "shop",
    label: "Shop",
    pluralLabel: "Shops",
    description: "Retail partners for essentials, souvenirs, equipment, and local products.",
    defaultServiceType: "retail"
  },
  {
    id: "wellness",
    label: "Wellness",
    pluralLabel: "Wellness",
    description: "Massage, spa, recovery, and wellness experiences.",
    defaultServiceType: "wellness"
  },
  {
    id: "local-guide",
    label: "Local Guide",
    pluralLabel: "Local Guides",
    description: "Local guides offering culture, nature, food, and island discovery experiences.",
    defaultServiceType: "activity"
  }
];

export const partners: Partner[] = [
  {
    id: "partner-thoddoo-stay-house",
    slug: "thoddoo-stay-house",
    name: "Thoddoo Stay House",
    category: "guesthouse",
    membershipTier: "verified",
    verificationStatus: "verified",
    shortDescription: "A verified guesthouse close to beach routes and island cafes.",
    description:
      "A locally operated stay designed for travelers who want reliable service, walkable island access, and quick WhatsApp coordination.",
    contact: {
      phone: "+960 700 0001",
      whatsapp: "+960 700 0001",
      email: "hello@thoddoostay.example"
    },
    location: {
      island: "Thoddoo",
      atoll: "Alif Alif",
      address: "Central Thoddoo"
    },
    media: {
      coverImage: "/partner-placeholders/guesthouse.jpg",
      photos: [
        "/partner-placeholders/guesthouse-room.jpg",
        "/partner-placeholders/guesthouse-courtyard.jpg"
      ],
      hasProfessionalPhotography: false
    },
    services: [
      {
        id: "deluxe-room",
        name: "Deluxe Room",
        description: "Private room with breakfast support and local arrival coordination.",
        category: "room",
        startingPriceLabel: "From $85",
        isBookableInFuture: true
      }
    ],
    tags: ["Verified", "Guesthouse", "Trip Planner"],
    joinedAt: "2026-07-09",
    isHomepageEligible: true,
    isTripPlannerEligible: true
  },
  {
    id: "partner-blue-channel-speedboat",
    slug: "blue-channel-speedboat",
    name: "Blue Channel Speedboat",
    category: "speedboat-company",
    membershipTier: "premium",
    verificationStatus: "verified",
    shortDescription: "Priority transfer partner for reliable arrival and departure planning.",
    description:
      "A premium transfer partner positioned for campaigns, concierge priority, and future booking workflows.",
    contact: {
      phone: "+960 700 0002",
      whatsapp: "+960 700 0002"
    },
    location: {
      island: "Thoddoo",
      atoll: "Alif Alif",
      address: "Harbor area"
    },
    media: {
      coverImage: "/partner-placeholders/speedboat.jpg",
      photos: ["/partner-placeholders/speedboat-harbor.jpg"],
      videoUrl: "https://example.com/future-video",
      hasProfessionalPhotography: true
    },
    services: [
      {
        id: "airport-transfer",
        name: "Airport Transfer",
        description: "Scheduled and private speedboat transfer support for Thoddoo travelers.",
        category: "transfer",
        startingPriceLabel: "Future booking",
        isBookableInFuture: true
      }
    ],
    tags: ["Premium", "Transfers", "AI Concierge"],
    joinedAt: "2026-07-09",
    isHomepageEligible: true,
    isTripPlannerEligible: true
  },
  {
    id: "partner-island-bites",
    slug: "island-bites",
    name: "Island Bites",
    category: "restaurant",
    membershipTier: "free",
    verificationStatus: "submitted",
    shortDescription: "Casual island dining profile prepared for verification.",
    description:
      "A restaurant listing with core contact details and starter content, ready to upgrade into growth placements.",
    contact: {
      phone: "+960 700 0003"
    },
    location: {
      island: "Thoddoo",
      atoll: "Alif Alif"
    },
    media: {
      coverImage: "/partner-placeholders/restaurant.jpg",
      photos: ["/partner-placeholders/restaurant-dish.jpg"],
      hasProfessionalPhotography: false
    },
    services: [
      {
        id: "dinner-service",
        name: "Dinner Service",
        description: "Local dishes and casual meals for island guests.",
        category: "dining",
        isBookableInFuture: false
      }
    ],
    tags: ["Restaurant", "Local food"],
    joinedAt: "2026-07-09",
    isHomepageEligible: false,
    isTripPlannerEligible: false
  }
];
