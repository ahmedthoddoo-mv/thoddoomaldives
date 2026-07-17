import Link from "next/link";
import { generateGeneralLink } from "@/lib/whatsapp";
import { VerifiedBadge } from "@/components/partner/VerifiedBadge";
import type { PublicPartnerProfile } from "@/lib/partners/publicProfiles";

type PublicPartnerProfilePageProps = {
  profile: PublicPartnerProfile;
  relatedListing?: {
    href: string;
    title: string;
  };
};

export function PublicPartnerProfilePage({ profile, relatedListing }: PublicPartnerProfilePageProps) {
  const contactLink = generateGeneralLink({ phone: profile.contact.whatsapp ?? profile.contact.phone });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.24),_transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Verified partner</p>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{profile.name}</h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">{profile.shortDescription}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
                {profile.category}
              </span>
              {profile.verificationStatus === "verified" ? <VerifiedBadge label="Verified on iThoddoo" /> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">About this business</h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">{profile.description}</p>

            {profile.address ? (
              <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Location</p>
                <p className="mt-3 text-base text-slate-200">{profile.address}</p>
              </div>
            ) : null}

            {profile.services.length > 0 ? (
              <div className="mt-10">
                <h3 className="text-xl font-semibold text-white">Services</h3>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {profile.services.map((service) => (
                    <article key={`${service.name}-${service.category}`} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">{service.category}</p>
                      <h4 className="mt-3 font-semibold text-white">{service.name}</h4>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{service.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <h2 className="text-xl font-semibold text-white">Contact</h2>
              <div className="mt-5 space-y-3 text-sm text-slate-300">
                {profile.contact.whatsapp ? <p>WhatsApp: {profile.contact.whatsapp}</p> : null}
                {profile.contact.email ? <p>Email: {profile.contact.email}</p> : null}
                {profile.contact.website ? <p>Website: {profile.contact.website}</p> : null}
                {profile.contact.instagram ? <p>Instagram: {profile.contact.instagram}</p> : null}
              </div>
              <a href={contactLink} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
                Contact on WhatsApp
              </a>
            </div>

            {profile.tags.length > 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                <h2 className="text-xl font-semibold text-white">Highlights</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {profile.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {relatedListing ? (
              <div className="rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-8 backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Featured listing</p>
                <h2 className="mt-3 text-xl font-semibold text-white">{relatedListing.title}</h2>
                <Link href={relatedListing.href} className="mt-5 inline-flex text-sm font-semibold text-cyan-200 hover:text-cyan-100">
                  View public listing →
                </Link>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
