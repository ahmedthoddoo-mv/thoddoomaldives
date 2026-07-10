export type AdminContentStatus = "Published" | "Draft" | "Needs review" | "Archived" | "Ready";

export type AdminPropertyAction =
  | "Add Property"
  | "Edit Property"
  | "Delete Property"
  | "Verify Property"
  | "Feature Property"
  | "Suspend Property";

export type AdminPropertyRoomType = {
  name: string;
  price: string;
  capacity: string;
};

export type AdminPropertySeoFields = {
  title: string;
  description: string;
  slug: string;
};

export type AdminManagedProperty = {
  id: string;
  name: string;
  slug: string;
  island: string;
  address: string;
  logo: string;
  coverImage: string;
  gallery: string[];
  description: string;
  shortDescription: string;
  fullDescription: string;
  roomTypes: AdminPropertyRoomType[];
  amenities: string[];
  policies: string[];
  checkIn: string;
  checkOut: string;
  whatsapp: string;
  email: string;
  website: string;
  googleMaps: string;
  googleMapsLink: string;
  gpsLocation: string;
  membershipPlan: "Free" | "Verified" | "Premium";
  verificationStatus: "Draft" | "Pending" | "Verified" | "Suspended";
  isPublished: boolean;
  isFeatured: boolean;
  isArchived: boolean;
  seo: AdminPropertySeoFields;
  updated: string;
};

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
  { label: "Dashboard", href: "/admin#overview" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "CRM", href: "/admin/crm" },
  { label: "Guesthouses", href: "/admin/guesthouses" },
  { label: "Restaurants", href: "/admin/restaurants" },
  { label: "Experiences", href: "/admin/experiences" },
  { label: "Transfers", href: "/admin/transfers" },
  { label: "Partners", href: "/admin/properties" },
  { label: "Media", href: "/admin/media" },
  { label: "Reports", href: "/admin/property-dashboard" },
  { label: "Settings", href: "/admin#status" },
  { label: "Roadmap", href: "/admin#roadmap" }
];

export const adminQuickActions = [
  { label: "Add Property", href: "/admin/properties/new", variant: "primary" as const },
  { label: "New Booking", href: "/admin/bookings", variant: "primary" as const },
  { label: "Open CRM", href: "/admin/crm", variant: "primary" as const },
  { label: "Add Guesthouse", href: "/admin/guesthouses/new", variant: "primary" as const },
  { label: "Add Restaurant", href: "/admin/restaurants/new" },
  { label: "Add Excursion", href: "/admin/experiences/new" },
  { label: "Add Transfer Company", href: "/admin/transfers/new" },
  { label: "Review Applications", href: "/admin#applications", variant: "primary" as const },
  { label: "Upload Photos", href: "/admin/media" }
];

export const adminPropertyActions: AdminPropertyAction[] = [
  "Add Property",
  "Edit Property",
  "Delete Property",
  "Verify Property",
  "Feature Property",
  "Suspend Property"
];

export const adminManagedProperties: AdminManagedProperty[] = [
  {
    id: "property-thoddoo-sun-sky",
    name: "Thoddoo Sun Sky Inn",
    slug: "thoddoo-sun-sky-inn",
    island: "Thoddoo",
    address: "Central Thoddoo, Alif Alif Atoll, Maldives",
    logo: "TS",
    coverImage: "/images/hero-thoddoo.jpg",
    gallery: ["/images/hero-thoddoo.jpg", "/images/homepage/hero-1.jpg", "/images/homepage/hero-4.jpg"],
    description:
      "Verified guesthouse profile with room content, beach access notes, direct WhatsApp booking, and structured SEO fields.",
    shortDescription: "Verified guesthouse profile with breakfast, beach access notes, and direct WhatsApp booking.",
    fullDescription:
      "Thoddoo Sun Sky Inn is a verified partner property prepared for travelers who want a simple local stay with clear room details, useful amenities, WhatsApp booking support, and SEO-ready content for future public publishing.",
    roomTypes: [
      { name: "Deluxe Double", price: "From $85/night", capacity: "2 guests" },
      { name: "Family Room", price: "From $130/night", capacity: "4 guests" }
    ],
    amenities: ["Breakfast", "Wi-Fi", "Airport transfer help", "Beach towels", "Bicycles"],
    policies: ["Free cancellation until 7 days before arrival", "Passport details required at check-in", "No alcohol on local island"],
    checkIn: "14:00",
    checkOut: "12:00",
    whatsapp: "+960 914 2538",
    email: "stay@thoddoosunsky.example",
    website: "https://thoddoosunsky.example",
    googleMaps: "Central Thoddoo, Alif Alif Atoll",
    googleMapsLink: "https://maps.google.com/?q=Thoddoo+Sun+Sky+Inn",
    gpsLocation: "4.4376, 72.9596",
    membershipPlan: "Verified",
    verificationStatus: "Verified",
    isPublished: true,
    isFeatured: true,
    isArchived: false,
    seo: {
      title: "Thoddoo Sun Sky Inn | Verified Guesthouse",
      description: "Book Thoddoo Sun Sky Inn with local support, breakfast, beach access, and WhatsApp booking.",
      slug: "thoddoo-sun-sky-inn"
    },
    updated: "Jul 9, 2026"
  },
  {
    id: "property-palm-garden",
    name: "Palm Garden Thoddoo",
    slug: "palm-garden-thoddoo",
    island: "Thoddoo",
    address: "Palm Garden Road, Thoddoo, Maldives",
    logo: "PG",
    coverImage: "/images/homepage/hero-2.jpg",
    gallery: ["/images/homepage/hero-2.jpg", "/images/homepage/hero-3.jpg"],
    description:
      "Growth partner applicant with room inventory, amenities, and content review pending before verification.",
    shortDescription: "Growth partner applicant with room inventory and content review pending before verification.",
    fullDescription:
      "Palm Garden Thoddoo is a demo property record showing how admins can prepare guesthouse content, gallery paths, contact details, and verification notes before a future database workflow publishes it live.",
    roomTypes: [
      { name: "Garden Room", price: "From $72/night", capacity: "2 guests" },
      { name: "Triple Room", price: "From $105/night", capacity: "3 guests" }
    ],
    amenities: ["Garden", "Breakfast", "Wi-Fi", "Laundry support"],
    policies: ["Breakfast included on selected rates", "Check transfer timing before arrival", "Quiet hours after 22:00"],
    checkIn: "13:00",
    checkOut: "11:00",
    whatsapp: "+960 700 1020",
    email: "hello@palmgarden.example",
    website: "https://palmgarden.example",
    googleMaps: "Palm Garden Road, Thoddoo",
    googleMapsLink: "https://maps.google.com/?q=Palm+Garden+Thoddoo",
    gpsLocation: "4.4380, 72.9611",
    membershipPlan: "Free",
    verificationStatus: "Pending",
    isPublished: false,
    isFeatured: false,
    isArchived: false,
    seo: {
      title: "Palm Garden Thoddoo Guesthouse",
      description: "Palm Garden Thoddoo guesthouse profile prepared for review and future verification.",
      slug: "palm-garden-thoddoo"
    },
    updated: "Jul 8, 2026"
  },
  {
    id: "property-coral-wave",
    name: "Coral Wave Residence",
    slug: "coral-wave-residence",
    island: "Thoddoo",
    address: "Beach Route, Thoddoo, Maldives",
    logo: "CW",
    coverImage: "/images/homepage/hero-5.jpg",
    gallery: ["/images/homepage/hero-5.jpg", "/images/homepage/hero-6.jpg"],
    description:
      "Premium-ready property mock record for future analytics, featured placement, and rich media workflows.",
    shortDescription: "Premium-ready property record for featured placement and rich media workflows.",
    fullDescription:
      "Coral Wave Residence is a premium demo profile used to validate suspension, featured placement, gallery management, SEO fields, room pricing, and future analytics connection points inside the admin CMS.",
    roomTypes: [
      { name: "Premium Suite", price: "From $165/night", capacity: "2 guests" },
      { name: "Two Bedroom Suite", price: "From $240/night", capacity: "5 guests" }
    ],
    amenities: ["Premium breakfast", "Private balcony", "Concierge support", "Professional photography"],
    policies: ["Deposit may be requested for peak dates", "Guest transfer support available", "Property is currently hidden from public recommendations"],
    checkIn: "15:00",
    checkOut: "12:00",
    whatsapp: "+960 700 2040",
    email: "reservations@coralwave.example",
    website: "https://coralwave.example",
    googleMaps: "Beach Route, Thoddoo",
    googleMapsLink: "https://maps.google.com/?q=Coral+Wave+Residence+Thoddoo",
    gpsLocation: "4.4392, 72.9584",
    membershipPlan: "Premium",
    verificationStatus: "Suspended",
    isPublished: false,
    isFeatured: false,
    isArchived: false,
    seo: {
      title: "Coral Wave Residence | Premium Thoddoo Stay",
      description: "Premium residence demo profile with suite inventory, gallery assets, and future analytics readiness.",
      slug: "coral-wave-residence"
    },
    updated: "Jul 5, 2026"
  }
];

export function getAdminManagedPropertyById(id: string) {
  return adminManagedProperties.find((property) => property.id === id);
}

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
