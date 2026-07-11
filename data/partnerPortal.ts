export type PartnerPortalStat = {
  label: string;
  value: string;
  detail: string;
  tone?: "teal" | "green" | "gold" | "coral";
};

export type PartnerPortalProfile = {
  businessName: string;
  description: string;
  logo: string;
  coverImage: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  map: string;
  socialMedia: string[];
  policies: string[];
  languages: string[];
  membershipPlan: "Premium";
  renewalStatus: string;
  verificationStatus: "Verified";
  profileCompletion: string;
};

export type PartnerPortalBooking = {
  id: string;
  guest: string;
  summary: string;
  dates: string;
  room: string;
  status: "Upcoming" | "Pending" | "Completed" | "Cancelled";
  value: string;
  source: "WhatsApp" | "Website" | "Partner Portal";
};

export type PartnerPortalRoom = {
  id: string;
  name: string;
  price: string;
  seasonalPrice: string;
  discount: string;
  capacity: string;
  amenities: string[];
  photos: string[];
  availability: "Available" | "Limited" | "Blocked";
};

export type PartnerCalendarDay = {
  day: number;
  status: "Available" | "Occupied" | "Pending" | "Blocked";
  label?: string;
};

export type PartnerGalleryImage = {
  id: string;
  path: string;
  caption: string;
  isHero: boolean;
};

export type PartnerAnalyticsMetric = {
  label: string;
  value: string;
  change: string;
};

export type PartnerChartPoint = {
  label: string;
  value: number;
};

export type PartnerMembershipPlan = {
  name: "Free" | "Verified" | "Premium" | "Enterprise";
  price: string;
  description: string;
  features: string[];
  current?: boolean;
};

export const partnerProfile: PartnerPortalProfile = {
  businessName: "Thoddoo Sun Sky Inn",
  description:
    "Verified guesthouse partner offering comfortable rooms, local island guidance, transfer support, and direct WhatsApp booking for Thoddoo travelers.",
  logo: "TS",
  coverImage: "/images/hero-thoddoo.jpg",
  whatsapp: "+960 914 2538",
  email: "stay@thoddoosunsky.example",
  website: "https://thoddoosunsky.example",
  address: "Central Thoddoo, Alif Alif Atoll, Maldives",
  map: "https://maps.google.com/?q=Thoddoo+Sun+Sky+Inn",
  socialMedia: ["instagram.com/thoddoosunsky", "facebook.com/thoddoosunsky"],
  policies: ["Check-in from 14:00", "Check-out before 12:00", "No alcohol on local island"],
  languages: ["English", "Dhivehi", "Italian"],
  membershipPlan: "Premium",
  renewalStatus: "Renews Aug 2026",
  verificationStatus: "Verified",
  profileCompletion: "92%"
};

export const partnerStats: PartnerPortalStat[] = [
  { label: "Today's Bookings", value: "4", detail: "2 arrivals, 2 new requests", tone: "teal" },
  { label: "Pending Inquiries", value: "12", detail: "7 from WhatsApp", tone: "gold" },
  { label: "Confirmed Bookings", value: "28", detail: "Next 60 days", tone: "green" },
  { label: "Cancelled", value: "3", detail: "This month", tone: "coral" },
  { label: "Monthly Revenue", value: "$18.4k", detail: "Demo estimate", tone: "green" },
  { label: "Occupancy", value: "73%", detail: "August forecast", tone: "teal" },
  { label: "Average Stay", value: "4.8", detail: "Nights per booking", tone: "gold" },
  { label: "Conversion Rate", value: "18%", detail: "Inquiry to booking", tone: "teal" },
  { label: "WhatsApp Clicks", value: "246", detail: "Last 30 days", tone: "green" },
  { label: "Profile Completion", value: "92%", detail: "Media and policies ready", tone: "green" },
  { label: "Membership Plan", value: "Premium", detail: partnerProfile.renewalStatus, tone: "gold" },
  { label: "Verification Status", value: "Verified", detail: "Local team approved", tone: "green" }
];

export const partnerBookings: PartnerPortalBooking[] = [
  {
    id: "PB-2041",
    guest: "Maya R.",
    summary: "2 adults from United Kingdom",
    dates: "Aug 12 - Aug 17, 2026",
    room: "Deluxe Double",
    status: "Upcoming",
    value: "$600",
    source: "WhatsApp"
  },
  {
    id: "PB-2042",
    guest: "Daniel K.",
    summary: "Family booking, 2 adults and 2 children",
    dates: "Aug 20 - Aug 26, 2026",
    room: "Family Room",
    status: "Pending",
    value: "$915",
    source: "Website"
  },
  {
    id: "PB-2043",
    guest: "Elena S.",
    summary: "Solo traveler with breakfast add-on",
    dates: "Sep 2 - Sep 6, 2026",
    room: "Deluxe Double",
    status: "Completed",
    value: "$420",
    source: "Partner Portal"
  },
  {
    id: "PB-2044",
    guest: "Noah M.",
    summary: "Cancelled transfer-dependent request",
    dates: "Aug 4 - Aug 8, 2026",
    room: "Garden Room",
    status: "Cancelled",
    value: "$0",
    source: "WhatsApp"
  }
];

export const partnerRooms: PartnerPortalRoom[] = [
  {
    id: "room-deluxe",
    name: "Deluxe Double",
    price: "$85/night",
    seasonalPrice: "$105 high season",
    discount: "10% weekly stay",
    capacity: "2 adults + 1 child",
    amenities: ["Air conditioning", "Private bathroom", "Breakfast", "Wi-Fi"],
    photos: ["/images/homepage/hero-1.jpg", "/images/homepage/hero-4.jpg"],
    availability: "Available"
  },
  {
    id: "room-family",
    name: "Family Room",
    price: "$130/night",
    seasonalPrice: "$155 high season",
    discount: "Free breakfast for children",
    capacity: "4 guests",
    amenities: ["Two beds", "Private bathroom", "Balcony", "Beach towels"],
    photos: ["/images/homepage/hero-2.jpg", "/images/homepage/hero-5.jpg"],
    availability: "Limited"
  },
  {
    id: "room-garden",
    name: "Garden Room",
    price: "$72/night",
    seasonalPrice: "$88 high season",
    discount: "Stay 5 pay 4",
    capacity: "2 guests",
    amenities: ["Garden view", "Wi-Fi", "Laundry support"],
    photos: ["/images/homepage/hero-3.jpg"],
    availability: "Blocked"
  }
];

export const partnerCalendarDays: PartnerCalendarDay[] = Array.from({ length: 31 }, (_, index) => {
  const day = index + 1;
  if ([4, 5, 6, 18].includes(day)) {
    return { day, status: "Blocked", label: "Maintenance" };
  }
  if ([12, 13, 14, 15, 16, 17, 20, 21, 22, 23, 24, 25, 26].includes(day)) {
    return { day, status: "Occupied", label: "Booked" };
  }
  if ([7, 8, 27, 28].includes(day)) {
    return { day, status: "Pending", label: "Request" };
  }
  return { day, status: "Available" };
});

export const partnerGallery: PartnerGalleryImage[] = [
  { id: "gallery-hero", path: "/images/hero-thoddoo.jpg", caption: "Main cover image", isHero: true },
  { id: "gallery-room", path: "/images/homepage/hero-1.jpg", caption: "Room preview", isHero: false },
  { id: "gallery-garden", path: "/images/homepage/hero-2.jpg", caption: "Guesthouse vertical media", isHero: false },
  { id: "gallery-dining", path: "/images/homepage/hero-3.jpg", caption: "Breakfast and local dining mood", isHero: false },
  { id: "gallery-detail", path: "/images/homepage/hero-4.jpg", caption: "Interior and amenities", isHero: false },
  { id: "gallery-experience", path: "/images/homepage/hero-5.jpg", caption: "Island experience add-ons", isHero: false }
];

export const partnerAnalyticsMetrics: PartnerAnalyticsMetric[] = [
  { label: "Page Views", value: "4,820", change: "+18%" },
  { label: "Booking Requests", value: "142", change: "+9%" },
  { label: "WhatsApp Clicks", value: "246", change: "+21%" },
  { label: "Average Stay", value: "4.8 nights", change: "+0.4" },
  { label: "Revenue", value: "$18,450", change: "+12%" },
  { label: "Popular Room", value: "Deluxe Double", change: "42% share" }
];

export const partnerChartData: PartnerChartPoint[] = [
  { label: "Mon", value: 34 },
  { label: "Tue", value: 52 },
  { label: "Wed", value: 48 },
  { label: "Thu", value: 72 },
  { label: "Fri", value: 88 },
  { label: "Sat", value: 76 },
  { label: "Sun", value: 64 }
];

export const partnerTopCountries: PartnerChartPoint[] = [
  { label: "Italy", value: 38 },
  { label: "Germany", value: 27 },
  { label: "UK", value: 21 },
  { label: "France", value: 14 }
];

export const partnerMembershipPlans: PartnerMembershipPlan[] = [
  {
    name: "Free",
    price: "$0",
    description: "Starter listing and direct WhatsApp visibility.",
    features: ["Basic profile", "WhatsApp lead button", "Manual content updates"]
  },
  {
    name: "Verified",
    price: "$29/mo",
    description: "Trust badge, richer profile content, and verification support.",
    features: ["Verified badge", "Gallery support", "Priority content review"]
  },
  {
    name: "Premium",
    price: "$79/mo",
    description: "Growth dashboard, analytics, featured placement, and campaign support.",
    features: ["Analytics dashboard", "Featured placement", "Booking insights", "Media management"],
    current: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Multi-property support and advanced growth partnership.",
    features: ["Multiple properties", "Custom reporting", "Dedicated account support", "API-ready workflows"]
  }
];

export const partnerNavigation = [
  { label: "Dashboard", href: "/partner/dashboard" },
  { label: "Application", href: "/partner/application" },
  { label: "Profile", href: "/partner/profile" },
  { label: "Bookings", href: "/partner/bookings" },
  { label: "Calendar", href: "/partner/calendar" },
  { label: "Rooms", href: "/partner/rooms" },
  { label: "Gallery", href: "/partner/gallery" },
  { label: "Pricing", href: "/partner/pricing" },
  { label: "Analytics", href: "/partner/analytics" }
];
