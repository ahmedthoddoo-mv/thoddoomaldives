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
  priceFrom: string;
  whatsapp: string;
  heroImage: string;
  gallery: string[];
  amenities: string[];
  about: PropertyContentSection[];
  nearbyAttractions: NearbyAttraction[];
  relatedExperienceSlugs: string[];
  testimonialIds: string[];
  rooms: Room[];
};
