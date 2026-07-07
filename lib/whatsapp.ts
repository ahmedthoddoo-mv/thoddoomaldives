// lib/whatsapp.ts

const DEFAULT_PHONE = "9609142538";

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

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
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

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Transfer booking
 */
export function generateTransferLink({
  phone = DEFAULT_PHONE,
}: {
  phone?: string;
}) {
  const message = `Hi,

I need airport transfer to Thoddoo.

✈️ Flight Number:
🕒 Arrival Time:
👥 Number of Guests:

Please recommend the best transfer option.

Thank you!
iThoddoo Maldives`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
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

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}