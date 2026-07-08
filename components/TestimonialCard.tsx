export default function TestimonialCard({
  quote,
  name,
  detail,
}: {
  quote: string;
  name: string;
  detail: string;
}) {
  return (
    <figure className="rounded-3xl border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <blockquote className="text-lg leading-8 text-slate-700">
        &quot;{quote}&quot;
      </blockquote>
      <figcaption className="mt-6">
        <p className="font-bold text-slate-900">{name}</p>
        <p className="mt-1 text-sm text-slate-500">{detail}</p>
      </figcaption>
    </figure>
  );
}
