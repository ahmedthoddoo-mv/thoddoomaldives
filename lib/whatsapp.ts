// lib/whatsapp.ts

const DEFAULT_PHONE = "9609142538";
const DEFAULT_CONCIERGE_PHONE = "9609142538";

function sanitizePhone(phone?: string) {
 if (!phone) return "";
 const cleaned = phone.replace(/[^0-9+]/g, "");
 if (!cleaned) return "";
 if (cleaned.startsWith("+")) {
   return cleaned;
 }
 if (cleaned.startsWith("00")) {
   return `+${cleaned.slice(2)}`;
 }
 return cleaned.startsWith("960") ? `+${cleaned}` : `+${cleaned}`;
}

export function normalizeWhatsAppTarget(phone?: string) {
 const sanitized = sanitizePhone(phone);
 if (!sanitized) {
   return DEFAULT_CONCIERGE_PHONE;
 }
 return sanitized;
}

export function buildWhatsAppUrl(phone: string | undefined, message: string) {
 const target = normalizeWhatsAppTarget(phone);
 return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}

/**
* Guesthouse booking
*/
export function generateGuesthouseLink({
 phone = DEFAULT_PHONE,
 guesthouse,
}: {
 phone?: string;
 guesthouse: string;
}) {
 const message = `Hi,

I would like to book accommodation.

🏨 Guesthouse: ${guesthouse}

📅 Check-in:
📅 Check-out:
👥 Number of Guests:

Please send me availability and the best price.

Thank you!
iThoddoo Maldives`;
 return buildWhatsAppUrl(phone, message);
}

/**
 * Experience booking
 */
export function generateExperienceLink({
  phone = DEFAULT_PHONE,
  experience,
}: {
  phone?: string;
  experience: string;
}) {
  const message = `Hi,

I would like to book this experience.

🤿 Experience: ${experience}

📅 Preferred Date:
👥 Number of Guests:

Please send me more information.

Thank you!
iThoddoo Maldives`;

  return buildWhatsAppUrl(phone, message);
}

/**
 * Transfer booking
 */
export function generateTransferLink({
  phone = DEFAULT_PHONE,
  transfer,
}: {
  phone?: string;
  transfer?: string;
}) {
  const message = `Hi,

I need airport transfer to Thoddoo.
${transfer ? `\n🚤 Transfer: ${transfer}` : ""}

✈️ Flight Number:
🕒 Arrival Time:
👥 Number of Guests:

Please recommend the best transfer option.

Thank you!
iThoddoo Maldives`;

  return buildWhatsAppUrl(phone, message);
}

/**
 * General contact
 */
export function generateGeneralLink({
  phone = DEFAULT_PHONE,
}: {
  phone?: string;
}) {
  const message = `Hi,

I found your website iThoddoo Maldives.

I would like to get more information.

Thank you!`;

  return buildWhatsAppUrl(phone, message);
}
