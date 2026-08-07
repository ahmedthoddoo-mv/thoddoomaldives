"use client";

import { useMemo, useState } from "react";
import type { RestaurantMenuCategory, RestaurantMenuItem } from "@/types/restaurant-menu";
import { platformConfig } from "@/lib/config/platform";
import { resolveRestaurantMenuCta } from "@/lib/restaurant-menu/format";

type RestaurantInteractiveMenuProps = {
  restaurantId: string;
  restaurantName: string;
  restaurantSlug?: string | null;
  membershipTier?: string | null;
  restaurantWhatsApp?: string | null;
  partnerWhatsApp?: string | null;
  categories: RestaurantMenuCategory[];
  items: RestaurantMenuItem[];
};

type CartEntry = {
  item: RestaurantMenuItem;
  quantity: number;
};

function formatCurrency(value: number) {
  return `MVR ${value.toFixed(0)}`;
}

export default function RestaurantInteractiveMenu({
  restaurantName,
  restaurantSlug,
  membershipTier,
  restaurantWhatsApp,
  partnerWhatsApp,
  categories,
  items
}: RestaurantInteractiveMenuProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(categories[0]?.id ?? null);
  const [cart, setCart] = useState<Record<string, CartEntry>>({});

  const activeCategory = categories.find((category) => category.id === activeCategoryId) ?? categories[0] ?? null;
  const categoryItems = useMemo(() => {
    if (!activeCategory) return [];
    return items.filter((item) => item.categoryId === activeCategory.id);
  }, [activeCategory, items]);

  const cartEntries = useMemo(() => Object.values(cart).sort((left, right) => left.item.name.localeCompare(right.item.name)), [cart]);
  const selectedCount = cartEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const estimatedValue = cartEntries.reduce((sum, entry) => sum + (entry.item.priceMvr ?? 0) * entry.quantity, 0);

  function addItem(item: RestaurantMenuItem) {
    if (!item.isAvailable) return;
    setCart((current) => {
      const existing = current[item.id];
      if (!existing) return { ...current, [item.id]: { item, quantity: 1 } };
      return { ...current, [item.id]: { ...existing, quantity: existing.quantity + 1 } };
    });
  }

  function updateQuantity(itemId: string, delta: number) {
    setCart((current) => {
      const entry = current[itemId];
      if (!entry) return current;
      const nextQuantity = entry.quantity + delta;
      if (nextQuantity <= 0) {
        const next = { ...current };
        delete next[itemId];
        return next;
      }
      return { ...current, [itemId]: { ...entry, quantity: nextQuantity } };
    });
  }

  const cta = resolveRestaurantMenuCta({
    restaurantName,
    restaurantSlug,
    membershipTier,
    restaurantWhatsApp,
    partnerWhatsApp,
    ithoddooWhatsapp: platformConfig.whatsappNumbers.concierge,
    platformDomain: platformConfig.brand.domain,
    items: cartEntries.map((entry) => ({
      name: entry.item.name,
      quantity: entry.quantity,
      priceMvr: entry.item.priceMvr
    })),
    estimatedMenuValue: estimatedValue
  });

  if (categories.length === 0 || items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Interactive menu</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">{restaurantName} Menu</h3>
          <p className="mt-2 text-sm text-slate-600">Select items for an enquiry request. Prices are base menu prices and exclude 8% GST.</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Menu prices exclude 8% GST.
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategoryId(category.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeCategory?.id === category.id ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_320px]">
        <div className="space-y-3">
          {categoryItems.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-950">{item.name}</h4>
                  {item.description ? <p className="mt-2 text-sm text-slate-600">{item.description}</p> : null}
                  <p className="mt-3 text-sm font-semibold text-slate-900">MVR {item.priceMvr ?? "—"}</p>
                </div>
                <button
                  type="button"
                  disabled={!item.isAvailable}
                  onClick={() => addItem(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${item.isAvailable ? "bg-emerald-600 text-white hover:bg-emerald-700" : "cursor-not-allowed bg-slate-200 text-slate-500"}`}
                >
                  {item.isAvailable ? "Add" : "Unavailable"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Selected items</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">{selectedCount}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Estimated menu value</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">{formatCurrency(estimatedValue)}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {cartEntries.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">Select menu items to start an enquiry.</p>
            ) : null}
            {cartEntries.map((entry) => (
              <div key={entry.item.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{entry.item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatCurrency(entry.item.priceMvr ?? 0)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateQuantity(entry.item.id, -1)} className="rounded-full border border-slate-300 px-2.5 py-1 text-sm">−</button>
                    <span className="min-w-6 text-center text-sm font-semibold text-slate-900">{entry.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(entry.item.id, 1)} className="rounded-full border border-slate-300 px-2.5 py-1 text-sm">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {cta ? (
            <div className="mt-5 hidden lg:block">
              <a
                href={cta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                {cta.label}
              </a>
            </div>
          ) : null}
        </aside>
      </div>

      {cta ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white p-4 shadow-[0_-8px_32px_rgba(15,23,42,0.15)] lg:hidden">
          <a
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            {cta.label}
          </a>
        </div>
      ) : null}
    </div>
  );
}
