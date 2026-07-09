import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import WhatsAppButton from "@/components/WhatsAppButton";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
  openGraph: {
    title: "iThoddoo Maldives | Thoddoo Stays, Experiences & Transfers",
    description:
      "Book Thoddoo guesthouses, transfers, excursions, and local island experiences with trusted Maldives travel support.",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE),
        width: 1200,
        height: 630,
        alt: "Thoddoo Maldives beach aerial",
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
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
  icons: {
    icon: "/icon.png?v=4",
    shortcut: "/icon.png?v=4",
    apple: "/apple-icon.png?v=4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
