export type BookingStatus = "new" | "pending" | "confirmed" | "cancelled" | "completed";

export type PaymentStatus = "demo-only" | "unpaid" | "deposit-requested" | "paid";

export type Membership = "free" | "verified" | "premium";

export type Partner = {
  id: string;
  name: string;
  membership: Membership;
  verificationStatus: "draft" | "pending" | "verified" | "suspended";
};

export type Room = {
  id: string;
  name: string;
  nightlyRate: number;
  capacity: string;
};

export type Property = {
  id: string;
  name: string;
  slug: string;
  whatsapp: string;
  partner: Partner;
  rooms: Room[];
};

export type Guest = {
  name: string;
  email?: string;
  whatsapp?: string;
  adults: number;
  children: number;
};

export type Transfer = {
  id: string;
  name: string;
  price: number;
};

export type Experience = {
  id: string;
  name: string;
  price: number;
};

export type Commission = {
  rate: number;
  bookingTotal: number;
  companyRevenue: number;
  partnerRevenue: number;
};

export type BookingService = {
  id: string;
  name: string;
  price: number;
  type: "transfer" | "meal" | "experience" | "rental" | "custom";
};

export type Booking = {
  id: string;
  guest: Guest;
  guestRecordId?: string;
  propertyId: string;
  propertyName: string;
  partnerId?: string;
  crmRecordId?: string;
  arrival: string;
  departure: string;
  roomType: string;
  nights: number;
  services: BookingService[];
  estimatedValue: number;
  commission: Commission;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  source: "whatsapp" | "website" | "partner" | "demo";
};

export type BookingDraft = {
  propertyName: string;
  whatsapp: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomType: string;
  roomRate: number;
  services: BookingService[];
  specialRequests: string;
};
