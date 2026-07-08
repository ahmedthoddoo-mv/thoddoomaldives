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
    <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-[280px_1fr]">
      <div
        className="min-h-72 bg-cover bg-center md:min-h-full"
        style={{ backgroundImage: `url('${room.image}')` }}
      />

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">{room.name}</h3>
            <p className="mt-2 text-sm font-semibold text-cyan-700">
              {room.capacity}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              From
            </p>
            <p className="text-2xl font-bold">{room.price}</p>
          </div>
        </div>

        <p className="mt-4 leading-7 text-slate-600">{room.description}</p>

        <dl className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-slate-900">Occupancy</dt>
            <dd>{room.occupancy}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Bed Type</dt>
            <dd>{room.bedType}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Breakfast</dt>
            <dd>{room.breakfast}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Price</dt>
            <dd>{room.price}</dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          {room.amenities.map((amenity) => (
            <span
              key={amenity}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700"
            >
              {amenity}
            </span>
          ))}
        </div>

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
