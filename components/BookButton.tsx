import { generateGuesthouseLink } from "@/lib/whatsapp";

export default function BookButton({
  phone,
  name,
}: {
  phone?: string;
  name: string;
}) {
  return (
    <a
      href={generateGuesthouseLink({ phone, guesthouse: name })}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center rounded-full bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 sm:w-auto"
    >
      Book via WhatsApp
    </a>
  );
}
