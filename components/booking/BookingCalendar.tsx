type BookingCalendarProps = {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
};

export function BookingCalendar({ checkIn, checkOut, onCheckInChange, onCheckOutChange }: BookingCalendarProps) {
  return (
    <div className="bookingFormGrid">
      <label className="bookingField">
        <span>Check-in</span>
        <input type="date" value={checkIn} onChange={(event) => onCheckInChange(event.target.value)} />
      </label>
      <label className="bookingField">
        <span>Check-out</span>
        <input type="date" value={checkOut} onChange={(event) => onCheckOutChange(event.target.value)} />
      </label>
    </div>
  );
}
