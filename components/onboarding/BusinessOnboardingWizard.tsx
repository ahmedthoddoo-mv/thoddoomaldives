"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { publishBusinessOnboardingDraft, saveBusinessOnboardingDraft } from "@/lib/onboarding/server";
import {
  getBusinessOnboardingDefinition,
  getBusinessOnboardingSteps,
  getDefaultBusinessOnboardingValues,
  mergeBusinessOnboardingValues,
  validateBusinessOnboardingStep,
  type BusinessOnboardingValues
} from "@/lib/onboarding/businessOnboardingDefinitions";

type BusinessOnboardingWizardProps = {
  ownerType: "admin" | "partner";
  businessType: string;
  draftId?: string;
  initialValues?: BusinessOnboardingValues;
  listingId?: string;
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

export function BusinessOnboardingWizard({ ownerType, businessType, draftId, initialValues, listingId }: BusinessOnboardingWizardProps) {
  const router = useRouter();
  const definition = useMemo(() => getBusinessOnboardingDefinition(businessType), [businessType]);
  const steps = useMemo(() => getBusinessOnboardingSteps(businessType), [businessType]);
  const [values, setValues] = useState<BusinessOnboardingValues>(mergeBusinessOnboardingValues(getDefaultBusinessOnboardingValues(businessType), initialValues ?? {}));
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [draftState, setDraftState] = useState<string | null>(draftId ?? null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);

  const currentStep = steps[stepIndex];

  function updateValue(key: string, value: string | boolean) {
    setValues((previous) => ({ ...previous, [key]: value }));
  }

  function handleNext() {
    const validationErrors = validateBusinessOnboardingStep(definition, values, currentStep.id);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    if (stepIndex < steps.length - 1) {
      setStepIndex((previous) => previous + 1);
    }
  }

  function handlePrevious() {
    setErrors([]);
    if (stepIndex > 0) {
      setStepIndex((previous) => previous - 1);
    }
  }

  async function handleSave() {
    setStatusMessage("Saving draft...");
    const result = await saveBusinessOnboardingDraft({
      draftId: draftState ?? undefined,
      ownerType,
      businessType,
      currentStep: currentStep.id,
      listingId,
      values: values as Record<string, unknown>
    });
    if (result.ok) {
      setDraftState(result.draftId ?? null);
      setStatusMessage("Draft saved. You can resume later from this link.");
      const nextQuery = result.draftId ? `?draftId=${result.draftId}` : "";
      router.replace(nextQuery || window.location.pathname);
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
      businessType,
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

  function renderStepContent() {
    switch (currentStep.id) {
      case "business":
        return (
          <StepShell title="Business" description="Set the core business identity and short summary for the listing.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Business name" hint="This becomes the public listing title.">
                <TextInput value={String(values.title ?? "")} onChange={(value) => updateValue("title", value)} placeholder="e.g. Food Land" />
              </Field>
              <Field label="Slug" hint="Used for the public URL and should be unique.">
                <TextInput value={String(values.slug ?? "")} onChange={(value) => updateValue("slug", value)} placeholder="food-land" />
              </Field>
              <Field label="Short description" hint="Short, public-facing description.">
                <TextInput value={String(values.shortDescription ?? "")} onChange={(value) => updateValue("shortDescription", value)} placeholder="Fresh seafood and local dining" />
              </Field>
              <Field label="Category" hint="The engine is currently wired for restaurant onboarding.">
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={String(values.businessType ?? businessType)}
                  onChange={(event) => updateValue("businessType", event.target.value)}
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="guesthouse">Guesthouse</option>
                  <option value="experience">Experience</option>
                  <option value="transfer">Transfer</option>
                </select>
              </Field>
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
                  <p className="text-sm font-semibold text-slate-800">Restaurant module</p>
                  <p className="text-sm text-slate-600">Cuisine: {String(values.cuisine ?? "—")}</p>
                  <p className="text-sm text-slate-600">Price range: {String(values.priceRange ?? "—")}</p>
                </div>
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
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </Field>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={Boolean(values.featured)} onChange={(event) => updateValue("featured", event.target.checked)} />
                <span>Featured listing</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={Boolean(values.showOriginalMenu)} onChange={(event) => updateValue("showOriginalMenu", event.target.checked)} />
                <span>Show original source menu publicly</span>
              </label>
            </div>
          </StepShell>
        );
      case "guesthouse-module":
        return (
          <StepShell title="Guesthouse module" description="A placeholder module for future guesthouse onboarding expansion.">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              Room types, occupancy, facilities, and checkout policies will plug into this step next.
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
      {statusMessage ? <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">{statusMessage}</div> : null}

      {renderStepContent()}

      <div className="sticky bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            Step {stepIndex + 1} of {steps.length}: {currentStep.label}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" onClick={handlePrevious} disabled={stepIndex === 0}>
              Back
            </button>
            <button type="button" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" onClick={() => handleSave()}>
              Save draft
            </button>
            {currentStep.id === "publish" ? (
              <button type="button" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? "Publishing..." : "Publish"}
              </button>
            ) : (
              <button type="button" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={handleNext}>
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
