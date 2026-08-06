"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { publicNavigationLinks } from "@/lib/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname.startsWith("/partner")) {
    return null;
  }

  return (
    <nav className="absolute top-0 z-40 w-full px-4 py-4 text-white md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-lg border border-white/15 bg-black/20 px-4 py-3 shadow-lg backdrop-blur md:px-5">
        <Link href="/" className="text-xl font-bold">
          iThoddoo Maldives
        </Link>

        <div className="hidden gap-5 text-sm font-semibold md:flex">
          {publicNavigationLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-cyan-200">
              {link.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg border border-white/40 px-3 py-2 text-sm font-semibold md:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="mt-4 rounded-2xl bg-white p-4 text-slate-900 shadow-xl md:hidden">
          <div className="grid gap-3">
            {publicNavigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
