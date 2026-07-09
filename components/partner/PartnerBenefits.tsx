const benefits = [
  {
    title: "Demand generation",
    description: "Profiles, search placement, Trip Planner visibility, and campaign inventory are designed to move travelers toward partner action."
  },
  {
    title: "Trust infrastructure",
    description: "Verification, better media, and structured service data make local operators easier to evaluate."
  },
  {
    title: "Partner intelligence",
    description: "The model is ready for monthly insights, conversion reporting, and future booking performance metrics."
  },
  {
    title: "Category flexibility",
    description: "Accommodation, transport, food, activities, retail, wellness, and local services share one extensible partner core."
  }
];

export function PartnerBenefits() {
  return (
    <section className="section">
      <div className="sectionHeader">
        <p className="eyebrow">Benefits</p>
        <h2>Built to create bookings, not pageviews</h2>
      </div>
      <div className="benefitGrid">
        {benefits.map((benefit) => (
          <article className="featureBlock" key={benefit.title}>
            <h3>{benefit.title}</h3>
            <p>{benefit.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
