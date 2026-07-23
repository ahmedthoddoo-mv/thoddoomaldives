import type { PlatformEntityReference } from "@/types/platform";

export type PublicationStatus = "Draft" | "Published" | "Archived";
export type VerificationStatus = "Unverified" | "Pending" | "Verified";
export type ContentAction = "preview" | "publish" | "unpublish" | "verify" | "feature" | "archive" | "delete";
export type AdminCmsSectionSlug = "guesthouses" | "restaurants" | "experiences" | "transfers";
export type AdminCmsFieldType = "text" | "email" | "url" | "textarea" | "select" | "multiline" | "boolean";

export type AdminCmsField = {
  name: string;
  label: string;
  type: AdminCmsFieldType;
  placeholder?: string;
  options?: string[];
  rows?: number;
  wide?: boolean;
};

export type AdminCmsRecordBase = {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  heroImage: string;
  gallery: string[];
  publicationStatus: PublicationStatus;
  verificationStatus: VerificationStatus;
  isFeatured: boolean;
  updated: string;
  seoTitle: string;
  seoDescription: string;
};

export type GuesthouseAdminRoom = {
  roomName: string;
  bedType: string;
  capacity: string;
  adults: string;
  children: string;
  pricePerNight: string;
  breakfastIncluded: boolean;
  description: string;
  amenities: string[];
  roomImages: string[];
  active: boolean;
};

export type GuesthouseAdminRecord = AdminCmsRecordBase & {
  section: "guesthouses";
  propertyName: string;
  island: string;
  address: string;
  gpsCoordinates: string;
  googleMapsLink: string;
  whatsapp: string;
  email: string;
  website: string;
  socialLinks: string[];
  shortDescription: string;
  fullDescription: string;
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  policies: string[];
  membershipPlan: "Free" | "Verified" | "Premium";
  rooms: GuesthouseAdminRoom[];
};

export type RestaurantAdminRecord = AdminCmsRecordBase & {
  section: "restaurants";
  restaurantName: string;
  cuisine: string;
  description: string;
  openingHours: string;
  address: string;
  googleMapsLink: string;
  whatsapp: string;
  phone: string;
  email: string;
  websiteSocialLinks: string[];
  vegetarianOptions: boolean;
  seafood: boolean;
  servesBreakfast: boolean;
  servesLunch: boolean;
  servesDinner: boolean;
  menuHighlights: string[];
  menuUploadPlaceholder: string;
};

export type ExperienceAdminRecord = AdminCmsRecordBase & {
  section: "experiences";
  experienceName: string;
  experienceCategory: string;
  description: string;
  duration: string;
  price: string;
  minimumGuests: string;
  maximumGuests: string;
  familyFriendly: boolean;
  difficulty: "Easy" | "Moderate" | "Advanced";
  includedItems: string[];
  excludedItems: string[];
  whatToBring: string[];
  meetingPoint: string;
  safetyNotes: string;
  operator: string;
  whatsapp: string;
};

export type TransferAdminRecord = AdminCmsRecordBase & {
  section: "transfers";
  companyName: string;
  transferType: "Speedboat" | "Ferry" | "Private charter" | "Airport transfer" | "Seaplane" | "Other";
  boatFerryName: string;
  route: string;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  adultPrice: string;
  childPrice: string;
  infantPolicy: string;
  luggagePolicy: string;
  capacity: string;
  airportTransferSupport: boolean;
  serviceMode: "Public" | "Private";
  whatsapp: string;
  phone: string;
  email: string;
};

export type AdminCmsRecord =
  | GuesthouseAdminRecord
  | RestaurantAdminRecord
  | ExperienceAdminRecord
  | TransferAdminRecord;

export type AdminCmsSectionConfig = {
  slug: AdminCmsSectionSlug;
  title: string;
  eyebrow: string;
  description: string;
  addLabel: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  fields: AdminCmsField[];
  records: AdminCmsRecord[];
};

export type MediaAsset = {
  id: string;
  filename: string;
  path: string;
  category:
    | "Hero"
    | "Guesthouses"
    | "Rooms"
    | "Restaurants"
    | "Food"
    | "Experiences"
    | "Transfers"
    | "Beaches"
    | "Drone"
    | "Farms"
    | "Gallery"
    | "Logos"
    | "Staff"
    | "Videos"
    | "Other";
  fileType: "image/jpeg" | "image/svg+xml" | "video/mp4";
  width: number;
  height: number;
  fileSize: string;
  tags: string[];
  caption: string;
  altText: string;
  uploadedDate: string;
  updatedDate: string;
  usageCount: number;
  usedBy: string[];
  usedByEntities?: PlatformEntityReference[];
  isHero: boolean;
  archived: boolean;
  source: string;
  rightsStatus: "Permission confirmed" | "Needs confirmation" | "Internal demo asset";
};

const commonFields: AdminCmsField[] = [
  { name: "title", label: "Display title", type: "text", wide: true },
  { name: "slug", label: "Slug", type: "text" },
  { name: "category", label: "Category", type: "text" },
  { name: "summary", label: "Short summary", type: "textarea", rows: 3, wide: true },
  { name: "heroImage", label: "Hero image path", type: "text", placeholder: "/images/hero-thoddoo.jpg", wide: true },
  { name: "gallery", label: "Gallery image paths", type: "multiline", rows: 4, wide: true },
  { name: "publicationStatus", label: "Publication status", type: "select", options: ["Draft", "Published", "Archived"] },
  { name: "verificationStatus", label: "Verification status", type: "select", options: ["Unverified", "Pending", "Verified"] },
  { name: "isFeatured", label: "Featured", type: "boolean" },
  { name: "seoTitle", label: "SEO title", type: "text", wide: true },
  { name: "seoDescription", label: "SEO description", type: "textarea", rows: 3, wide: true }
];

export const guesthouseFields: AdminCmsField[] = [
  { name: "propertyName", label: "Property name", type: "text", wide: true },
  { name: "island", label: "Island", type: "text" },
  { name: "address", label: "Address", type: "text" },
  { name: "gpsCoordinates", label: "GPS coordinates", type: "text" },
  { name: "googleMapsLink", label: "Google Maps link", type: "url" },
  { name: "whatsapp", label: "WhatsApp", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "website", label: "Website", type: "url" },
  { name: "socialLinks", label: "Social links", type: "multiline", rows: 3, wide: true },
  { name: "shortDescription", label: "Short description", type: "textarea", rows: 3, wide: true },
  { name: "fullDescription", label: "Full description", type: "textarea", rows: 6, wide: true },
  { name: "amenities", label: "Amenities", type: "multiline", rows: 4, wide: true },
  { name: "checkInTime", label: "Check-in time", type: "text" },
  { name: "checkOutTime", label: "Check-out time", type: "text" },
  { name: "policies", label: "Policies", type: "multiline", rows: 4, wide: true },
  { name: "membershipPlan", label: "Membership plan", type: "select", options: ["Free", "Verified", "Premium"] },
  ...commonFields
];

export const restaurantFields: AdminCmsField[] = [
  { name: "restaurantName", label: "Restaurant name", type: "text", wide: true },
  { name: "cuisine", label: "Cuisine", type: "text" },
  { name: "description", label: "Description", type: "textarea", rows: 5, wide: true },
  { name: "openingHours", label: "Opening hours", type: "text" },
  { name: "address", label: "Address", type: "text" },
  { name: "googleMapsLink", label: "Google Maps link", type: "url", wide: true },
  { name: "whatsapp", label: "WhatsApp", type: "text" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "websiteSocialLinks", label: "Website/social links", type: "multiline", rows: 3, wide: true },
  { name: "vegetarianOptions", label: "Vegetarian options", type: "boolean" },
  { name: "seafood", label: "Seafood", type: "boolean" },
  { name: "servesBreakfast", label: "Breakfast", type: "boolean" },
  { name: "servesLunch", label: "Lunch", type: "boolean" },
  { name: "servesDinner", label: "Dinner", type: "boolean" },
  { name: "menuHighlights", label: "Menu highlights", type: "multiline", rows: 4, wide: true },
  { name: "menuUploadPlaceholder", label: "Menu upload placeholder", type: "text", wide: true },
  ...commonFields
];

export const experienceFields: AdminCmsField[] = [
  { name: "experienceName", label: "Experience name", type: "text", wide: true },
  {
    name: "experienceCategory",
    label: "Category",
    type: "select",
    options: ["Snorkeling", "Sandbank", "Fishing", "Diving", "Watersports", "Dolphin trip", "Farm tour", "Photography", "Private charter", "Other"]
  },
  { name: "description", label: "Description", type: "textarea", rows: 5, wide: true },
  { name: "duration", label: "Duration", type: "text" },
  { name: "price", label: "Price", type: "text" },
  { name: "minimumGuests", label: "Minimum guests", type: "text" },
  { name: "maximumGuests", label: "Maximum guests", type: "text" },
  { name: "familyFriendly", label: "Family-friendly", type: "boolean" },
  { name: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Moderate", "Advanced"] },
  { name: "includedItems", label: "Included items", type: "multiline", rows: 4, wide: true },
  { name: "excludedItems", label: "Excluded items", type: "multiline", rows: 3, wide: true },
  { name: "whatToBring", label: "What to bring", type: "multiline", rows: 3, wide: true },
  { name: "meetingPoint", label: "Meeting point", type: "text", wide: true },
  { name: "safetyNotes", label: "Safety notes", type: "textarea", rows: 4, wide: true },
  { name: "operator", label: "Operator", type: "text" },
  { name: "whatsapp", label: "WhatsApp", type: "text" },
  ...commonFields
];

export const transferFields: AdminCmsField[] = [
  { name: "companyName", label: "Company name", type: "text", wide: true },
  { name: "transferType", label: "Transfer type", type: "select", options: ["Speedboat", "Ferry", "Private charter", "Airport transfer", "Seaplane", "Other"] },
  { name: "boatFerryName", label: "Boat/ferry name", type: "text" },
  { name: "route", label: "Route", type: "text" },
  { name: "departureLocation", label: "Departure location", type: "text" },
  { name: "arrivalLocation", label: "Arrival location", type: "text" },
  { name: "departureTime", label: "Departure time", type: "text" },
  { name: "arrivalTime", label: "Arrival time", type: "text" },
  { name: "duration", label: "Duration", type: "text" },
  { name: "adultPrice", label: "Adult price", type: "text" },
  { name: "childPrice", label: "Child price", type: "text" },
  { name: "infantPolicy", label: "Infant policy", type: "text", wide: true },
  { name: "luggagePolicy", label: "Luggage policy", type: "text", wide: true },
  { name: "capacity", label: "Capacity", type: "text" },
  { name: "airportTransferSupport", label: "Airport transfer support", type: "boolean" },
  { name: "serviceMode", label: "Public/private service", type: "select", options: ["Public", "Private"] },
  { name: "whatsapp", label: "WhatsApp", type: "text" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "email", label: "Email", type: "email" },
  ...commonFields
];

export const adminCmsSections: Record<AdminCmsSectionSlug, AdminCmsSectionConfig> = {
  guesthouses: {
    slug: "guesthouses",
    title: "Guesthouse CMS",
    eyebrow: "Stay content",
    description: "Manage guesthouse profiles, rooms, media, publication state, partner verification, and SEO readiness.",
    addLabel: "Add guesthouse",
    searchPlaceholder: "Search guesthouses, rooms, amenities, contact details...",
    emptyTitle: "No guesthouses found",
    emptyDescription: "Clear filters or create a new guesthouse profile for the demo content inventory.",
    fields: guesthouseFields,
    records: [
      {
        id: "stay-thoddoo-sun-sky",
        section: "guesthouses",
        title: "Thoddoo Sun Sky Inn",
        propertyName: "Thoddoo Sun Sky Inn",
        slug: "thoddoo-sun-sky-inn",
        category: "Guesthouse",
        island: "Thoddoo",
        address: "Central Thoddoo, Alif Alif Atoll",
        gpsCoordinates: "4.4376, 72.9596",
        googleMapsLink: "https://maps.google.com/?q=Thoddoo+Sun+Sky+Inn",
        whatsapp: "+960 914 2538",
        email: "stay@thoddoosunsky.example",
        website: "https://thoddoosunsky.example",
        socialLinks: ["https://instagram.com/thoddoosunsky"],
        summary: "Verified guesthouse with breakfast, beach access notes, and direct WhatsApp booking.",
        shortDescription: "Verified guesthouse with breakfast, beach access notes, and direct WhatsApp booking.",
        fullDescription: "A comfortable partner guesthouse profile prepared for public publishing and future booking workflows.",
        heroImage: "/images/hero-thoddoo.jpg",
        gallery: ["/images/hero-thoddoo.jpg", "/images/homepage/hero-1.jpg", "/images/homepage/hero-4.jpg"],
        amenities: ["Breakfast", "Wi-Fi", "Beach towels", "Bicycles"],
        checkInTime: "14:00",
        checkOutTime: "12:00",
        policies: ["No alcohol on local island", "Passport required at check-in"],
        membershipPlan: "Verified",
        rooms: [
          {
            roomName: "Deluxe Double",
            bedType: "Queen bed",
            capacity: "2 guests",
            adults: "2",
            children: "1",
            pricePerNight: "$85",
            breakfastIncluded: true,
            description: "Bright double room with private bathroom and breakfast.",
            amenities: ["Air conditioning", "Private bathroom", "Wi-Fi"],
            roomImages: ["/images/homepage/hero-1.jpg"],
            active: true
          }
        ],
        publicationStatus: "Published",
        verificationStatus: "Verified",
        isFeatured: true,
        updated: "Jul 10, 2026",
        seoTitle: "Thoddoo Sun Sky Inn | Verified Guesthouse",
        seoDescription: "Book Thoddoo Sun Sky Inn with local support, breakfast, and direct WhatsApp booking."
      }
    ]
  },
  restaurants: {
    slug: "restaurants",
    title: "Restaurant CMS",
    eyebrow: "Dining content",
    description: "Manage restaurant pages, menu highlights, service flags, media, verification, and SEO fields.",
    addLabel: "Add restaurant",
    searchPlaceholder: "Search restaurants, cuisine, menus, contact details...",
    emptyTitle: "No restaurants found",
    emptyDescription: "Clear filters or add a new restaurant profile.",
    fields: restaurantFields,
    records: [
      {
        id: "restaurant-island-bites",
        section: "restaurants",
        title: "Island Bites",
        restaurantName: "Island Bites",
        slug: "island-bites",
        category: "Local Dining",
        cuisine: "Maldivian, seafood, cafe",
        description: "Local dining profile with seafood, breakfast service, and casual island meals.",
        openingHours: "07:00 - 22:30",
        address: "Main Road, Thoddoo",
        googleMapsLink: "https://maps.google.com/?q=Island+Bites+Thoddoo",
        whatsapp: "+960 700 3040",
        phone: "+960 700 3040",
        email: "hello@islandbites.example",
        websiteSocialLinks: ["https://instagram.com/islandbites"],
        vegetarianOptions: true,
        seafood: true,
        servesBreakfast: true,
        servesLunch: true,
        servesDinner: true,
        menuHighlights: ["Grilled reef fish", "Mas huni breakfast", "Fresh fruit juices"],
        menuUploadPlaceholder: "menu-island-bites.pdf",
        summary: "Verified local restaurant with seafood, vegetarian options, and all-day service.",
        heroImage: "/images/homepage/hero-3.jpg",
        gallery: ["/images/homepage/hero-3.jpg", "/images/homepage/hero-4.jpg"],
        publicationStatus: "Published",
        verificationStatus: "Verified",
        isFeatured: true,
        updated: "Jul 10, 2026",
        seoTitle: "Island Bites Thoddoo Restaurant",
        seoDescription: "Explore Island Bites in Thoddoo for local seafood, breakfast, lunch, dinner, and island cafe dining."
      }
    ]
  },
  experiences: {
    slug: "experiences",
    title: "Experience CMS",
    eyebrow: "Tour content",
    description: "Manage excursions, inclusions, safety notes, operators, media, publication status, and SEO.",
    addLabel: "Add experience",
    searchPlaceholder: "Search experiences, operators, inclusions, categories...",
    emptyTitle: "No experiences found",
    emptyDescription: "Clear filters or add a new excursion record.",
    fields: experienceFields,
    records: [
      {
        id: "experience-north-reef",
        section: "experiences",
        title: "North Reef Adventures",
        experienceName: "North Reef Adventures",
        slug: "north-reef-adventures",
        category: "Snorkeling",
        experienceCategory: "Snorkeling",
        description: "Guided reef trip with safety briefing, equipment, and local operator support.",
        duration: "3 hours",
        price: "From $45",
        minimumGuests: "2",
        maximumGuests: "10",
        familyFriendly: true,
        difficulty: "Easy",
        includedItems: ["Snorkeling gear", "Water", "Guide"],
        excludedItems: ["Lunch", "Private transfer"],
        whatToBring: ["Towel", "Reef-safe sunscreen", "Dry bag"],
        meetingPoint: "Thoddoo harbor",
        safetyNotes: "Weather dependent. Life jackets available on request.",
        operator: "North Reef Local Team",
        whatsapp: "+960 700 4050",
        summary: "Family-friendly guided reef snorkeling with local operator support.",
        heroImage: "/images/homepage/hero-5.jpg",
        gallery: ["/images/homepage/hero-5.jpg", "/images/homepage/hero-6.jpg"],
        publicationStatus: "Draft",
        verificationStatus: "Pending",
        isFeatured: false,
        updated: "Jul 9, 2026",
        seoTitle: "North Reef Adventures Thoddoo",
        seoDescription: "Book a guided reef snorkeling trip in Thoddoo with equipment, guide, and safety support."
      }
    ]
  },
  transfers: {
    slug: "transfers",
    title: "Transfer CMS",
    eyebrow: "Transport content",
    description: "Manage transfer operators, schedules, route content, service flags, media, and SEO.",
    addLabel: "Add transfer",
    searchPlaceholder: "Search transfer companies, routes, times, boats...",
    emptyTitle: "No transfers found",
    emptyDescription: "Clear filters or add a new transport company record.",
    fields: transferFields,
    records: [
      {
        id: "transfer-blue-channel",
        section: "transfers",
        title: "Blue Channel Speedboat",
        companyName: "Blue Channel Speedboat",
        slug: "blue-channel-speedboat",
        category: "Speedboat",
        transferType: "Speedboat",
        boatFerryName: "Blue Channel 7",
        route: "Male Airport to Thoddoo",
        departureLocation: "Velana International Airport",
        arrivalLocation: "Thoddoo Harbor",
        departureTime: "16:00",
        arrivalTime: "17:20",
        duration: "1 hour 20 minutes",
        adultPrice: "$45",
        childPrice: "$25",
        infantPolicy: "Infants travel free when seated with an adult.",
        luggagePolicy: "One suitcase and one hand carry included.",
        capacity: "35 passengers",
        airportTransferSupport: true,
        serviceMode: "Public",
        whatsapp: "+960 700 5070",
        phone: "+960 700 5070",
        email: "bookings@bluechannel.example",
        summary: "Verified airport speedboat transfer with daily service and luggage support.",
        heroImage: "/images/homepage/hero-6.jpg",
        gallery: ["/images/homepage/hero-6.jpg", "/images/hero-thoddoo.jpg"],
        publicationStatus: "Published",
        verificationStatus: "Verified",
        isFeatured: true,
        updated: "Jul 10, 2026",
        seoTitle: "Blue Channel Speedboat Transfer to Thoddoo",
        seoDescription: "Book Blue Channel Speedboat from Velana International Airport to Thoddoo with local support."
      }
    ]
  }
};

// Legacy design-reference assets are intentionally not exposed in the production
// dashboard. Real uploads will come from Supabase Storage.
const legacyMediaAssets: MediaAsset[] = [
  {
    id: "media-hero-thoddoo",
    filename: "hero-thoddoo.jpg",
    path: "/images/hero-thoddoo.jpg",
    category: "Hero",
    fileType: "image/jpeg",
    width: 4000,
    height: 2250,
    fileSize: "1.3 MB",
    tags: ["homepage", "island", "hero", "beach"],
    caption: "Wide Thoddoo island hero image used across premium landing sections.",
    altText: "Aerial-style view of turquoise water and Thoddoo island shoreline.",
    uploadedDate: "Jul 24, 2022",
    updatedDate: "Jul 10, 2026",
    usageCount: 5,
    usedBy: ["/", "/partners", "/admin", "Homepage hero carousel", "Partner preview cards"],
    usedByEntities: [
      { entityType: "property", entityId: "property-thoddoo-sun-sky", usage: "Hero image" },
      { entityType: "partner", entityId: "partner-thoddoo-sun-sky", usage: "Partner portal cover" },
      { entityType: "media", entityId: "media-hero-thoddoo", usage: "Media library hero asset" }
    ],
    isHero: true,
    archived: false,
    source: "iThoddoo Maldives content archive",
    rightsStatus: "Internal demo asset"
  },
  {
    id: "media-guesthouse-terrace",
    filename: "hero-1.jpg",
    path: "/images/homepage/hero-1.jpg",
    category: "Guesthouses",
    fileType: "image/jpeg",
    width: 4000,
    height: 2250,
    fileSize: "10 MB",
    tags: ["guesthouse", "partner", "stay", "gallery"],
    caption: "Guesthouse lifestyle image for partner stay profiles.",
    altText: "Guesthouse partner image with tropical island atmosphere.",
    uploadedDate: "Sep 13, 2022",
    updatedDate: "Jul 10, 2026",
    usageCount: 4,
    usedBy: ["/stay", "/admin/guesthouses", "/admin/properties", "Guesthouse CMS preview"],
    usedByEntities: [
      { entityType: "property", entityId: "property-thoddoo-sun-sky", usage: "Gallery image" },
      { entityType: "room", entityId: "room-deluxe", usage: "Room photo" },
      { entityType: "partner", entityId: "partner-thoddoo-sun-sky", usage: "Partner gallery" }
    ],
    isHero: false,
    archived: false,
    source: "Partner media demo set",
    rightsStatus: "Needs confirmation"
  },
  {
    id: "media-guesthouse-garden",
    filename: "hero-2.jpg",
    path: "/images/homepage/hero-2.jpg",
    category: "Guesthouses",
    fileType: "image/jpeg",
    width: 2240,
    height: 3360,
    fileSize: "1.0 MB",
    tags: ["guesthouse", "garden", "vertical", "partner"],
    caption: "Vertical guesthouse image suited for profile cards and mobile previews.",
    altText: "Vertical island guesthouse lifestyle image.",
    uploadedDate: "Feb 2, 2025",
    updatedDate: "Jul 10, 2026",
    usageCount: 3,
    usedBy: ["/stay", "/admin/properties", "Partner onboarding preview"],
    usedByEntities: [
      { entityType: "property", entityId: "property-thoddoo-sun-sky", usage: "Gallery image" },
      { entityType: "room", entityId: "room-family", usage: "Room photo" }
    ],
    isHero: false,
    archived: false,
    source: "Local partner demo media",
    rightsStatus: "Needs confirmation"
  },
  {
    id: "media-restaurant-food",
    filename: "hero-3.jpg",
    path: "/images/homepage/hero-3.jpg",
    category: "Food",
    fileType: "image/jpeg",
    width: 6720,
    height: 4479,
    fileSize: "7.3 MB",
    tags: ["restaurant", "food", "menu", "dining"],
    caption: "Restaurant and food content placeholder for dining listings.",
    altText: "Island dining and food media for restaurant listings.",
    uploadedDate: "Feb 22, 2022",
    updatedDate: "Jul 10, 2026",
    usageCount: 4,
    usedBy: ["/restaurants", "/admin/restaurants", "Restaurant CMS hero", "Media picker"],
    usedByEntities: [
      { entityType: "restaurant", entityId: "restaurant-island-bites", usage: "Restaurant hero" },
      { entityType: "media", entityId: "media-restaurant-food", usage: "Food gallery asset" }
    ],
    isHero: false,
    archived: false,
    source: "Restaurant demo gallery",
    rightsStatus: "Needs confirmation"
  },
  {
    id: "media-room-preview",
    filename: "hero-4.jpg",
    path: "/images/homepage/hero-4.jpg",
    category: "Rooms",
    fileType: "image/jpeg",
    width: 2436,
    height: 1827,
    fileSize: "1.5 MB",
    tags: ["room", "guesthouse", "interior", "stay"],
    caption: "Room preview image for guesthouse room cards.",
    altText: "Guesthouse room preview image for room type listings.",
    uploadedDate: "Jan 20, 2025",
    updatedDate: "Jul 10, 2026",
    usageCount: 2,
    usedBy: ["/stay/thoddoo-sun-sky-inn", "/admin/guesthouses/stay-thoddoo-sun-sky/edit"],
    usedByEntities: [
      { entityType: "property", entityId: "property-thoddoo-sun-sky", usage: "Room gallery" },
      { entityType: "room", entityId: "room-deluxe", usage: "Room detail image" }
    ],
    isHero: false,
    archived: false,
    source: "Room inventory demo media",
    rightsStatus: "Needs confirmation"
  },
  {
    id: "media-experience-sandbank",
    filename: "hero-5.jpg",
    path: "/images/homepage/hero-5.jpg",
    category: "Experiences",
    fileType: "image/jpeg",
    width: 960,
    height: 1280,
    fileSize: "490 KB",
    tags: ["experience", "sandbank", "tour", "vertical"],
    caption: "Experience image for excursions, sandbank trips, and mobile cards.",
    altText: "Vertical excursion image for Thoddoo experience listings.",
    uploadedDate: "Jan 27, 2025",
    updatedDate: "Jul 10, 2026",
    usageCount: 3,
    usedBy: ["/experiences", "/excursions", "/admin/experiences"],
    usedByEntities: [
      { entityType: "experience", entityId: "turtle-snorkeling", usage: "Experience card" },
      { entityType: "experience", entityId: "sandbank-escape", usage: "Related experience media" }
    ],
    isHero: false,
    archived: false,
    source: "Excursion demo media",
    rightsStatus: "Needs confirmation"
  },
  {
    id: "media-transfer-speedboat",
    filename: "hero-6.jpg",
    path: "/images/homepage/hero-6.jpg",
    category: "Transfers",
    fileType: "image/jpeg",
    width: 5040,
    height: 3360,
    fileSize: "4.3 MB",
    tags: ["speedboat", "airport", "transfer", "boat"],
    caption: "Speedboat transfer image for airport route and transfer company pages.",
    altText: "Speedboat transfer image for Thoddoo airport transport.",
    uploadedDate: "Jul 7, 2026",
    updatedDate: "Jul 10, 2026",
    usageCount: 4,
    usedBy: ["/transfer", "/admin/transfers", "/admin/bookings", "Transfer CMS hero"],
    usedByEntities: [
      { entityType: "transfer", entityId: "public-speedboat", usage: "Transfer card" },
      { entityType: "transfer", entityId: "private-speedboat", usage: "Transfer option media" },
      { entityType: "booking", entityId: "BK-1008", usage: "Selected transfer preview" }
    ],
    isHero: false,
    archived: false,
    source: "Transfer operator demo media",
    rightsStatus: "Permission confirmed"
  },
  {
    id: "media-beach-drone-wide",
    filename: "hero-thoddoo-beach-drone.jpg",
    path: "/images/hero-thoddoo.jpg",
    category: "Drone",
    fileType: "image/jpeg",
    width: 4000,
    height: 2250,
    fileSize: "1.3 MB",
    tags: ["drone", "beach", "island", "gallery"],
    caption: "Reusable drone/beach variant for destination gallery organization.",
    altText: "Wide image of Thoddoo coastline and turquoise lagoon.",
    uploadedDate: "Jul 24, 2022",
    updatedDate: "Jul 10, 2026",
    usageCount: 2,
    usedBy: ["/gallery", "/guide"],
    isHero: true,
    archived: false,
    source: "iThoddoo Maldives content archive",
    rightsStatus: "Internal demo asset"
  },
  {
    id: "media-brand-placeholder",
    filename: "ithoddoo-brand-placeholder.jpg",
    path: "/images/homepage/hero-2.jpg",
    category: "Logos",
    fileType: "image/jpeg",
    width: 2240,
    height: 3360,
    fileSize: "1.0 MB",
    tags: ["brand", "logo-placeholder", "partner"],
    caption: "Temporary brand/logo placeholder until dedicated logo files are added.",
    altText: "Temporary brand media placeholder for iThoddoo Maldives admin.",
    uploadedDate: "Feb 2, 2025",
    updatedDate: "Jul 10, 2026",
    usageCount: 1,
    usedBy: ["/admin/media", "Brand asset placeholder"],
    isHero: false,
    archived: false,
    source: "Placeholder based on existing valid image path",
    rightsStatus: "Internal demo asset"
  },
  {
    id: "media-staff-placeholder",
    filename: "staff-placeholder.jpg",
    path: "/images/homepage/hero-4.jpg",
    category: "Staff",
    fileType: "image/jpeg",
    width: 2436,
    height: 1827,
    fileSize: "1.5 MB",
    tags: ["staff", "operations", "placeholder"],
    caption: "Temporary staff category placeholder for future operations media.",
    altText: "Temporary staff media placeholder.",
    uploadedDate: "Jan 20, 2025",
    updatedDate: "Jul 10, 2026",
    usageCount: 0,
    usedBy: ["Not currently used"],
    isHero: false,
    archived: false,
    source: "Placeholder based on existing valid image path",
    rightsStatus: "Internal demo asset"
  }
];

void legacyMediaAssets;

Object.values(adminCmsSections).forEach((section) => {
  section.records = [];
});

export const mediaAssets: MediaAsset[] = [];

export function getMediaAssetById(id: string) {
  return mediaAssets.find((asset) => asset.id === id);
}

export function getAdminCmsSection(slug: AdminCmsSectionSlug) {
  return adminCmsSections[slug];
}

export function getAdminCmsRecord(sectionSlug: AdminCmsSectionSlug, id: string) {
  return adminCmsSections[sectionSlug].records.find((record) => record.id === id);
}

export function getEmptyAdminCmsRecord(sectionSlug: AdminCmsSectionSlug): Record<string, string | boolean | string[]> {
  const section = adminCmsSections[sectionSlug];
  const emptyRecord: Record<string, string | boolean | string[]> = {
    id: `new-${sectionSlug}`,
    title: "",
    slug: "",
    category: "",
    summary: "",
    heroImage: "/images/hero-thoddoo.jpg",
    gallery: ["/images/hero-thoddoo.jpg"],
    publicationStatus: "Draft",
    verificationStatus: "Unverified",
    isFeatured: false,
    updated: "Draft",
    seoTitle: "",
    seoDescription: ""
  };

  section.fields.forEach((field) => {
    if (emptyRecord[field.name] !== undefined) {
      return;
    }

    if (field.type === "boolean") {
      emptyRecord[field.name] = false;
    } else if (field.type === "multiline") {
      emptyRecord[field.name] = [];
    } else if (field.type === "select") {
      emptyRecord[field.name] = field.options?.[0] ?? "";
    } else {
      emptyRecord[field.name] = "";
    }
  });

  return emptyRecord;
}
