import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { generateExperienceLink } from "@/lib/whatsapp";
import type { Experience } from "@/types/experience";

export default function ExperienceCard({
  experience,
}: {
  experience: Experience;
}) {
  return (
    <Card>
      <div
        className="-mx-6 -mt-6 h-64 rounded-t-3xl bg-slate-200 bg-cover bg-center"
        style={{ backgroundImage: `url('${experience.image}')` }}
        role="img"
        aria-label={experience.title}
      />

      <div className="mt-6 flex flex-wrap gap-2">
        <Badge>{experience.duration}</Badge>
        <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          {experience.price}
        </span>
      </div>

      <h3 className="mt-5 text-2xl font-bold">{experience.title}</h3>
      <p className="mt-3 font-semibold text-slate-700">
        {experience.tagline}
      </p>
      <p className="mt-3 leading-7 text-slate-600">
        {experience.description}
      </p>

      <div className="mt-6">
        <Button
          href={generateExperienceLink({ experience: experience.title })}
          variant="green"
        >
          Book Experience
        </Button>
      </div>
    </Card>
  );
}
