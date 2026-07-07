export function generateWhatsAppLink({
  phone,
  guesthouse,
}: {
  phone: string;
  guesthouse: string;
}) {
  const message = `
Hi, I want to book this:

🏝 Guesthouse: ${guesthouse}
📅 Check-in:
📅 Check-out:
👥 Guests:

I found you on iThoddoo Maldives website.
`;

  const encoded = encodeURIComponent(message);

  return `https://wa.me/${phone}?text=${encoded}`;
}
