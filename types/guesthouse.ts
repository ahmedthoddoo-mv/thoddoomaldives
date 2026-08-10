export type Room = {
  id?: string;
  name: string;
  price: string;
  capacity: string;
  occupancy: string;
  bedType: string;
  description: string;
  image: string;
  amenities: string[];
  breakfast: string;
  quantity?: number;
  featured?: boolean;
  gallery?: string[];
  nightlyRate?: number | null;
  currency?: string;
};

export type NearbyAttraction = {
  name: string;
  distance: string;
  description: string;
};

export type PropertyContentSection = {
  title: string;
  body: string;
};

export type Guesthouse = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  location: string;
  distanceToBeach: string;
  rating: string;
  verificationStatus?: "Verified" | "New";
  priceFrom: string;
  whatsapp: string;
  heroImage: string;
  gallery: string[];
  media?: import("@/types/business-media").BusinessMediaItem[];
  amenities: string[];
  facilities?: string[];
  bookingChannels?: string[];
  bookingLinks?: {
    bookingComUrl?: string;
    airbnbUrl?: string;
    expediaUrl?: string;
    directBookingUrl?: string;
  };
  about: PropertyContentSection[];
  nearbyAttractions: NearbyAttraction[];
  relatedExperienceSlugs: string[];
  testimonialIds: string[];
  rooms: Room[];
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  checkIn?: string;
  checkOut?: string;
  services?: Array<{ id: string; name: string; description: string; price: number | null; currency: string; unit: string }>;
  availability?: import("@/types/availability").RoomAvailability[];
  membershipBadge?: string;
  partnerBadge?: string;
  mapUrl?: string;
};
