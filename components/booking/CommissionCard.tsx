import type { Commission } from "@/types/booking";

export function CommissionCard({ commission }: { commission: Commission }) {
  return (
    <article className="bookingCommissionCard">
      <span>Commission engine</span>
      <div>
        <strong>${commission.bookingTotal}</strong>
        <small>Booking Total</small>
      </div>
      <div className="bookingCommissionGrid">
        <p>{Math.round(commission.rate * 100)}% commission</p>
        <p>Company Revenue: ${commission.companyRevenue}</p>
        <p>Partner Revenue: ${commission.partnerRevenue}</p>
      </div>
    </article>
  );
}
