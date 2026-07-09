type PartnerHeroProps = {
  partnerCount: number;
  categoryCount: number;
};

export function PartnerHero({ partnerCount, categoryCount }: PartnerHeroProps) {
  return (
    <section className="partnerHero">
      <div className="heroContent">
        <p className="eyebrow">Project Atlas Partner Platform</p>
        <h1>Growth infrastructure for Thoddoo tourism businesses</h1>
        <p>
          iThoddoo Maldives is building the operating system for local island tourism: trusted partner profiles,
          category-aware services, demand generation, future analytics, and booking-ready architecture.
        </p>
        <div className="heroActions">
          <a href="#plans" className="primaryButton">View plans</a>
          <a href="#faq" className="secondaryButton">Read FAQ</a>
        </div>
      </div>
      <div className="heroPanel" aria-label="Partner platform summary">
        <span>{categoryCount}</span>
        <p>partner categories supported from day one</p>
        <span>{partnerCount}</span>
        <p>sample partners modeled for future workflows</p>
      </div>
    </section>
  );
}
