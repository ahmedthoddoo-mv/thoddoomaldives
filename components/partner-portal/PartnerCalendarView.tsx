import { partnerCalendarDays } from "@/data/partnerPortal";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function PartnerCalendarView() {
  return (
    <section className="partnerPortalPanel">
      <div className="partnerPortalSectionHeader">
        <p className="eyebrow">August 2026</p>
        <h2>Availability Calendar</h2>
      </div>
      <div className="partnerPortalCalendarLegend">
        {["Available", "Occupied", "Pending", "Blocked"].map((status) => (
          <span className={`calendar-${status.toLowerCase()}`} key={status}>
            {status}
          </span>
        ))}
      </div>
      <div className="partnerPortalCalendar">
        {weekdays.map((day) => (
          <strong key={day}>{day}</strong>
        ))}
        {partnerCalendarDays.map((day) => (
          <div className={`calendar-${day.status.toLowerCase()}`} key={day.day}>
            <span>{day.day}</span>
            <small>{day.label ?? day.status}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
