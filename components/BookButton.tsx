import { generateWhatsAppLink } from "@/lib/whatsapp";

export default function BookButton({
  phone,
  name,
}: {
  phone: string;
  name: string;
}) {
  return (
    <a
      href={generateWhatsAppLink({ phone, guesthouse: name })}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded-lg bg-green-600 px-4 py-3 font-semibold text-white"
    >
      Book via WhatsApp
    </a>
  );
}