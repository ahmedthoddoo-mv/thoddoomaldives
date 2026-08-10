"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { publishBusinessOnboardingDraft, saveBusinessOnboardingDraft } from "@/lib/onboarding/server";
import {
  getBusinessOnboardingDefinition,
  getBusinessOnboardingSteps,
  getDefaultBusinessOnboardingValues,
  mergeBusinessOnboardingValues,
  parseGuesthouseRooms,
  serializeGuesthouseRooms,
  validateBusinessOnboardingStep,
  type BusinessOnboardingValue,
  type GuesthouseRoomDraft,
  type BusinessOnboardingValues
} from "@/lib/onboarding/businessOnboardingDefinitions";

type BusinessOnboardingWizardProps = {
  ownerType: "admin" | "partner";
  businessType: string;
  draftId?: string;
  initialValues?: BusinessOnboardingValues;
  listingId?: string;
  initialStepId?: string;
  allowedBusinessTypes?: string[];
  onBusinessTypeChange?: (businessType: string) => void;
};

function StepShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-6 space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-slate-400"
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 4 }: { value: string; onChange: (value: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      className="min-h-[96px] w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}

export function BusinessOnboardingWizard({
  ownerType,
  businessType,
  draftId,
  initialValues,
  listingId,
  initialStepId,
  allowedBusinessTypes = ["restaurant", "guesthouse", "experience", "transfer"],
  onBusinessTypeChange
}: BusinessOnboardingWizardProps) {
  const initialBusinessType = String((initialValues?.businessType ?? businessType) || "restaurant");
  const [values, setValues] = useState<BusinessOnboardingValues>(
    mergeBusinessOnboardingValues(getDefaultBusinessOnboardingValues(initialBusinessType), initialValues ?? {})
  );
  const activeBusinessType = String((values.businessType ?? initialBusinessType) || "restaurant");
  const definition = useMemo(() => getBusinessOnboardingDefinition(activeBusinessType), [activeBusinessType]);
  const steps = useMemo(() => getBusinessOnboardingSteps(activeBusinessType), [activeBusinessType]);
  const [stepIndex, setStepIndex] = useState(() => {
    const initialSteps = getBusinessOnboardingSteps(initialBusinessType);
    const lookup = initialStepId ? initialSteps.findIndex((step) => step.id === initialStepId) : -1;
    return lookup >= 0 ? lookup : 0;
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [draftState, setDraftState] = useState<string | null>(draftId ?? null);
  const [draftResumePath, setDraftResumePath] = useState<string | null>(
    draftId ? `/admin/businesses/${draftId}/onboarding` : null
  );
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    onBusinessTypeChange?.(activeBusinessType);
  }, [activeBusinessType, onBusinessTypeChange]);

  const boundedStepIndex = Math.min(stepIndex, Math.max(0, steps.length - 1));
  const currentStep = steps[boundedStepIndex];

  function updateValue(key: string, value: BusinessOnboardingValue) {
    setValues((previous) => ({ ...previous, [key]: value }));
  }

  function changeBusinessType(nextBusinessType: string) {
    setValues((previous) => {
      const nextDefaults = getDefaultBusinessOnboardingValues(nextBusinessType);
      return mergeBusinessOnboardingValues(nextDefaults, { ...previous, businessType: nextBusinessType });
    });
    setStepIndex(0);
    setErrors([]);
    setStatusMessage("");
  }

  function handleNext() {
    const validationErrors = validateBusinessOnboardingStep(definition, values, currentStep.id);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    if (boundedStepIndex < steps.length - 1) {
      setStepIndex((previous) => previous + 1);
      return;
    }
    setStatusMessage("All steps are complete. Save draft to preserve changes.");
  }

  function handlePrevious() {
    setErrors([]);
    if (boundedStepIndex > 0) {
      setStepIndex((previous) => previous - 1);
    }
  }

  async function handleSave() {
    setStatusMessage("Saving draft...");
    const result = await saveBusinessOnboardingDraft({
      draftId: draftState ?? undefined,
      ownerType,
      businessType: activeBusinessType,
      currentStep: currentStep.id,
      listingId,
      values: values as Record<string, unknown>
    });
    if (result.ok) {
      const savedDraftId = result.draftId;
      setDraftState(savedDraftId ?? null);
      const resumePath = result.resumePath ?? (savedDraftId ? `/admin/businesses/${savedDraftId}/onboarding` : null);
      setDraftResumePath(resumePath);
      setStatusMessage("Draft saved successfully. You can safely leave and continue later.");
      if (resumePath && typeof window !== "undefined") {
        // Soft URL update — preserves wizard state without a full navigation
        const alreadyOnDraftRoute = window.location.pathname.includes(savedDraftId ?? "");
        if (!alreadyOnDraftRoute) {
          window.history.replaceState({}, "", resumePath);
        }
      }
    } else {
      setStatusMessage(result.message ?? "The draft could not be saved.");
    }
  }

  async function handlePublish() {
    if (!draftState) {
      setStatusMessage("Save a draft first so the listing can be published.");
      return;
    }
    setIsPublishing(true);
    const result = await publishBusinessOnboardingDraft({
      draftId: draftState,
      businessType: activeBusinessType,
      values: values as Record<string, unknown>,
      listingId
    });
    setIsPublishing(false);
    if (result.ok) {
      setStatusMessage("Listing published successfully.");
      setValues((previous) => ({ ...previous, publicationStatus: "published", verificationStatus: "verified" }));
    } else {
      setStatusMessage(result.message ?? "Publishing failed.");
    }
  }

  const guesthouseRooms = useMemo(() => parseGuesthouseRooms(values.guesthouseRooms), [values.guesthouseRooms]);
  const guesthouseAmenities = useMemo(
    () => String(values.amenities ?? "").split("\n").map((item) => item.trim()).filter(Boolean),
    [values.amenities]
  );

  function saveGuesthouseRooms(nextRooms: GuesthouseRoomDraft[]) {
    updateValue("guesthouseRooms", serializeGuesthouseRooms(nextRooms));
    if (!String(values.numberOfRooms ?? "").trim()) {
      updateValue("numberOfRooms", String(nextRooms.reduce((total, room) => total + Math.max(1, room.quantity), 0)));
    }
  }

  function addGuesthouseRoom() {
    saveGuesthouseRooms([
      ...guesthouseRooms,
      {
        id: `room-${Date.now().toString(36)}`,
        name: "",
        description: "",
        maxGuests: 2,
        bedType: "",
        quantity: 1,
        basePrice: "",
        gallery: [],
        amenities: [],
        featured: guesthouseRooms.length === 0
      }
    ]);
  }

  function updateGuesthouseRoom(roomId: string, updater: (room: GuesthouseRoomDraft) => GuesthouseRoomDraft) {
    saveGuesthouseRooms(guesthouseRooms.map((room) => (room.id === roomId ? updater(room) : room)));
  }

  function moveGuesthouseRoom(roomId: string, direction: "up" | "down") {
    const index = guesthouseRooms.findIndex((room) => room.id === roomId);
    if (index < 0) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= guesthouseRooms.length) return;
    const next = [...guesthouseRooms];
    [next[index], next[targetIndex]] = [next[targetIndex]!, next[index]!];
    saveGuesthouseRooms(next);
  }

  function renderStepContent() {
    switch (currentStep.id) {
      case "business":
        return (
          <StepShell title="Business" description="Set the core business identity and short summary for the listing.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={activeBusinessType === "guesthouse" ? "Property name" : "Business name"} hint="This becomes the public listing title.">
                <TextInput value={String(values.title ?? "")} onChange={(value) => updateValue("title", value)} placeholder={activeBusinessType === "guesthouse" ? "e.g. Thoddoo Sun Sky Inn" : "e.g. Food Land"} />
              </Field>
              <Field label="Slug" hint="Used for the public URL and should be unique.">
                <TextInput value={String(values.slug ?? "")} onChange={(value) => updateValue("slug", value)} placeholder="food-land" />
              </Field>
              <Field label="Short description" hint="Short, public-facing description.">
                <TextInput value={String(values.shortDescription ?? "")} onChange={(value) => updateValue("shortDescription", value)} placeholder={activeBusinessType === "guesthouse" ? "Beachside guesthouse with island-hosted stays." : "Fresh seafood and local dining"} />
              </Field>
              <Field label="Category" hint="Select the module that plugs into the shared onboarding workflow.">
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={activeBusinessType}
                  onChange={(event) => changeBusinessType(event.target.value)}
                  disabled={ownerType !== "admin"}
                >
                  {allowedBusinessTypes.map((typeOption) => (
                    <option key={typeOption} value={typeOption}>
                      {getBusinessOnboardingDefinition(typeOption).label}
                    </option>
                  ))}
                </select>
              </Field>
              {activeBusinessType === "guesthouse" ? (
                <Field label="Property type" hint="Guesthouse, hotel, boutique hotel, villa, apartment, or homestay.">
                  <TextInput value={String(values.propertyType ?? "")} onChange={(value) => updateValue("propertyType", value)} placeholder="Guesthouse" />
                </Field>
              ) : null}
              <div className="md:col-span-2">
                <Field label="Full description" hint="Supports the full profile, not just the title.">
                  <TextArea value={String(values.description ?? "")} onChange={(value) => updateValue("description", value)} placeholder="Describe the business, atmosphere, and experience." rows={5} />
                </Field>
              </div>
            </div>
          </StepShell>
        );
      case "contact":
        return (
          <StepShell title="Contact" description="Capture the public-facing communications details.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Phone" hint="Public phone number for the listing.">
                <TextInput value={String(values.phone ?? "")} onChange={(value) => updateValue("phone", value)} placeholder="+960 1234567" />
              </Field>
              <Field label="WhatsApp" hint="Used in the public contact area and menus.">
                <TextInput value={String(values.whatsapp ?? "")} onChange={(value) => updateValue("whatsapp", value)} placeholder="+960 9910136" />
              </Field>
              <Field label="Email" hint="Primary email for enquiries.">
                <TextInput value={String(values.email ?? "")} onChange={(value) => updateValue("email", value)} placeholder="hello@business.com" />
              </Field>
              <Field label="Website" hint="Public website URL.">
                <TextInput value={String(values.website ?? "")} onChange={(value) => updateValue("website", value)} placeholder="https://example.com" />
              </Field>
              <Field label="Instagram" hint="Optional public social link.">
                <TextInput value={String(values.instagram ?? "")} onChange={(value) => updateValue("instagram", value)} placeholder="https://instagram.com/business" />
              </Field>
              <Field label="Facebook" hint="Optional public social link.">
                <TextInput value={String(values.facebook ?? "")} onChange={(value) => updateValue("facebook", value)} placeholder="https://facebook.com/business" />
              </Field>
            </div>
          </StepShell>
        );
      case "location":
        return (
          <StepShell title="Location" description="Store the location information that will be used on the public profile.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Island" hint="Island or locality for this listing.">
                <TextInput value={String(values.island ?? "")} onChange={(value) => updateValue("island", value)} placeholder="Thoddoo" />
              </Field>
              <Field label="Address" hint="Physical address where practical.">
                <TextInput value={String(values.address ?? "")} onChange={(value) => updateValue("address", value)} placeholder="Main road, Thoddoo" />
              </Field>
              <Field label="Latitude" hint="Coordinate preview support is ready for future map integrations.">
                <TextInput value={String(values.latitude ?? "")} onChange={(value) => updateValue("latitude", value)} placeholder="4.171" />
              </Field>
              <Field label="Longitude" hint="Coordinate preview support is ready for future map integrations.">
                <TextInput value={String(values.longitude ?? "")} onChange={(value) => updateValue("longitude", value)} placeholder="73.136" />
              </Field>
            </div>
          </StepShell>
        );
      case "hours":
        return (
          <StepShell title="Hours" description="Capture a simple schedule that can be reused across future categories.">
            <div className="grid gap-4">
              <Field label="Hours mode" hint="Supports same-hours and custom schedules.">
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={String(values.hoursMode ?? "same-hours")}
                  onChange={(event) => updateValue("hoursMode", event.target.value)}
                >
                  <option value="same-hours">Same hours every day</option>
                  <option value="custom">Day-by-day overrides</option>
                </select>
              </Field>
              <Field label="Hours text" hint="A plain-language schedule that can be re-used on the public profile.">
                <TextArea value={String(values.hoursText ?? "")} onChange={(value) => updateValue("hoursText", value)} placeholder="Open daily from 10:00 to 22:00" rows={4} />
              </Field>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={Boolean(values.isClosed)} onChange={(event) => updateValue("isClosed", event.target.checked)} />
                <span>Marked as closed temporarily</span>
              </label>
            </div>
          </StepShell>
        );
      case "media":
        return (
          <StepShell title="Media" description="Store the basic media links and flags that are shared across business types.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Logo URL" hint="Optional logo link.">
                <TextInput value={String(values.logoUrl ?? "")} onChange={(value) => updateValue("logoUrl", value)} placeholder="https://cdn.example.com/logo.png" />
              </Field>
              <Field label="Cover URL" hint="Main hero image for the listing.">
                <TextInput value={String(values.coverUrl ?? "")} onChange={(value) => updateValue("coverUrl", value)} placeholder="https://cdn.example.com/cover.jpg" />
              </Field>
              <Field label="Gallery URL" hint="Optional gallery reference.">
                <TextInput value={String(values.galleryUrl ?? "")} onChange={(value) => updateValue("galleryUrl", value)} placeholder="https://cdn.example.com/gallery" />
              </Field>
              <label className="flex items-center gap-2 self-end text-sm text-slate-700">
                <input type="checkbox" checked={Boolean(values.featured)} onChange={(event) => updateValue("featured", event.target.checked)} />
                <span>Show as featured</span>
              </label>
            </div>
          </StepShell>
        );
      case "membership":
        return (
          <StepShell title="Membership" description="The engine keeps membership, verification, and publish controls distinct.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Membership tier" hint="Admin-controlled membership for owner features.">
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={String(values.membershipTier ?? "starter")}
                  onChange={(event) => updateValue("membershipTier", event.target.value)}
                  disabled={ownerType !== "admin"}
                >
                  <option value="starter">Starter</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </Field>
              <Field label="Protected field note" hint="The UI warns that verification, publishing, and featured flags remain admin controlled.">
                <TextInput value={String(values.protectedFieldNote ?? "")} onChange={(value) => updateValue("protectedFieldNote", value)} />
              </Field>
            </div>
          </StepShell>
        );
      case "restaurant-module":
        return (
          <StepShell title="Restaurant module" description="Capture the restaurant-only fields while keeping the common workflow reusable.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Cuisine" hint="List cuisine categories and styles.">
                <TextArea value={String(values.cuisine ?? "")} onChange={(value) => updateValue("cuisine", value)} placeholder="Seafood, Italian, BBQ" rows={4} />
              </Field>
              <Field label="Price range" hint="Example: Low, Mid, Premium.">
                <TextInput value={String(values.priceRange ?? "")} onChange={(value) => updateValue("priceRange", value)} placeholder="Mid" />
              </Field>
              <Field label="Source menu URL" hint="Optional source menu or upload reference.">
                <TextInput value={String(values.sourceMenuUrl ?? "")} onChange={(value) => updateValue("sourceMenuUrl", value)} placeholder="https://.../menu.pdf" />
              </Field>
              <label className="flex items-center gap-2 self-end text-sm text-slate-700">
                <input type="checkbox" checked={Boolean(values.showOriginalMenu)} onChange={(event) => updateValue("showOriginalMenu", event.target.checked)} />
                <span>Show the original menu publicly</span>
              </label>
              <div className="md:col-span-2">
                <Field label="Interactive menu draft" hint="Structured menu import data is stored here and can be reviewed before publication.">
                  <TextArea value={String(values.interactiveMenu ?? "[]")} onChange={(value) => updateValue("interactiveMenu", value)} placeholder='[{"name":"Starters","items":[{"name":"Seafood soup","priceMvr":150}]}]' rows={8} />
                </Field>
              </div>
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">Promotions</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Promotion title">
                    <TextInput value={String(values.promotionTitle ?? "")} onChange={(value) => updateValue("promotionTitle", value)} placeholder="Today's Special" />
                  </Field>
                  <Field label="CTA label">
                    <TextInput value={String(values.promotionCtaLabel ?? "")} onChange={(value) => updateValue("promotionCtaLabel", value)} placeholder="Reserve now" />
                  </Field>
                  <Field label="Promotion description">
                    <TextArea value={String(values.promotionDescription ?? "")} onChange={(value) => updateValue("promotionDescription", value)} placeholder="Fresh seafood tonight" rows={3} />
                  </Field>
                  <Field label="CTA destination">
                    <TextInput value={String(values.promotionCtaDestination ?? "")} onChange={(value) => updateValue("promotionCtaDestination", value)} placeholder="https://wa.me/..." />
                  </Field>
                  <Field label="Promotion media URL">
                    <TextInput value={String(values.promotionMediaUrl ?? "")} onChange={(value) => updateValue("promotionMediaUrl", value)} placeholder="https://cdn.example.com/promo.jpg" />
                  </Field>
                  <label className="flex items-center gap-2 self-end text-sm text-slate-700">
                    <input type="checkbox" checked={Boolean(values.promotionActive)} onChange={(event) => updateValue("promotionActive", event.target.checked)} />
                    <span>Promotion active</span>
                  </label>
                </div>
              </div>
            </div>
          </StepShell>
        );
      case "review":
        return (
          <StepShell title="Review" description="Check the public-facing summary before final publication.">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Business</p>
                  <p className="text-lg font-semibold text-slate-900">{String(values.title ?? "Untitled business")}</p>
                  <p className="text-sm text-slate-600">{String(values.shortDescription ?? values.description ?? "")}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Contact</p>
                    <p className="text-sm text-slate-600">Phone: {String(values.phone ?? "—")}</p>
                    <p className="text-sm text-slate-600">WhatsApp: {String(values.whatsapp ?? "—")}</p>
                    <p className="text-sm text-slate-600">Email: {String(values.email ?? "—")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Location</p>
                    <p className="text-sm text-slate-600">Island: {String(values.island ?? "—")}</p>
                    <p className="text-sm text-slate-600">Address: {String(values.address ?? "—")}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{activeBusinessType === "guesthouse" ? "Guesthouse summary" : "Restaurant summary"}</p>
                  {activeBusinessType === "guesthouse" ? (
                    <>
                      <p className="text-sm text-slate-600">Property type: {String(values.propertyType ?? "—")}</p>
                      <p className="text-sm text-slate-600">Rooms: {String((values.numberOfRooms ?? guesthouseRooms.length) || "—")}</p>
                      <p className="text-sm text-slate-600">Amenities: {String(values.amenities ?? "").split("\n").filter(Boolean).length || 0}</p>
                      <p className="text-sm text-slate-600">Facilities: {String(values.facilities ?? "").split("\n").filter(Boolean).length || 0}</p>
                      <p className="text-sm text-slate-600">Policies: {String(values.guesthousePolicies ?? "").split("\n").filter(Boolean).length || 0}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-600">Cuisine: {String(values.cuisine ?? "—")}</p>
                      <p className="text-sm text-slate-600">Price range: {String(values.priceRange ?? "—")}</p>
                    </>
                  )}
                </div>
                {activeBusinessType === "guesthouse" ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                    Missing checks: {[
                      !String(values.coverUrl ?? "").trim() ? "hero image" : "",
                      guesthouseRooms.length === 0 ? "room inventory" : "",
                      guesthouseRooms.some((room) => !room.basePrice.trim()) ? "room prices" : "",
                      !String(values.whatsapp ?? "").trim() ? "WhatsApp" : "",
                      !String(values.galleryUrl ?? "").trim() ? "gallery reference" : "",
                      !String(values.island ?? "").trim() ? "location" : "",
                      !String(values.checkIn ?? "").trim() || !String(values.checkOut ?? "").trim() ? "check-in/check-out" : ""
                    ].filter(Boolean).join(", ") || "none"}
                  </div>
                ) : null}
              </div>
            </div>
          </StepShell>
        );
      case "publish":
        return (
          <StepShell title="Publish" description="Set the verification and publication state.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Publication status">
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={String(values.publicationStatus ?? "draft")}
                  onChange={(event) => updateValue("publicationStatus", event.target.value)}
                  disabled={ownerType !== "admin"}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
              <Field label="Verification status">
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={String(values.verificationStatus ?? "pending")}
                  onChange={(event) => updateValue("verificationStatus", event.target.value)}
                  disabled={ownerType !== "admin"}
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </Field>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={Boolean(values.featured)} onChange={(event) => updateValue("featured", event.target.checked)} disabled={ownerType !== "admin"} />
                <span>Featured listing</span>
              </label>
              {activeBusinessType === "restaurant" ? (
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={Boolean(values.showOriginalMenu)} onChange={(event) => updateValue("showOriginalMenu", event.target.checked)} disabled={ownerType !== "admin"} />
                  <span>Show original source menu publicly</span>
                </label>
              ) : null}
              {ownerType !== "admin" ? (
                <p className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  Verification, publication, membership, featured, and ownership fields are admin controlled.
                </p>
              ) : null}
            </div>
          </StepShell>
        );
      case "property-details":
        return (
          <StepShell title="Property details" description="Capture core property information used by the canonical guesthouse profile.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Property type" hint="Guesthouse, Hotel, Boutique Hotel, Villa, Apartment, or Homestay.">
                <TextInput value={String(values.propertyType ?? "")} onChange={(value) => updateValue("propertyType", value)} placeholder="Guesthouse" />
              </Field>
              <Field label="Number of rooms" hint="Used in admin, partner, and public summaries.">
                <TextInput value={String(values.numberOfRooms ?? "")} onChange={(value) => updateValue("numberOfRooms", value)} placeholder="12" />
              </Field>
              <Field label="Check-in" hint="Use HH:MM where possible.">
                <TextInput value={String(values.checkIn ?? "")} onChange={(value) => updateValue("checkIn", value)} placeholder="14:00" />
              </Field>
              <Field label="Check-out" hint="Use HH:MM where possible.">
                <TextInput value={String(values.checkOut ?? "")} onChange={(value) => updateValue("checkOut", value)} placeholder="12:00" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Languages spoken" hint="One language per line.">
                  <TextArea value={String(values.languagesSpoken ?? "")} onChange={(value) => updateValue("languagesSpoken", value)} placeholder={"English\nDhivehi"} rows={3} />
                </Field>
              </div>
            </div>
          </StepShell>
        );
      case "rooms":
        return (
          <StepShell title="Rooms" description="Add room types, pricing, occupancy, amenities, and room galleries.">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Room management</p>
                <button type="button" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700" onClick={addGuesthouseRoom}>
                  Add Room
                </button>
              </div>
              <div className="space-y-4">
                {guesthouseRooms.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">No rooms added yet. Add at least one room to continue.</p>
                ) : guesthouseRooms.map((room, index) => (
                  <article key={room.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">Room {index + 1}</p>
                      <div className="flex items-center gap-3">
                        <button type="button" className="text-xs font-semibold text-slate-700" disabled={index === 0} onClick={() => moveGuesthouseRoom(room.id, "up")}>Up</button>
                        <button type="button" className="text-xs font-semibold text-slate-700" disabled={index === guesthouseRooms.length - 1} onClick={() => moveGuesthouseRoom(room.id, "down")}>Down</button>
                        <button
                          type="button"
                          className="text-xs font-semibold text-red-600"
                          onClick={() => saveGuesthouseRooms(guesthouseRooms.filter((entry) => entry.id !== room.id))}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Name"><TextInput value={room.name} onChange={(value) => updateGuesthouseRoom(room.id, (current) => ({ ...current, name: value }))} placeholder="Deluxe Double Room" /></Field>
                      <Field label="Base price"><TextInput value={room.basePrice} onChange={(value) => updateGuesthouseRoom(room.id, (current) => ({ ...current, basePrice: value }))} placeholder="USD 120/night" /></Field>
                      <Field label="Maximum guests"><TextInput value={String(room.maxGuests || "")} onChange={(value) => updateGuesthouseRoom(room.id, (current) => ({ ...current, maxGuests: Number(value) || 0 }))} placeholder="2" /></Field>
                      <Field label="Quantity"><TextInput value={String(room.quantity || "")} onChange={(value) => updateGuesthouseRoom(room.id, (current) => ({ ...current, quantity: Number(value) || 1 }))} placeholder="4" /></Field>
                      <Field label="Bed type"><TextInput value={room.bedType} onChange={(value) => updateGuesthouseRoom(room.id, (current) => ({ ...current, bedType: value }))} placeholder="King bed" /></Field>
                      <label className="flex items-center gap-2 self-end text-sm text-slate-700">
                        <input type="checkbox" checked={room.featured} onChange={(event) => saveGuesthouseRooms(guesthouseRooms.map((entry) => ({ ...entry, featured: entry.id === room.id ? event.target.checked : false })))} />
                        <span>Featured room</span>
                      </label>
                      <div className="md:col-span-2">
                        <Field label="Description"><TextArea value={room.description} onChange={(value) => updateGuesthouseRoom(room.id, (current) => ({ ...current, description: value }))} rows={3} /></Field>
                      </div>
                      <div className="md:col-span-2">
                        <Field label="Room gallery URLs" hint="One URL per line.">
                          <TextArea value={room.gallery.join("\n")} onChange={(value) => updateGuesthouseRoom(room.id, (current) => ({ ...current, gallery: value.split("\n").map((entry) => entry.trim()).filter(Boolean) }))} rows={3} />
                        </Field>
                      </div>
                      <div className="md:col-span-2">
                        <Field label="Room amenities" hint="One amenity per line.">
                          <TextArea value={room.amenities.join("\n")} onChange={(value) => updateGuesthouseRoom(room.id, (current) => ({ ...current, amenities: value.split("\n").map((entry) => entry.trim()).filter(Boolean) }))} rows={3} />
                        </Field>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </StepShell>
        );
      case "amenities-facilities":
        return (
          <StepShell title="Amenities & facilities" description="Capture property amenities, facilities, and nearby attractions.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Amenities" hint="One amenity per line.">
                <TextArea value={String(values.amenities ?? "")} onChange={(value) => updateValue("amenities", value)} rows={4} />
              </Field>
              <Field label="Facilities" hint="One facility per line (restaurant, spa, gym, pool, diving, etc.).">
                <TextArea value={String(values.facilities ?? "")} onChange={(value) => updateValue("facilities", value)} rows={4} />
              </Field>
              <Field label="Nearby attractions" hint="One attraction per line (name|distance|description).">
                <TextArea value={String(values.nearbyAttractions ?? "")} onChange={(value) => updateValue("nearbyAttractions", value)} rows={4} />
              </Field>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                Suggested amenities: {guesthouseAmenities.join(", ") || "Air conditioning, Private bathroom, Free Wi-Fi, Daily housekeeping, Breakfast, Tea/coffee facilities, Mini refrigerator, Flat-screen TV, Hot-water shower, Toiletries, Hairdryer, Beach towels, Transfer assistance, Excursion bookings, Bicycle rental assistance"}
              </div>
            </div>
          </StepShell>
        );
      case "policies-booking":
        return (
          <StepShell title="Policies & booking" description="Set stay policies and public booking/contact channels.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Guesthouse policies" hint="One policy per line (children, pets, cancellation, taxes, payment, etc.).">
                <TextArea value={String(values.guesthousePolicies ?? values.policies ?? "")} onChange={(value) => { updateValue("guesthousePolicies", value); updateValue("policies", value); }} rows={4} />
              </Field>
              <Field label="Booking information notes" hint="One channel per line for quick notes.">
                <TextArea value={String(values.bookingChannels ?? "")} onChange={(value) => updateValue("bookingChannels", value)} rows={4} />
              </Field>
              <Field label="Booking.com URL"><TextInput value={String(values.bookingComUrl ?? "")} onChange={(value) => updateValue("bookingComUrl", value)} placeholder="https://www.booking.com/..." /></Field>
              <Field label="Airbnb URL"><TextInput value={String(values.airbnbUrl ?? "")} onChange={(value) => updateValue("airbnbUrl", value)} placeholder="https://www.airbnb.com/..." /></Field>
              <Field label="Expedia URL"><TextInput value={String(values.expediaUrl ?? "")} onChange={(value) => updateValue("expediaUrl", value)} placeholder="https://www.expedia.com/..." /></Field>
              <Field label="Direct booking URL"><TextInput value={String(values.directBookingUrl ?? "")} onChange={(value) => updateValue("directBookingUrl", value)} placeholder="https://..." /></Field>
              <div className="md:col-span-2">
                <Field label="Map or directions URL" hint="Preferred for public map and directions buttons.">
                  <TextInput value={String(values.mapUrl ?? "")} onChange={(value) => updateValue("mapUrl", value)} placeholder="https://maps.google.com/..." />
                </Field>
              </div>
            </div>
          </StepShell>
        );
      case "experience-module":
        return (
          <StepShell title="Experience module" description="A placeholder module for future experience onboarding expansion.">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              Duration, inclusions, meeting points, and equipment will plug into this step next.
            </div>
          </StepShell>
        );
      case "transfer-module":
        return (
          <StepShell title="Transfer module" description="A placeholder module for future transfer onboarding expansion.">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              Route, schedule, luggage, and pricing details will plug into this step next.
            </div>
          </StepShell>
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{definition.label} workflow</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">
          {activeBusinessType === "guesthouse" ? "Create a new guesthouse listing" : `Create a new ${definition.label.toLowerCase()} listing`}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {activeBusinessType === "guesthouse"
            ? "Add property details, rooms, amenities, photos, booking contacts, and policies through one guided flow."
            : definition.description}
        </p>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {steps.map((step, index) => {
            const active = index === stepIndex;
            const complete = index < stepIndex;
            return (
              <div key={step.id} className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-slate-900 text-white" : complete ? "bg-emerald-100 text-emerald-800" : "bg-white text-slate-600"}`}>
                {index + 1}. {step.label}
              </div>
            );
          })}
        </div>
      </div>

      {errors.length > 0 ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">{errors.join(" ")}</div> : null}
      {statusMessage ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
          <p className="font-medium">{statusMessage}</p>
          {draftResumePath && statusMessage.startsWith("Draft saved") ? (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link
                href={draftResumePath}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Open saved draft
              </Link>
              <button
                type="button"
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  const url = `${window.location.origin}${draftResumePath}`;
                  navigator.clipboard?.writeText(url).catch(() => undefined);
                }}
              >
                Copy resume link
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {renderStepContent()}

      <div className="sticky bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            Step {boundedStepIndex + 1} of {steps.length}: {currentStep.label}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" onClick={handlePrevious} disabled={boundedStepIndex === 0}>
              Back
            </button>
            <button type="button" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" onClick={() => handleSave()}>
              Save draft
            </button>
            {currentStep.id === "publish" && ownerType === "admin" ? (
              <button type="button" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? "Publishing..." : "Publish"}
              </button>
            ) : (
              <button type="button" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={handleNext}>
                {boundedStepIndex === steps.length - 1 ? "Finish" : "Continue"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
