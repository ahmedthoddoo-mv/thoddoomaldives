"use client";

import type { PricingEditorCopy } from "@/lib/partner-onboarding/onboardingSchemas";
import type { PartnerApplicationPriceInput, PricingCurrency, PricingUnit } from "@/types/partner-smart-onboarding";

const currencies: PricingCurrency[] = ["USD", "MVR"];
const units: PricingUnit[] = ["per night", "per person", "per trip", "per hour", "per transfer", "per package"];

type PricingEditorProps = {
  rows: PartnerApplicationPriceInput[];
  onChange: (rows: PartnerApplicationPriceInput[]) => void;
  copy?: PricingEditorCopy;
};

const defaultCopy: PricingEditorCopy = {
  heading: "Pricing",
  helper: "Add the items, services, packages, or offers visitors can request.",
  rowLabel: "Pricing row",
  itemLabel: "Item/service name",
  itemPlaceholder: "Service package, visitor offer, custom request...",
  descriptionPlaceholder: "Short explanation for the customer",
  priceLabel: "Price",
  childPriceLabel: "Child price",
  notesPlaceholder: "Seasonal pricing, inclusions, blackout dates...",
  addLabel: "Add pricing row",
  defaultUnit: "per person"
};

function createRow(overrides: Partial<PartnerApplicationPriceInput> = {}): PartnerApplicationPriceInput {
  return {
    id: `price-${Date.now().toString(36)}`,
    itemName: "",
    description: "",
    price: "",
    currency: "USD",
    unit: "per person",
    childPrice: "",
    notes: "",
    active: true,
    ...overrides
  };
}

export function PricingEditor({ rows, onChange, copy = defaultCopy }: PricingEditorProps) {
  function updateRow(id: string, updates: Partial<PartnerApplicationPriceInput>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...updates } : row)));
  }

  function moveRow(id: string, direction: -1 | 1) {
    const index = rows.findIndex((row) => row.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= rows.length) return;
    const nextRows = [...rows];
    const [row] = nextRows.splice(index, 1);
    nextRows.splice(nextIndex, 0, row);
    onChange(nextRows);
  }

  return (
    <div className="pricingEditor">
      <div className="sectionHeader">
        <h3>{copy.heading}</h3>
        <p>{copy.helper}</p>
      </div>
      {rows.map((row, index) => (
        <article className="pricingEditorRow" key={row.id}>
          <div className="pricingEditorHeader">
            <strong>{copy.rowLabel} {index + 1}</strong>
            <div>
              <button type="button" onClick={() => moveRow(row.id, -1)}>Up</button>
              <button type="button" onClick={() => moveRow(row.id, 1)}>Down</button>
              <button type="button" onClick={() => onChange([...rows.slice(0, index + 1), createRow({ ...row, id: `price-${Date.now().toString(36)}-copy` }), ...rows.slice(index + 1)])}>Duplicate</button>
              <button type="button" onClick={() => onChange(rows.filter((item) => item.id !== row.id))}>Remove</button>
            </div>
          </div>
          <div className="onboardingGrid">
            <label>
              <span>{copy.itemLabel}</span>
              <input value={row.itemName} onChange={(event) => updateRow(row.id, { itemName: event.target.value })} placeholder={copy.itemPlaceholder} />
            </label>
            <label>
              <span>Description</span>
              <input value={row.description} onChange={(event) => updateRow(row.id, { description: event.target.value })} placeholder={copy.descriptionPlaceholder} />
            </label>
            <label>
              <span>{copy.priceLabel}</span>
              <input inputMode="decimal" value={row.price} onChange={(event) => updateRow(row.id, { price: event.target.value.replace(/[^\d.]/g, "") })} placeholder="85" />
            </label>
            <label>
              <span>Currency</span>
              <select value={row.currency} onChange={(event) => updateRow(row.id, { currency: event.target.value as PricingCurrency })}>
                {currencies.map((currency) => <option key={currency}>{currency}</option>)}
              </select>
            </label>
            <label>
              <span>Unit</span>
              <select value={row.unit} onChange={(event) => updateRow(row.id, { unit: event.target.value as PricingUnit })}>
                {units.map((unit) => <option key={unit}>{unit}</option>)}
              </select>
            </label>
            <label>
              <span>{copy.childPriceLabel}</span>
              <input inputMode="decimal" value={row.childPrice} onChange={(event) => updateRow(row.id, { childPrice: event.target.value.replace(/[^\d.]/g, "") })} placeholder="Optional" />
            </label>
            <label className="onboardingWide">
              <span>Notes</span>
              <textarea value={row.notes} onChange={(event) => updateRow(row.id, { notes: event.target.value })} placeholder={copy.notesPlaceholder} />
            </label>
            <label className="pricingEditorToggle">
              <input checked={row.active} onChange={(event) => updateRow(row.id, { active: event.target.checked })} type="checkbox" />
              <span>Active</span>
            </label>
          </div>
        </article>
      ))}
      <button className="pricingEditorAdd" type="button" onClick={() => onChange([...rows, createRow({ unit: copy.defaultUnit })])}>
        {copy.addLabel}
      </button>
    </div>
  );
}

export { createRow as createPricingRow };
