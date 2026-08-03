"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAdminApplicationReview } from "@/app/admin/applications/actions";
import type { PartnerApplicationRecord } from "@/types/partner-application";

const commonLabels: Record<string, string> = {
  businessName: "Business name", contactPerson: "Owner / contact", whatsapp: "WhatsApp", email: "Email",
  website: "Website", island: "Island", address: "Address", googleMaps: "GPS / Google Maps",
  shortDescription: "Short description", fullDescription: "Full description", membership: "Membership"
};

const categoryDefaults: Record<string, Record<string, string>> = {
  guesthouse: { checkIn: "", checkOut: "", roomNotes: "", amenities: "", policies: "" },
  hotel: { checkIn: "", checkOut: "", roomNotes: "", amenities: "", policies: "" },
  restaurant: { cuisine: "", openingHours: "", averagePrice: "" },
  cafe: { cuisine: "", openingHours: "", averagePrice: "" },
  "speedboat-company": { departurePoint: "", arrivalPoint: "", duration: "", schedule: "", routes: "", luggage: "", pickupDropoff: "" },
  "ferry-operator": { departurePoint: "", arrivalPoint: "", duration: "", schedule: "", routes: "", luggage: "", pickupDropoff: "" },
  "transfer-company": { departurePoint: "", arrivalPoint: "", duration: "", schedule: "", routes: "", luggage: "", pickupDropoff: "" },
  "excursion-operator": { activityName: "", activityCategory: "", duration: "", includedItems: "" },
  "dive-center": { activityName: "", activityCategory: "", duration: "", includedItems: "" },
  watersports: { activityName: "", activityCategory: "", duration: "", includedItems: "" },
  photographer: { activityName: "", activityCategory: "", duration: "", includedItems: "" },
  "farm-experience": { activityName: "", activityCategory: "", duration: "", includedItems: "" },
  "local-guide": { activityName: "", activityCategory: "", duration: "", includedItems: "" }
};

export function ApplicationReviewEditor({ application }: { application: PartnerApplicationRecord }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [common, setCommon] = useState(application.reviewValues?.common ?? {});
  const [category, setCategory] = useState({ ...(categoryDefaults[application.businessType] ?? {}), ...(application.reviewValues?.category ?? {}) });
  const [prices, setPrices] = useState(application.reviewValues?.prices ?? []);
  const [reviewer, setReviewer] = useState(application.assignedReviewer === "Unassigned" ? "Admin" : application.assignedReviewer);
  const [verificationNotes, setVerificationNotes] = useState(application.reviewValues?.verificationNotes ?? "");
  const [publicMediaIds, setPublicMediaIds] = useState(application.reviewValues?.publicMediaIds ?? []);
  const [mediaRightsConfirmed, setMediaRightsConfirmed] = useState(application.reviewValues?.mediaRightsConfirmed ?? false);
  const [message, setMessage] = useState("");

  function save() {
    startTransition(async () => {
      const result = await saveAdminApplicationReview({ applicationId: application.id, reviewer, common, category, prices, verificationNotes, publicMediaIds, mediaRightsConfirmed });
      setMessage(result.message);
      if (result.ok) router.refresh();
    });
  }

  return (
    <section className="adminPanel">
      <div className="adminSectionHeader"><p className="eyebrow">Reviewed values</p><h2>Correct before approval</h2><p>Saving creates a versioned audit snapshot. Blank prices remain Price on request.</p></div>
      <div className="adminFormGrid">
        <label><span>Editor</span><input value={reviewer} onChange={(event) => setReviewer(event.target.value)} /></label>
        {Object.entries(common).map(([key, value]) => (
          <label className={key.includes("Description") ? "adminFormWide" : ""} key={key}>
            <span>{commonLabels[key] ?? key}</span>
            {key.includes("Description") ? <textarea rows={4} value={value} onChange={(event) => setCommon((current) => ({ ...current, [key]: event.target.value }))} /> : <input value={value} onChange={(event) => setCommon((current) => ({ ...current, [key]: event.target.value }))} />}
          </label>
        ))}
      </div>
      {Object.keys(category).length ? <><h3>Category details</h3><div className="adminFormGrid">{Object.entries(category).map(([key, value]) => <label key={key}><span>{key}</span><input value={value} onChange={(event) => setCategory((current) => ({ ...current, [key]: event.target.value }))} /></label>)}</div></> : null}
      <h3>Verification and public media</h3>
      <label className="adminFormWide"><span>Verification notes</span><textarea rows={4} value={verificationNotes} onChange={(event) => setVerificationNotes(event.target.value)} /></label>
      <div className="adminCrmStack">{(application.publicMedia ?? []).map((media) => <label key={media.id}><input type="checkbox" checked={publicMediaIds.includes(media.id)} onChange={(event) => setPublicMediaIds((current) => event.target.checked ? [...new Set([...current, media.id])] : current.filter((id) => id !== media.id))} /> {media.label} ({media.status})</label>)}</div>
      <label><input type="checkbox" checked={mediaRightsConfirmed} onChange={(event) => setMediaRightsConfirmed(event.target.checked)} /> I confirm the selected media has documented publication rights.</label>
      <h3>Structured prices</h3>
      <div className="adminCrmStack">
        {prices.map((price, index) => (
          <div className="adminFormGrid" key={`${index}-${price.name}`}>
            <label><span>Item</span><input value={price.name} onChange={(event) => setPrices((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} /></label>
            <label><span>Price</span><input inputMode="decimal" placeholder="Price on request" value={price.price} onChange={(event) => setPrices((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, price: event.target.value } : item))} /></label>
            <label><span>Currency</span><select value={price.currency} onChange={(event) => setPrices((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, currency: event.target.value } : item))}><option>USD</option><option>MVR</option></select></label>
            <label><span>Unit</span><input value={price.unit} onChange={(event) => setPrices((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, unit: event.target.value } : item))} /></label>
            <button type="button" onClick={() => setPrices((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove price</button>
          </div>
        ))}
        <button type="button" onClick={() => setPrices((current) => [...current, { name: "", price: "", currency: "USD", unit: application.businessType === "guesthouse" ? "per night" : "per person" }])}>Add price</button>
      </div>
      <div className="adminContentActions"><button disabled={pending} type="button" onClick={save}>{pending ? "Saving…" : "Save reviewed values"}</button></div>
      {message ? <p className="mutedText" role="status">{message}</p> : null}
      {application.reviewValues?.editedAt ? <small>Last edited {application.reviewValues.editedAt} by {application.reviewValues.editedBy}</small> : null}
    </section>
  );
}
