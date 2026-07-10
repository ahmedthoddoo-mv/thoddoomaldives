import { crmPartners, crmTasks } from "@/data/adminCrm";
import { mediaAssets } from "@/data/adminCms";
import { adminManagedProperties } from "@/data/adminContent";
import { integratedBookings } from "@/data/platformIntegration";
import { partnerAnalyticsMetrics, partnerProfile } from "@/data/partnerPortal";
import { getBookingsForPartner, getMediaForEntity, getRoomsForProperty } from "@/lib/platform/selectors";

export function calculatePartnerMetrics(partnerId = "partner-thoddoo-sun-sky") {
  const bookings = getBookingsForPartner(partnerId);
  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed" || booking.status === "new");
  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const revenue = bookings.reduce((total, booking) => total + booking.estimatedValue, 0);
  const commission = bookings.reduce((total, booking) => total + booking.commission.companyRevenue, 0);
  const relationshipPropertyId = "property-thoddoo-sun-sky";

  return {
    partnerId,
    bookingCount: bookings.length,
    pendingBookings: pendingBookings.length,
    confirmedBookings: confirmedBookings.length,
    demoRevenue: revenue,
    demoCommission: commission,
    occupancy: "73%",
    profileCompletion: partnerProfile.profileCompletion,
    mediaCount: getMediaForEntity("partner", partnerId).length,
    roomCount: getRoomsForProperty(relationshipPropertyId).length,
    analytics: partnerAnalyticsMetrics
  };
}

export function calculateAdminMetrics() {
  return {
    totalBookings: integratedBookings.length,
    pendingApplications: crmPartners.filter((partner) => partner.verification !== "Verified").length,
    recentPartners: crmPartners.length,
    recentMedia: mediaAssets.length,
    crmFollowUps: crmPartners.filter((partner) => partner.nextFollowUp).length,
    pendingApprovals: crmPartners.filter((partner) => partner.verification === "Pending" || partner.status === "Pending").length,
    publishedProperties: adminManagedProperties.filter((property) => property.isPublished).length,
    featuredListings: adminManagedProperties.filter((property) => property.isFeatured).length,
    openTasks: crmTasks.filter((task) => task.status !== "Completed").length
  };
}
