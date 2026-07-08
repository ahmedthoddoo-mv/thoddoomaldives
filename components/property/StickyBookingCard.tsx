import { generateGuesthouseLink } from "@/lib/whatsapp";
import type { Guesthouse } from "@/types/guesthouse";

export default function StickyBookingCard({
  guesthouse,
}: {
  guesthouse: Guesthouse;
}) {
  const bookingLink = generateGuesthouseLink({
    phone: guesthouse.whatsapp,
    guesthouse: guesthouse.name,
  });

  return (
    <>
      <aside className="sticky top-24 hidden rounded-3xl border bg-white p-6 shadow-xl lg:block">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
          Book Direct
        </p>
        <h3 className="mt-3 text-2xl font-bold">{guesthouse.name}</h3>
        <p className="mt-4 text-slate-600">{guesthouse.tagline}</p>
        <p className="mt-6 text-sm font-semibold text-slate-500">From</p>
        <p className="text-3xl font-bold">{guesthouse.priceFrom}</p>
        <a
          href={bookingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 block rounded-full bg-green-500 px-6 py-4 text-center font-semibold text-white transition hover:bg-green-600"
        >
          Book Now
        </a>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          Message on WhatsApp for availability, best price, transfer help, and
          room requests.
        </p>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-3 shadow-2xl lg:hidden">
        <a
          href={bookingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-full bg-green-500 px-6 py-4 text-center font-semibold text-white"
        >
          Book Now - {guesthouse.priceFrom}
        </a>
      </div>
    </>
  );
}
