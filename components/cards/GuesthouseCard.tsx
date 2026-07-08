import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { generateGuesthouseLink } from "@/lib/whatsapp";
import type { Guesthouse } from "@/types/guesthouse";

export default function GuesthouseCard({
  guesthouse,
}: {
  guesthouse: Guesthouse;
}) {
  return (
    <Card>
      <div
        className="-mx-6 -mt-6 h-72 rounded-t-3xl bg-slate-200 bg-cover bg-center"
        style={{ backgroundImage: `url('${guesthouse.heroImage}')` }}
        role="img"
        aria-label={guesthouse.name}
      />

      <div className="mt-6 flex flex-wrap gap-2">
        <Badge>Rating {guesthouse.rating}</Badge>
        <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          {guesthouse.distanceToBeach}
        </span>
      </div>

      <h3 className="mt-5 text-2xl font-bold">{guesthouse.name}</h3>
      <p className="mt-3 leading-7 text-slate-600">{guesthouse.tagline}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/stay/${guesthouse.slug}`}
          className="inline-block rounded-full bg-slate-900 px-6 py-3 font-semibold text-white"
        >
          View Details
        </Link>
        <Button
          href={generateGuesthouseLink({
            phone: guesthouse.whatsapp,
            guesthouse: guesthouse.name,
          })}
          variant="green"
        >
          Book Now
        </Button>
      </div>
    </Card>
  );
}
