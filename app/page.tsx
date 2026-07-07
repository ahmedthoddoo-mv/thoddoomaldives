export default function Home() {
  return (
    <main style={{ fontFamily: "Arial" }}>
<nav style={{
  display: "flex",
  justifyContent: "space-between",
  padding: "20px 40px",
  position: "absolute",
  width: "100%",
  color: "white",
  zIndex: 10
}}>
  <div style={{ fontWeight: "bold", fontSize: "20px" }}>
    iThoddoo Maldives
  </div>

  <div style={{ display: "flex", gap: "20px" }}>
    <span>Home</span>
    <span>Stay</span>
    <span>Tours</span>
    <span>Contact</span>
  </div>
</nav>
      {/* HERO SECTION */}
      <section style={{
        height: "100vh",
        backgroundImage: "url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        textAlign: "center",
        padding: "20px"
      }}>
        <div>
          <h1 style={{ fontSize: "64px", fontWeight: "bold" }}>
            iThoddoo Maldives
          </h1>
          <p style={{ fontSize: "20px", marginTop: "10px" }}>
            Discover paradise. Live the island life.
          </p>

          <button style={{
            marginTop: "25px",
            padding: "14px 28px",
            fontSize: "16px",
            background: "#00bcd4",
            border: "none",
            borderRadius: "30px",
            color: "white",
            cursor: "pointer"
          }}>
            Plan Your Trip
          </button>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section style={{ padding: "80px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "36px" }}>Welcome to iThoddoo</h2>
        <p style={{ maxWidth: "700px", margin: "20px auto", fontSize: "18px", color: "#555" }}>
          iThoddoo Maldives is your complete guide to one of the most beautiful local islands in the Maldives.
          White sandy beaches, crystal clear waters, and authentic island culture await you.
        </p>
      </section>

      {/* HIGHLIGHTS */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        padding: "40px",
        maxWidth: "1000px",
        margin: "0 auto"
      }}>

        {[
          { title: "Beaches", desc: "Soft white sand & turquoise water" },
          { title: "Snorkeling", desc: "Coral reefs & marine life" },
          { title: "Excursions", desc: "Sandbank & island trips" },
          { title: "Local Culture", desc: "Real Maldivian island life" }
        ].map((item) => (
          <div key={item.title} style={{
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid #eee",
            textAlign: "center",
            background: "#fff"
          }}>
            <h3>{item.title}</h3>
            <p style={{ color: "#666" }}>{item.desc}</p>
          </div>
        ))}
      </section>
<section style={{
  padding: "60px 20px",
  textAlign: "center"
}}>
  <h2 style={{ fontSize: "36px" }}>What We Offer</h2>

  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "30px",
    maxWidth: "1000px",
    marginLeft: "auto",
    marginRight: "auto"
  }}>
    
    <div style={{ padding: "20px", border: "1px solid #eee", borderRadius: "16px" }}>
      <h3>🏨 Guesthouses</h3>
      <p>Best stays in Thoddoo island</p>
    </div>

    <div style={{ padding: "20px", border: "1px solid #eee", borderRadius: "16px" }}>
      <h3>🚤 Transfers</h3>
      <p>Speedboat & ferry booking help</p>
    </div>

    <div style={{ padding: "20px", border: "1px solid #eee", borderRadius: "16px" }}>
      <h3>🐠 Excursions</h3>
      <p>Snorkeling, sandbank & fishing trips</p>
    </div>

  </div>
</section>
      {/* CTA SECTION */}
      <section style={{
        padding: "80px 20px",
        textAlign: "center",
        background: "#f5f5f5"
      }}>
        <h2>Start Your Maldives Journey</h2>
        <p style={{ marginTop: "10px", color: "#666" }}>
          Book stays, excursions, and experiences in Thoddoo
        </p>

        <button>
<a
  href="https://wa.me/9609142538?text=Hi%20I%20want%20to%20book%20a%20trip%20to%20Thoddoo"
  target="_blank"
  style={{
    marginTop: "20px",
    padding: "14px 30px",
    fontSize: "16px",
    background: "#25D366",
    color: "white",
    borderRadius: "30px",
    textDecoration: "none",
    display: "inline-block"
  }}
>
  Book on WhatsApp
</a>
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{
        textAlign: "center",
        padding: "20px",
        background: "#111",
        color: "white"
      }}>
        © 2026 iThoddoo Maldives — All Rights Reserved
      </footer>

    </main>
  );
}
