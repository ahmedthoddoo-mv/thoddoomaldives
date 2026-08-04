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
  direction,
  passengers,
}: {
  phone?: string;
  direction?: string;
  passengers?: number;
}) {
  const directionLine = direction ? `🧭 Direction: ${direction}\n` : "🧭 Direction: (Airport → Thoddoo / Thoddoo → Airport)\n";
  const paxLine = passengers ? `👥 Passengers: ${passengers}\n` : "👥 Passengers: \n";

  const message = `Hi,

I would like to enquire about the Nasru Speed Boat transfer.

${directionLine}${paxLine}✈️ Flight Number:
📅 Travel Date:
🕒 Arrival / Departure Time:

Please confirm availability and send me the booking details.

Thank you!
iThoddoo Maldives`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Transfer enquiry with full details
 */
export function generateTransferEnquiryLink({
  phone = DEFAULT_PHONE,
  direction = "",
  passengers = 0,
  date = "",
  flightNumber = "",
}: {
  phone?: string;
  direction?: string;
  passengers?: number;
  date?: string;
  flightNumber?: string;
}) {
  const paxText = passengers > 0 ? String(passengers) : "";
  const message = `Hi,

I would like to book the Nasru Speed Boat transfer to / from Thoddoo.

🧭 Direction: ${direction || "(Airport → Thoddoo / Thoddoo → Airport)"}
👥 Passengers: ${paxText}
📅 Travel Date: ${date}
✈️ Flight Number: ${flightNumber}

Please confirm availability (USD 35 per person) and send payment details.

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