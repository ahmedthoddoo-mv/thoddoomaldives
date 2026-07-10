import type { Booking, BookingService } from "@/types/booking";

export const bookingOptionalServices: BookingService[] = [
  { id: "airport-transfer", name: "Airport Transfer", price: 45, type: "transfer" },
  { id: "ferry-transfer", name: "Ferry Transfer", price: 15, type: "transfer" },
  { id: "speedboat-transfer", name: "Speedboat Transfer", price: 35, type: "transfer" },
  { id: "breakfast", name: "Breakfast", price: 12, type: "meal" },
  { id: "half-board", name: "Half Board", price: 35, type: "meal" },
  { id: "full-board", name: "Full Board", price: 58, type: "meal" },
  { id: "snorkeling", name: "Snorkeling", price: 35, type: "experience" },
  { id: "sandbank", name: "Sandbank", price: 60, type: "experience" },
  { id: "fishing", name: "Fishing", price: 40, type: "experience" },
  { id: "diving", name: "Diving", price: 75, type: "experience" },
  { id: "watersports", name: "Watersports", price: 50, type: "experience" },
  { id: "photography", name: "Photography", price: 120, type: "experience" },
  { id: "bike-rental", name: "Bike Rental", price: 8, type: "rental" },
  { id: "other-experiences", name: "Other experiences", price: 0, type: "custom" }
];

export const adminBookings: Booking[] = [
  {
    id: "BK-1007",
    guest: { name: "Maya R.", adults: 2, children: 0, whatsapp: "+44 7000 000001" },
    guestRecordId: "guest-bk-1007",
    propertyId: "thoddoo-sun-sky-inn",
    propertyName: "Thoddoo Sun Sky Inn",
    partnerId: "partner-thoddoo-sun-sky",
    crmRecordId: "crm-thoddoo-sun-sky",
    arrival: "2026-08-12",
    departure: "2026-08-17",
    roomType: "Deluxe Double Room",
    nights: 5,
    services: [bookingOptionalServices[2], bookingOptionalServices[6]],
    estimatedValue: 600,
    commission: { bookingTotal: 600, rate: 0.1, companyRevenue: 60, partnerRevenue: 540 },
    status: "new",
    paymentStatus: "demo-only",
    source: "whatsapp"
  },
  {
    id: "BK-1008",
    guest: { name: "Daniel K.", adults: 2, children: 2, whatsapp: "+49 170 000002" },
    guestRecordId: "guest-bk-1008",
    propertyId: "thoddoo-sun-sky-inn",
    propertyName: "Thoddoo Sun Sky Inn",
    partnerId: "partner-thoddoo-sun-sky",
    crmRecordId: "crm-thoddoo-sun-sky",
    arrival: "2026-08-20",
    departure: "2026-08-26",
    roomType: "Family Room",
    nights: 6,
    services: [bookingOptionalServices[0], bookingOptionalServices[4], bookingOptionalServices[7]],
    estimatedValue: 915,
    commission: { bookingTotal: 915, rate: 0.1, companyRevenue: 92, partnerRevenue: 823 },
    status: "pending",
    paymentStatus: "demo-only",
    source: "website"
  },
  {
    id: "BK-1009",
    guest: { name: "Elena S.", adults: 1, children: 0, whatsapp: "+39 300 000003" },
    guestRecordId: "guest-bk-1009",
    propertyId: "thoddoo-sun-sky-inn",
    propertyName: "Thoddoo Sun Sky Inn",
    partnerId: "partner-thoddoo-sun-sky",
    crmRecordId: "crm-thoddoo-sun-sky",
    arrival: "2026-09-02",
    departure: "2026-09-06",
    roomType: "Deluxe Double Room",
    nights: 4,
    services: [bookingOptionalServices[3], bookingOptionalServices[12]],
    estimatedValue: 420,
    commission: { bookingTotal: 420, rate: 0.1, companyRevenue: 42, partnerRevenue: 378 },
    status: "confirmed",
    paymentStatus: "demo-only",
    source: "partner"
  }
];

export const partnerDashboardStats = {
  todaysInquiries: 7,
  pendingBookings: 12,
  upcomingArrivals: 5,
  upcomingDepartures: 4,
  estimatedMonthlyRevenue: "$18,450",
  occupancy: "73%",
  bookingSources: ["WhatsApp", "Website", "Partner profile", "Trip planner"],
  popularRoom: "Deluxe Double Room",
  averageStay: "4.8 nights"
};
