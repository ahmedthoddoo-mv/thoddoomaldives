export type AdminContentStatus = "Published" | "Draft" | "Needs review" | "Archived" | "Ready";

export type AdminContentItem = {
  id: string;
  name: string;
  category: string;
  status: AdminContentStatus;
  owner: string;
  updated: string;
  detail: string;
};

export type AdminContentSection = {
  slug: "guesthouses" | "restaurants" | "experiences" | "transfers" | "media";
  title: string;
  eyebrow: string;
  description: string;
  addLabel: string;
  searchPlaceholder: string;
  filters: string[];
  items: AdminContentItem[];
};

export const adminSidebarItems = [
  { label: "Overview", href: "/admin#overview" },
  { label: "Guesthouses", href: "/admin/guesthouses" },
  { label: "Restaurants", href: "/admin/restaurants" },
  { label: "Experiences", href: "/admin/experiences" },
  { label: "Transfers", href: "/admin/transfers" },
  { label: "Media", href: "/admin/media" },
  { label: "System", href: "/admin#status" },
  { label: "Roadmap", href: "/admin#roadmap" }
];

export const adminQuickActions = [
  { label: "Add Guesthouse", href: "/admin/guesthouses", variant: "primary" as const },
  { label: "Add Restaurant", href: "/admin/restaurants" },
  { label: "Add Excursion", href: "/admin/experiences" },
  { label: "Add Transfer Company", href: "/admin/transfers" },
  { label: "Review Applications", href: "/admin#applications", variant: "primary" as const },
  { label: "Upload Photos", href: "/admin/media" }
];

export const adminContentSections: Record<AdminContentSection["slug"], AdminContentSection> = {
  guesthouses: {
    slug: "guesthouses",
    title: "Guesthouse Content",
    eyebrow: "Stay inventory",
    description: "Manage guesthouse listing readiness, partner status, room content, and public page quality.",
    addLabel: "Add new guesthouse",
    searchPlaceholder: "Search guesthouses, owners, room notes...",
    filters: ["All", "Published", "Draft", "Needs review"],
    items: [
      {
        id: "stay-thoddoo-sun-sky",
        name: "Thoddoo Sun Sky Inn",
        category: "Verified Guesthouse",
        status: "Published",
        owner: "Aminath Haleema",
        updated: "Jul 9, 2026",
        detail: "Rooms, amenities, gallery, and WhatsApp booking path ready."
      },
      {
        id: "stay-palm-garden",
        name: "Palm Garden Thoddoo",
        category: "Growth Partner",
        status: "Needs review",
        owner: "Mohamed Rasheed",
        updated: "Jul 8, 2026",
        detail: "Waiting on updated room photos and breakfast notes."
      },
      {
        id: "stay-coral-wave",
        name: "Coral Wave Residence",
        category: "Starter Listing",
        status: "Draft",
        owner: "Nisha Ibrahim",
        updated: "Jul 6, 2026",
        detail: "Draft profile prepared for future partner verification."
      }
    ]
  },
  restaurants: {
    slug: "restaurants",
    title: "Restaurant Content",
    eyebrow: "Dining inventory",
    description: "Manage dining profiles, cuisine details, menu notes, opening hours, and partner visibility.",
    addLabel: "Add new restaurant",
    searchPlaceholder: "Search restaurants, cuisine, menu notes...",
    filters: ["All", "Published", "Draft", "Needs review"],
    items: [
      {
        id: "restaurant-island-bites",
        name: "Island Bites",
        category: "Local Dining",
        status: "Published",
        owner: "Ahmed Sameer",
        updated: "Jul 9, 2026",
        detail: "Cuisine, hours, and popular dishes are ready for travelers."
      },
      {
        id: "restaurant-lagoon-bite",
        name: "Lagoon Bite Cafe",
        category: "Cafe",
        status: "Needs review",
        owner: "Mariyam Zaina",
        updated: "Jul 8, 2026",
        detail: "Needs hero image and menu highlights before publishing."
      },
      {
        id: "restaurant-reef-table",
        name: "Reef Table",
        category: "Seafood",
        status: "Draft",
        owner: "Hassan Latheef",
        updated: "Jul 5, 2026",
        detail: "Opening hours and group dining notes are incomplete."
      }
    ]
  },
  experiences: {
    slug: "experiences",
    title: "Experience Content",
    eyebrow: "Excursion inventory",
    description: "Manage excursion listings, activity details, included items, duration, and trip-planner readiness.",
    addLabel: "Add new excursion",
    searchPlaceholder: "Search activities, guides, included items...",
    filters: ["All", "Published", "Ready", "Needs review"],
    items: [
      {
        id: "experience-north-reef",
        name: "North Reef Adventures",
        category: "Snorkeling",
        status: "Ready",
        owner: "Ibrahim Shafiu",
        updated: "Jul 9, 2026",
        detail: "Duration, guide notes, equipment, and pickup details complete."
      },
      {
        id: "experience-sandbank-day",
        name: "Private Sandbank Day",
        category: "Sandbank",
        status: "Published",
        owner: "Thoddoo Local Team",
        updated: "Jul 7, 2026",
        detail: "Premium media and concierge notes are ready."
      },
      {
        id: "experience-sunset-fishing",
        name: "Sunset Fishing Trip",
        category: "Fishing",
        status: "Needs review",
        owner: "Adam Waheed",
        updated: "Jul 4, 2026",
        detail: "Needs seasonal availability and inclusions check."
      }
    ]
  },
  transfers: {
    slug: "transfers",
    title: "Transfer Content",
    eyebrow: "Transport inventory",
    description: "Manage speedboat and transfer listings, departure times, capacity, and airport support notes.",
    addLabel: "Add transfer company",
    searchPlaceholder: "Search companies, boats, departure times...",
    filters: ["All", "Published", "Ready", "Archived"],
    items: [
      {
        id: "transfer-blue-channel",
        name: "Blue Channel Speedboat",
        category: "Premium Transfer",
        status: "Published",
        owner: "Ali Nizam",
        updated: "Jul 9, 2026",
        detail: "Boat name, capacity, airport support, and schedules are ready."
      },
      {
        id: "transfer-atoll-link",
        name: "Atoll Link Transfers",
        category: "Speedboat",
        status: "Ready",
        owner: "Hussain Riyaz",
        updated: "Jul 7, 2026",
        detail: "Ready for partner verification and content QA."
      },
      {
        id: "transfer-local-ferry",
        name: "Thoddoo Local Ferry Notes",
        category: "Ferry Operator",
        status: "Archived",
        owner: "Operations",
        updated: "Jul 1, 2026",
        detail: "Archived demo record for future schedule tooling."
      }
    ]
  },
  media: {
    slug: "media",
    title: "Media Library",
    eyebrow: "Asset readiness",
    description: "Review listing images, upload placeholders, media quality, and partner photography needs.",
    addLabel: "Upload photos",
    searchPlaceholder: "Search media sets, partner assets, galleries...",
    filters: ["All", "Published", "Draft", "Needs review"],
    items: [
      {
        id: "media-homepage-heroes",
        name: "Homepage Hero Gallery",
        category: "Website Media",
        status: "Published",
        owner: "iThoddoo Team",
        updated: "Jul 9, 2026",
        detail: "Hero images available for homepage and admin preview surfaces."
      },
      {
        id: "media-partner-rooms",
        name: "Guesthouse Room Set",
        category: "Partner Gallery",
        status: "Needs review",
        owner: "Content Team",
        updated: "Jul 8, 2026",
        detail: "Needs naming, crop review, and partner assignment."
      },
      {
        id: "media-food-gallery",
        name: "Restaurant Food Gallery",
        category: "Dining Media",
        status: "Draft",
        owner: "Local Photographer",
        updated: "Jul 6, 2026",
        detail: "Draft images staged for future upload workflow."
      }
    ]
  }
};
