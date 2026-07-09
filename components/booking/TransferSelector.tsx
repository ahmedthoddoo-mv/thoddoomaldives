import type { BookingService } from "@/types/booking";

type TransferSelectorProps = {
  services: BookingService[];
  selectedIds: string[];
  onToggle: (service: BookingService) => void;
};

export function TransferSelector({ services, selectedIds, onToggle }: TransferSelectorProps) {
  return (
    <fieldset className="bookingSelectorGroup">
      <legend>Transfers & meals</legend>
      {services.map((service) => (
        <label className="bookingCheckboxOption" key={service.id}>
          <input checked={selectedIds.includes(service.id)} onChange={() => onToggle(service)} type="checkbox" />
          <span>{service.name}</span>
          <small>${service.price}</small>
        </label>
      ))}
    </fieldset>
  );
}
