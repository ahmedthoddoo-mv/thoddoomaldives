export default function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-4xl font-bold">{title}</h2>
    </div>
  );
}