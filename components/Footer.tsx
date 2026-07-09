"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-slate-950 px-6 py-12 text-center text-white">
      <p className="font-bold">iThoddoo Maldives</p>
      <p className="mt-2 text-sm text-white/60">
        Stay • Excursions • Transfers • Gallery • Local Travel Guide
      </p>
      <p className="mt-4 text-xs text-white/40">
        © 2026 iThoddoo Maldives. All rights reserved.
      </p>
    </footer>
  );
}
