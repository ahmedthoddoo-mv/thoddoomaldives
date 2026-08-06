import type { Room } from "@/types/booking";

type RoomSelectorProps = {
  rooms: Room[];
  selectedRoomId: string;
  onChange: (roomId: string) => void;
};

export function RoomSelector({ rooms, selectedRoomId, onChange }: RoomSelectorProps) {
  if (rooms.length === 0) return null;
  return (
    <fieldset className="bookingSelectorGroup">
      <legend>Room Type</legend>
      {rooms.map((room) => (
        <label className={room.id === selectedRoomId ? "bookingOption bookingOptionSelected" : "bookingOption"} key={room.id}>
          <input
            checked={room.id === selectedRoomId}
            name="room"
            onChange={() => onChange(room.id)}
            type="radio"
            value={room.id}
          />
          <span>
            <strong>{room.name}</strong>
            <small>{room.capacity} · {room.nightlyRate ? `${room.currency ?? "USD"} ${room.nightlyRate}/night` : "Price on request"}</small>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
