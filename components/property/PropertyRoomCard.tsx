import type { Room } from "@/types/guesthouse";
import BookButton from "@/components/BookButton";

export default function PropertyRoomCard({
  room,
  guesthouseName,
  whatsapp,
}: {
  room: Room;
  guesthouseName: string;
  whatsapp: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div
        className="h-80 bg-cover bg-center"
        style={{ backgroundImage: `url('${room.image}')` }}
      />

      <div className="p-6">
        <h3 className="text-2xl font-bold">{room.name}</h3>
        <p className="mt-2 text-slate-600">👥 {room.capacity}</p>
        <p className="mt-3 text-slate-600">{room.description}</p>
        <p className="mt-5 text-3xl font-bold">{room.price}</p>

        <div className="mt-6">
          <BookButton
            phone={whatsapp}
            name={`${guesthouseName} - ${room.name}`}
          />
        </div>
      </div>
    </div>
  );
}