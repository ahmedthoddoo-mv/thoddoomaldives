export type TransferType =
  | "public-speedboat"
  | "private-speedboat"
  | "public-ferry"
  | "seaplane";

export type TransferPricingUnit =
  | "per-person-one-way"
  | "per-person-return"
  | "per-group-one-way"
  | "per-group-return"
  | "on-request";

export type TransferDirectionSchedule = {
  label: string;
  departures: string[];
  operatingDays?: string;
  note?: string;
};

export type TransferSchedule = {
  timezone: string;
  directions: TransferDirectionSchedule[];
  fallbackMessage?: string;
};

export type TransferFleetItem = {
  model: string;
  vessels: number;
  capacityPerVessel: number;
  summary: string;
};

export type TransferAvailabilitySnapshot = {
  provider: "manual" | "google-sheets" | "other";
  statusMessage: string;
  isLive: boolean;
  lastSyncedAt?: string;
};

export type TransferFaq = {
  question: string;
  answer: string;
};

export type Transfer = {
  id: string;
  slug: string;
  title: string;
  type: TransferType;
  operatorName: string;
  route: string;
  description: string;
  shortDescription: string;
  duration: string;
  durationMinutes?: [number, number];
  price: string;
  pricingUnit: TransferPricingUnit;
  departurePoint: string;
  arrivalPoint: string;
  scheduleNote: string;
  schedule?: TransferSchedule;
  image: string;
  gallery?: string[];
  highlights: string[];
  inclusions: string[];
  importantInformation: string[];
  fleet?: TransferFleetItem[];
  totalFleet?: number;
  availability?: TransferAvailabilitySnapshot;
  featured: boolean;
  verified?: boolean;
  verificationStatus?: string;
  isPublished?: boolean;
  seo?: {
    title: string;
    description: string;
  };
  faqs?: TransferFaq[];
};

export type TransferEnquiryInput = {
  transferTitle: string;
  operatorName: string;
  tripType: "one-way" | "return";
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  departurePreference?: string;
  adults: number;
  children: number;
  infants: number;
  flightNumber?: string;
  flightTime?: string;
  guestName: string;
  whatsappNumber: string;
  guesthouse?: string;
  specialRequests?: string;
};
