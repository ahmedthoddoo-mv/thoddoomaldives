import { generateExperienceLink } from "@/lib/whatsapp";
import type { Experience } from "@/lib/experiences";

type ExperienceCardProps = {
  experience: Experience;
};

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const bookingLink = generateExperienceLink({
    experience: experience.title,
  });

  return (
    <div className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {experience.image && (
        <div
          className="h-48 bg-cover bg-center transition duration-500 group-hover:scale-[1.02]"
          style={{ backgroundImage: `url('${experience.image}')` }}
          role="img"
          aria-label={experience.title}
        />
      )}

      <div className="p-8">
        <div className="text-5xl">{experience.icon}</div>

        <h3 className="mt-5 text-3xl font-bold">{experience.title}</h3>

        <p className="mt-4 text-slate-600">{experience.description}</p>

        <p className="mt-4">
          ⏱ <strong>Duration:</strong> {experience.duration}
        </p>

        <p className="mt-2 text-lg font-semibold text-cyan-700">
          💰 {experience.price}
        </p>

        <ul className="mt-6 space-y-3 text-slate-600">
          {experience.highlights.map((highlight) => (
            <li key={highlight}>✅ {highlight}</li>
          ))}
        </ul>

        <a
          href={bookingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-full bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600"
        >
          Book on WhatsApp
        </a>
      </div>
    </div>
  );
}
