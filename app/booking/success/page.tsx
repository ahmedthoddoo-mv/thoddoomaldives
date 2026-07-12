import Link from "next/link";
import type { Metadata } from "next";

type BookingSuccessPageProps = {
  searchParams: Promise<{
    reference?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Booking Request Received"
};

export default async function BookingSuccessPage({ searchParams }: BookingSuccessPageProps) {
  const { reference } = await searchParams;

  return (
    <main className="platformPage">
      <section className="platformHero" style={{ backgroundImage: "url('/images/hero-thoddoo.jpg')" }}>
        <div className="platformHeroInner">
          <p className="eyebrow">Booking request received</p>
          <h1>Your stay request is with iThoddoo Maldives</h1>
          <p>
            {reference ? `Reference ${reference} has been created. ` : ""}
            The local team will review availability with the partner and reply through your preferred contact channel.
          </p>
          <div className="platformButtonRow">
            <Link className="platformButton" href="/stay">
              Browse stays
            </Link>
            <Link className="platformButton platformButtonSecondary" href="/contact">
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
