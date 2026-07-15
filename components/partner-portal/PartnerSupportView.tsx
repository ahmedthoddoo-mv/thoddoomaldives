import { platformConfig } from "@/lib/config/platform";

const supportFaq = [
  "How do I update prices?",
  "When does verification renew?",
  "How do I change my hero image?",
  "How do bookings appear in WhatsApp?",
  "How do I upgrade membership?"
];

export function PartnerSupportView() {
  const whatsapp = platformConfig.whatsappNumbers.partnerships.replace(/\D/g, "");

  return (
    <div className="partnerPortalStack">
      <section className="partnerPortalPanel">
        <div className="partnerPortalSectionHeader">
          <p className="eyebrow">Support</p>
          <h2>Local Team Help</h2>
        </div>
        <div className="partnerPortalSnapshotGrid">
          <div>
            <span>WhatsApp</span>
            <strong>{platformConfig.whatsappNumbers.partnerships}</strong>
            <small>Fastest support channel</small>
          </div>
          <div>
            <span>Email</span>
            <strong>{platformConfig.companyContact.email}</strong>
            <small>Documents and account questions</small>
          </div>
        </div>
        <div className="partnerPortalActions">
          <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi, I need partner portal support.")}`} target="_blank" rel="noopener noreferrer">
            WhatsApp Support
          </a>
          <a href={`mailto:${platformConfig.companyContact.email}`}>Email Support</a>
        </div>
      </section>

      <section className="partnerPortalPanel">
        <h2>FAQ</h2>
        <div className="partnerPortalBookingList">
          {supportFaq.map((question) => (
            <article key={question}>
              <div>
                <strong>{question}</strong>
                <p>The iThoddoo Maldives team can help from WhatsApp while the self-service tools continue to expand.</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
