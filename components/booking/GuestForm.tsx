type GuestFormProps = {
  adults: number;
  children: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
};

export function GuestForm({ adults, children, onAdultsChange, onChildrenChange }: GuestFormProps) {
  return (
    <div className="bookingFormGrid">
      <label className="bookingField">
        <span>Adults</span>
        <input min="1" type="number" value={adults} onChange={(event) => onAdultsChange(Number(event.target.value))} />
      </label>
      <label className="bookingField">
        <span>Children</span>
        <input min="0" type="number" value={children} onChange={(event) => onChildrenChange(Number(event.target.value))} />
      </label>
    </div>
  );
}
