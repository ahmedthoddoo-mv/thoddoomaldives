import { adminBookings, bookingOptionalServices, partnerDashboardStats } from "@/data/bookings";
import { createRepository } from "@/lib/repositories/types";

export const BookingRepository = {
  ...createRepository({
    records: adminBookings,
    searchFields: ["id", "propertyName", "propertyId", "partnerId", "crmRecordId", "status", "source"]
  }),
  findBySlug(slug: string) {
    return adminBookings.find((booking) => booking.id.toLowerCase() === slug.toLowerCase());
  },
  findFeatured() {
    return adminBookings.filter((booking) => booking.status === "new" || booking.status === "pending");
  },
  findVerified() {
    return adminBookings.filter((booking) => booking.status === "confirmed");
  },
  findByPropertyId(propertyId: string) {
    return adminBookings.filter((booking) => booking.propertyId === propertyId);
  },
  findByPartnerId(partnerId: string) {
    return adminBookings.filter((booking) => booking.partnerId === partnerId);
  },
  findByCrmRecordId(crmRecordId: string) {
    return adminBookings.filter((booking) => booking.crmRecordId === crmRecordId);
  },
  findOptionalServices() {
    return bookingOptionalServices;
  },
  getPartnerDashboardStats() {
    return partnerDashboardStats;
  }
};
