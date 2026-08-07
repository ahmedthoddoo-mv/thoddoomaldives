import type { Metadata, Viewport } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import WhatsAppButton from "@/components/WhatsAppButton";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";
import "./globals.css";

const canonicalSiteUrl = (() => {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL?.trim() || SITE_URL;
  try {
    return new URL(candidate);
  } catch {
    return new URL(SITE_URL);
  }
})();

const socialImagePath = "/og-image.png";
const socialImageUrl = absoluteUrl(socialImagePath);

export const viewport: Viewport = {
  themeColor: "#087f7a"
};

export const metadata: Metadata = {
  metadataBase: canonicalSiteUrl,
  title: {
    default: "iThoddoo Maldives | Thoddoo Stays, Experiences & Transfers",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Plan a Thoddoo Maldives trip with trusted local help for guesthouses, airport transfers, excursions, restaurants, beaches, and island travel.",
  applicationName: SITE_NAME,
  alternates: {
    canonical: SITE_URL,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default"
  },
  openGraph: {
    title: "iThoddoo Maldives | Thoddoo Stays, Experiences & Transfers",
    description:
      "Book Thoddoo guesthouses, transfers, excursions, and local island experiences with trusted Maldives travel support.",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: "Discover Thoddoo with iThoddoo Maldives",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "iThoddoo Maldives | Thoddoo Stays, Experiences & Transfers",
    description:
      "Plan stays, transfers, excursions, and island days in Thoddoo with trusted local support.",
    images: [absoluteUrl("/twitter-image.png")],
  },
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: ["/icon.png"],
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-precomposed.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/apple-touch-icon-120x120-precomposed.png", sizes: "120x120", type: "image/png" }
    ]
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.info("[prod-render-debug] root-layout:start");
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
