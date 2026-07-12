export default function StayDetailLoading() {
  return (
    <main className="platformPage">
      <section className="platformHero" style={{ backgroundImage: "url('/images/hero-thoddoo.jpg')" }}>
        <div className="platformHeroInner">
          <p className="eyebrow">Stay details</p>
          <h1>Loading Property</h1>
          <p>Fetching rooms, pricing, amenities, gallery, and partner details.</p>
        </div>
      </section>
    </main>
  );
}
