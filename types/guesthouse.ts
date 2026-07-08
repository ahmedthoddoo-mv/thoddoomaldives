export type Room = {
  name: string;
  price: string;
  capacity: string;
  description: string;
  image: string;
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
  whatsapp: string;
  heroImage: string;
  gallery: string[];
  amenities: string[];
  rooms: Room[];
};