"use client";

import { useState, useTransition } from "react";
import { savePartnerServices } from "@/app/partner/actions";
import type { PartnerPortalServiceItem } from "@/lib/partner-portal/partnerAccess";

type PartnerRoomsViewProps = {
  initialServices: PartnerPortalServiceItem[];
  businessType?: import("@/types/business-type").BusinessType;
};

function createService(index: number): PartnerPortalServiceItem {
  return {
    id: `service-${Date.now().toString(36)}-${index}`,
    title: "New Room",
    description: "",
    price: "",
    currency: "USD",
    unit: "per night",
    childPrice: "",
    notes: "",
    active: true,
    sortOrder: index,
    metadata: {
      capacity: "2 guests",
      bedType: "",
      breakfast: "Confirm",
      availability: "Available",
      maxGuests: "2",
      quantity: "1",
      featured: "false",
      amenities: "",
      gallery: ""
    }
  };
}

export function PartnerRoomsView({ initialServices, businessType = "guesthouse" }: PartnerRoomsViewProps) {
  const [services, setServices] = useState(initialServices);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateService(id: string, updates: Partial<PartnerPortalServiceItem>) {
    setServices((current) => current.map((service) => (service.id === id ? { ...service, ...updates } : service)));
  }

  function updateMetadata(id: string, key: string, value: string) {
    setServices((current) =>
      current.map((service) => (service.id === id ? { ...service, metadata: { ...service.metadata, [key]: value } } : service))
    );
  }

  function saveServices() {
    startTransition(async () => {
      const result = await savePartnerServices(services.map((service, index) => ({ ...service, sortOrder: index })));
      setMessage(result.message);
    });
  }

  return (
    <div className="partnerPortalStack">
      <section className="partnerPortalPanel">
        <div className="partnerPortalSectionHeader">
          <p className="eyebrow">{businessType === "guesthouse" ? "Rooms" : "Services"}</p>
          <h2>Rooms / Services Manager</h2>
          <button type="button" onClick={() => setServices((current) => [...current, createService(current.length)])}>
            Add
          </button>
        </div>
        <div className="partnerPortalServiceEditor">
          {services.map((service, index) => (
            <article className="partnerPortalPanel" key={service.id}>
              <div className="partnerPortalSectionHeader">
                <p className="eyebrow">{service.active ? "Active" : "Inactive"}</p>
                <h2>{service.title || "Untitled"}</h2>
              </div>
              <div className="partnerPortalFormGrid">
                <label>
                  <span>Title</span>
                  <input value={service.title} onChange={(event) => updateService(service.id, { title: event.target.value })} />
                </label>
                <label>
                  <span>Price</span>
                  <input value={service.price} onChange={(event) => updateService(service.id, { price: event.target.value })} />
                </label>
                <label>
                  <span>Currency</span>
                  <select value={service.currency} onChange={(event) => updateService(service.id, { currency: event.target.value as "USD" | "MVR" })}>
                    <option>USD</option>
                    <option>MVR</option>
                  </select>
                </label>
                <label>
                  <span>Unit</span>
                  <select value={service.unit} onChange={(event) => updateService(service.id, { unit: event.target.value as PartnerPortalServiceItem["unit"] })}>
                    <option>per night</option>
                    <option>per person</option>
                    <option>per trip</option>
                    <option>per hour</option>
                    <option>per transfer</option>
                    <option>per package</option>
                  </select>
                </label>
                <label>
                  <span>Child Price</span>
                  <input value={service.childPrice} onChange={(event) => updateService(service.id, { childPrice: event.target.value })} />
                </label>
                <label>
                  <span>Max Guests</span>
                  <input value={service.metadata.maxGuests ?? ""} onChange={(event) => updateMetadata(service.id, "maxGuests", event.target.value)} />
                </label>
                <label>
                  <span>Room Quantity</span>
                  <input value={service.metadata.quantity ?? ""} onChange={(event) => updateMetadata(service.id, "quantity", event.target.value)} />
                </label>
                <label>
                  <span>Capacity</span>
                  <input value={service.metadata.capacity ?? ""} onChange={(event) => updateMetadata(service.id, "capacity", event.target.value)} />
                </label>
                <label>
                  <span>Beds / Vessel / Vehicle</span>
                  <input value={service.metadata.bedType ?? ""} onChange={(event) => updateMetadata(service.id, "bedType", event.target.value)} />
                </label>
                <label>
                  <span>Availability</span>
                  <input value={service.metadata.availability ?? ""} onChange={(event) => updateMetadata(service.id, "availability", event.target.value)} />
                </label>
                <label className="partnerPortalWide">
                  <span>Room Amenities (one per line)</span>
                  <textarea value={service.metadata.amenities ?? ""} onChange={(event) => updateMetadata(service.id, "amenities", event.target.value)} />
                </label>
                <label className="partnerPortalWide">
                  <span>Room Gallery URLs (one per line)</span>
                  <textarea value={service.metadata.gallery ?? ""} onChange={(event) => updateMetadata(service.id, "gallery", event.target.value)} />
                </label>
                <label className="partnerPortalWide">
                  <span>Description</span>
                  <textarea value={service.description} onChange={(event) => updateService(service.id, { description: event.target.value })} />
                </label>
                <label className="partnerPortalWide">
                  <span>Included Items / Amenities / Equipment / Safety Info</span>
                  <textarea value={service.notes} onChange={(event) => updateService(service.id, { notes: event.target.value })} />
                </label>
                <label>
                  <span>Featured Room</span>
                  <select value={service.metadata.featured ?? "false"} onChange={(event) => updateMetadata(service.id, "featured", event.target.value)}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </label>
              </div>
              <div className="partnerPortalActions">
                <button type="button" onClick={() => updateService(service.id, { active: !service.active })}>
                  {service.active ? "Deactivate" : "Activate"}
                </button>
                <button type="button" onClick={() => setServices((current) => current.filter((item) => item.id !== service.id))}>
                  Delete
                </button>
                <button type="button" onClick={() => setServices((current) => [...current, { ...service, id: `${service.id}-copy`, title: `${service.title} Copy`, sortOrder: current.length }])}>
                  Duplicate
                </button>
                <button disabled={index === 0} type="button" onClick={() => setServices((current) => {
                  const next = [...current];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  return next;
                })}>
                  Move Up
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="partnerPortalActions">
          <button disabled={isPending} onClick={saveServices} type="button">
            {isPending ? "Saving..." : "Save Rooms / Services"}
          </button>
        </div>
        {message ? <p className="propertySaveStatus propertySaveStatusSuccess">{message}</p> : null}
      </section>
    </div>
  );
}
