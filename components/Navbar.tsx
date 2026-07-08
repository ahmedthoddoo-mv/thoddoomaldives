"use client";

import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    ["Home", "/"],
    ["Stay", "/stay"],
    ["Excursions", "/excursions"],
    ["Transfer", "/transfer"],
    ["Gallery", "/gallery"],
    ["Restaurants", "/restaurants"],
    ["Guide", "/guide"],
    ["Contact", "/contact"],
  ];

  return (
    <nav className="absolute top-0 z-40 w-full px-6 py-5 text-white md:px-12">
      <div className="flex items-center justify-between">
        <a href="/" className="text-xl font-bold">
          iThoddoo Maldives
        </a>

        <div className="hidden gap-6 text-sm font-medium md:flex">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="hover:text-cyan-200">
              {label}
            </a>
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
            {links.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-slate-100"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
