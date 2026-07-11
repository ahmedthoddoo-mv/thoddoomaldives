import { BookingRepository } from "@/lib/repositories";

export function PartnerDashboardDemo() {
  const partnerDashboardStats = BookingRepository.getPartnerDashboardStats();
  const statCards = [
    ["Today's inquiries", String(partnerDashboardStats.todaysInquiries)],
    ["Pending bookings", String(partnerDashboardStats.pendingBookings)],
    ["Upcoming arrivals", String(partnerDashboardStats.upcomingArrivals)],
    ["Upcoming departures", String(partnerDashboardStats.upcomingDepartures)],
    ["Estimated monthly revenue", partnerDashboardStats.estimatedMonthlyRevenue],
    ["Occupancy %", partnerDashboardStats.occupancy],
    ["Popular room", partnerDashboardStats.popularRoom],
    ["Average stay", partnerDashboardStats.averageStay]
  ];

  return (
    <div className="partnerDashboardDemo">
      <section className="adminContentHero">
        <div>
          <span className="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">Partner dashboard demo</span>
          <h1>Property Performance Dashboard</h1>
          <p>Demo operating view for partner inquiries, bookings, arrivals, departures, revenue, occupancy, sources, and room demand.</p>
        </div>
      </section>

      <section className="adminStatsGrid">
        {statCards.map(([label, value]) => (
          <article className="adminStatCard" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <p>Demo metric prepared for future partner analytics.</p>
          </article>
        ))}
      </section>

      <section className="adminPanel">
        <div className="adminSectionHeader">
          <p className="eyebrow">Booking sources</p>
          <h2>Where demand is coming from</h2>
        </div>
        <div className="bookingSourceGrid">
          {partnerDashboardStats.bookingSources.map((source) => (
            <span key={source}>{source}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
