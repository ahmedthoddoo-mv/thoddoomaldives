import { generateGeneralLink } from "@/lib/whatsapp";

export default function WhatsAppButton() {
  return (
    <a
      href={generateGeneralLink({})}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-30 rounded-full bg-green-500 px-5 py-4 font-semibold text-white shadow-lg"
    >
      WhatsApp
    </a>
  );
}