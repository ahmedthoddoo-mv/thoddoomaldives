type RecentPartner = {
  name: string;
  status: string;
  joined: string;
  category: string;
};

type AdminRecentPartnersProps = {
  partners: RecentPartner[];
};

export function AdminRecentPartners({ partners }: AdminRecentPartnersProps) {
  return (
    <section className="adminPanel" id="partners">
      <div className="adminSectionHeader">
        <p className="eyebrow">Recent verified partners</p>
        <h2>Live partner network</h2>
      </div>
      <div className="adminPartnerList">
        {partners.map((partner) => (
          <article className="adminPartnerCard" key={partner.name}>
            <div className="adminPartnerAvatar" aria-hidden="true">
              {partner.name.slice(0, 2)}
            </div>
            <div>
              <h3>{partner.name}</h3>
              <p>{partner.category}</p>
            </div>
            <div>
              <span>{partner.status}</span>
              <small>{partner.joined}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
