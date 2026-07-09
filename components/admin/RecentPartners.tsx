type RecentPartner = {
  name: string;
  status: string;
  joined: string;
  category: string;
};

type RecentPartnersProps = {
  partners: RecentPartner[];
};

export function RecentPartners({ partners }: RecentPartnersProps) {
  return (
    <section className="adminPanel">
      <div className="adminSectionHeader">
        <p className="eyebrow">Recent verified partners</p>
        <h2>Live partner network</h2>
      </div>
      <div className="adminPartnerList">
        {partners.map((partner) => (
          <article className="adminPartnerCard" key={partner.name}>
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
