import type { Booking, BookingStatus } from "@/types/booking";

export type ContactPreference = "whatsapp" | "email" | "either";

export type BookingWorkflowRecord = Booking & {
  propertySlug?: string;
  contactPreference: ContactPreference;
  specialRequests: string;
  createdAt: string;
  updatedAt: string;
};

export type BookingTimelineEvent = {
  id: string;
  bookingId: string;
  crmRecordId: string;
  type: "booking_note" | "timeline_event" | "follow_up";
  title: string;
  body: string;
  dueDate?: string;
  createdAt: string;
};

export type BookingEmailPreview = {
  id: string;
  bookingId: string;
  type: "guest_confirmation" | "partner_notification" | "admin_notification";
  subject: string;
  body: string;
};

export type BookingAnalyticsSummary = {
  bookingRequests: number;
  conversionRate: string;
  averageStay: string;
  revenueDemo: number;
  commissionDemo: number;
};

export type BookingWorkflowPayload = {
  propertyName: string;
  propertySlug?: string;
  propertyId?: string;
  partnerId?: string;
  crmRecordId?: string;
  whatsapp: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestName: string;
  guestEmail: string;
  guestWhatsapp: string;
  contactPreference: ContactPreference;
  roomType: string;
  roomId?: string;
  roomRate: number;
  nights: number;
  estimatedValue: number;
  commissionRate: number;
  companyRevenue: number;
  partnerRevenue: number;
  specialRequests: string;
  status?: BookingStatus;
};
