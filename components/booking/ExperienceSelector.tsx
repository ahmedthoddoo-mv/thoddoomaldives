import type { BookingService } from "@/types/booking";

type ExperienceSelectorProps = {
  services: BookingService[];
  selectedIds: string[];
  onToggle: (service: BookingService) => void;
};

export function ExperienceSelector({ services, selectedIds, onToggle }: ExperienceSelectorProps) {
  return (
    <fieldset className="bookingSelectorGroup">
      <legend>Experiences</legend>
      <div className="bookingChipGrid">
        {services.map((service) => (
          <button
            className={selectedIds.includes(service.id) ? "bookingServiceChip bookingServiceChipSelected" : "bookingServiceChip"}
            key={service.id}
            onClick={() => onToggle(service)}
            type="button"
          >
            {service.name}
            <span>{service.price ? `$${service.price}` : "Quote"}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
