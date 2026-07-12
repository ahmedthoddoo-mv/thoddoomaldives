export default function StayLoading() {
  return (
    <main className="platformPage">
      <section className="platformHero" style={{ backgroundImage: "url('/images/hero-thoddoo.jpg')" }}>
        <div className="platformHeroInner">
          <p className="eyebrow">Stay in Thoddoo</p>
          <h1>Loading Guesthouses</h1>
          <p>Fetching the latest published property listings.</p>
        </div>
      </section>
    </main>
  );
}
