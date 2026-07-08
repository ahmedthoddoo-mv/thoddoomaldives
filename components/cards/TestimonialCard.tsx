import Card from "@/components/ui/Card";
import type { Testimonial } from "@/types/testimonial";

export default function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  return (
    <Card>
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
        Rating {testimonial.rating}
      </p>
      <blockquote className="mt-4 text-lg leading-8 text-slate-700">
        &quot;{testimonial.quote}&quot;
      </blockquote>
      <div className="mt-6">
        <p className="font-bold text-slate-900">{testimonial.name}</p>
        <p className="mt-1 text-sm text-slate-500">
          {testimonial.tripType} from {testimonial.location}
        </p>
      </div>
    </Card>
  );
}
