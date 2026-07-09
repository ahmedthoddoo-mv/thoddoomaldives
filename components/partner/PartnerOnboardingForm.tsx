"use client";

import { useMemo, useState } from "react";
import type {
  PartnerOnboardingApplication,
  PartnerOnboardingFieldName
} from "@/types/partner-onboarding";
import type { PartnerCategoryDefinition } from "@/types/partner";

type PartnerOnboardingFormProps = {
  categories: PartnerCategoryDefinition[];
};

const initialApplication: PartnerOnboardingApplication = {
  businessName: "",
  businessType: "guesthouse",
  contactPerson: "",
  whatsappNumber: "",
  email: "",
  island: "Thoddoo",
  address: "",
  shortDescription: "",
  servicesOffered: "",
  serviceCount: "",
  priceRange: "",
  websiteOrSocial: "",
  photoNotes: "",
  membershipInterest: "verified",
  notes: ""
};

const membershipOptions = [
  { value: "free", label: "Free" },
  { value: "verified", label: "Verified" },
  { value: "premium", label: "Premium" }
] as const;

const whatsappRecipient = "9607000000";

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildWhatsAppMessage(application: PartnerOnboardingApplication) {
  return [
    "New Partner Application - iThoddoo Maldives",
    "",
    `Business name: ${application.businessName}`,
    `Business type: ${formatLabel(application.businessType)}`,
    `Contact person: ${application.contactPerson}`,
    `WhatsApp: ${application.whatsappNumber}`,
    `Email: ${application.email}`,
    `Island: ${application.island}`,
    `Location/address: ${application.address}`,
    "",
    `Short description: ${application.shortDescription}`,
    `Services offered: ${application.servicesOffered}`,
    `Rooms/items/services count: ${application.serviceCount}`,
    `Price range: ${application.priceRange}`,
    `Website/social: ${application.websiteOrSocial || "Not provided"}`,
    `Photo upload notes: ${application.photoNotes || "Photos to be shared after review"}`,
    `Membership interest: ${formatLabel(application.membershipInterest)}`,
    "",
    `Notes/special requests: ${application.notes || "None"}`
  ].join("\n");
}

function FieldLabel({
  children,
  htmlFor,
  required = false
}: {
  children: React.ReactNode;
  htmlFor: string;
  required?: boolean;
}) {
  return (
    <label className="onboardingLabel" htmlFor={htmlFor}>
      {children}
      {required ? <span>Required</span> : null}
    </label>
  );
}

export function PartnerOnboardingForm({ categories }: PartnerOnboardingFormProps) {
  const [application, setApplication] = useState<PartnerOnboardingApplication>(initialApplication);
  const [isReviewing, setIsReviewing] = useState(false);

  const whatsappMessage = useMemo(() => buildWhatsAppMessage(application), [application]);
  const whatsappUrl = useMemo(
    () => `https://wa.me/${whatsappRecipient}?text=${encodeURIComponent(whatsappMessage)}`,
    [whatsappMessage]
  );

  function updateField(field: PartnerOnboardingFieldName, value: string) {
    setApplication((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsReviewing(true);
  }

  if (isReviewing) {
    const summaryRows: Array<[string, string]> = [
      ["Business name", application.businessName],
      ["Business type", formatLabel(application.businessType)],
      ["Contact person", application.contactPerson],
      ["WhatsApp", application.whatsappNumber],
      ["Email", application.email],
      ["Island", application.island],
      ["Location/address", application.address],
      ["Short description", application.shortDescription],
      ["Services offered", application.servicesOffered],
      ["Rooms/items/services", application.serviceCount],
      ["Price range", application.priceRange],
      ["Website/social", application.websiteOrSocial || "Not provided"],
      ["Photos", application.photoNotes || "Photos to be shared after review"],
      ["Membership interest", formatLabel(application.membershipInterest)],
      ["Notes", application.notes || "None"]
    ];

    return (
      <section className="onboardingReview" aria-live="polite">
        <div className="sectionHeader">
          <p className="eyebrow">Review application</p>
          <h2>Check the details before sending</h2>
          <p>
            This first version does not save anything to a database. It prepares a formatted WhatsApp message for the
            iThoddoo Maldives team.
          </p>
        </div>

        <div className="reviewGrid">
          {summaryRows.map(([label, value]) => (
            <div className="reviewItem" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className="messagePreview">
          <h3>WhatsApp message</h3>
          <pre>{whatsappMessage}</pre>
        </div>

        <div className="onboardingActions">
          <button className="secondaryAction" type="button" onClick={() => setIsReviewing(false)}>
            Edit application
          </button>
          <a className="primaryButton" href={whatsappUrl} target="_blank" rel="noreferrer">
            Send Application via WhatsApp
          </a>
        </div>
      </section>
    );
  }

  return (
    <form className="onboardingForm" onSubmit={handleSubmit}>
      <div className="formSection">
        <div>
          <p className="eyebrow">Business profile</p>
          <h2>Tell us what you operate</h2>
        </div>
        <div className="formGrid">
          <div className="fieldGroup">
            <FieldLabel htmlFor="businessName" required>
              Business name
            </FieldLabel>
            <input
              id="businessName"
              required
              value={application.businessName}
              onChange={(event) => updateField("businessName", event.target.value)}
            />
          </div>

          <div className="fieldGroup">
            <FieldLabel htmlFor="businessType" required>
              Business type
            </FieldLabel>
            <select
              id="businessType"
              required
              value={application.businessType}
              onChange={(event) => updateField("businessType", event.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
              <option value="other">Other tourism business</option>
            </select>
          </div>

          <div className="fieldGroup">
            <FieldLabel htmlFor="contactPerson" required>
              Owner/contact person
            </FieldLabel>
            <input
              id="contactPerson"
              required
              value={application.contactPerson}
              onChange={(event) => updateField("contactPerson", event.target.value)}
            />
          </div>

          <div className="fieldGroup">
            <FieldLabel htmlFor="whatsappNumber" required>
              WhatsApp number
            </FieldLabel>
            <input
              id="whatsappNumber"
              required
              type="tel"
              placeholder="+960 ..."
              value={application.whatsappNumber}
              onChange={(event) => updateField("whatsappNumber", event.target.value)}
            />
          </div>

          <div className="fieldGroup">
            <FieldLabel htmlFor="email" required>
              Email
            </FieldLabel>
            <input
              id="email"
              required
              type="email"
              value={application.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>

          <div className="fieldGroup">
            <FieldLabel htmlFor="island" required>
              Island
            </FieldLabel>
            <input
              id="island"
              required
              value={application.island}
              onChange={(event) => updateField("island", event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="formSection">
        <div>
          <p className="eyebrow">Offer and location</p>
          <h2>Structure the details travelers need</h2>
        </div>
        <div className="formGrid">
          <div className="fieldGroup fieldWide">
            <FieldLabel htmlFor="address" required>
              Location/address
            </FieldLabel>
            <input
              id="address"
              required
              value={application.address}
              onChange={(event) => updateField("address", event.target.value)}
            />
          </div>

          <div className="fieldGroup fieldWide">
            <FieldLabel htmlFor="shortDescription" required>
              Short description
            </FieldLabel>
            <textarea
              id="shortDescription"
              required
              rows={4}
              value={application.shortDescription}
              onChange={(event) => updateField("shortDescription", event.target.value)}
            />
          </div>

          <div className="fieldGroup fieldWide">
            <FieldLabel htmlFor="servicesOffered" required>
              Services offered
            </FieldLabel>
            <textarea
              id="servicesOffered"
              required
              rows={4}
              placeholder="Rooms, transfers, dive trips, excursions, dining, spa services..."
              value={application.servicesOffered}
              onChange={(event) => updateField("servicesOffered", event.target.value)}
            />
          </div>

          <div className="fieldGroup">
            <FieldLabel htmlFor="serviceCount" required>
              Number of rooms/items/services
            </FieldLabel>
            <input
              id="serviceCount"
              required
              inputMode="numeric"
              value={application.serviceCount}
              onChange={(event) => updateField("serviceCount", event.target.value)}
            />
          </div>

          <div className="fieldGroup">
            <FieldLabel htmlFor="priceRange" required>
              Price range
            </FieldLabel>
            <input
              id="priceRange"
              required
              placeholder="Example: $80-$140 per night"
              value={application.priceRange}
              onChange={(event) => updateField("priceRange", event.target.value)}
            />
          </div>

          <div className="fieldGroup fieldWide">
            <FieldLabel htmlFor="websiteOrSocial">Website/social links</FieldLabel>
            <input
              id="websiteOrSocial"
              placeholder="Website, Instagram, Facebook, Google Maps..."
              value={application.websiteOrSocial}
              onChange={(event) => updateField("websiteOrSocial", event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="formSection">
        <div>
          <p className="eyebrow">Growth setup</p>
          <h2>Choose the starting membership path</h2>
        </div>
        <div className="formGrid">
          <div className="fieldGroup fieldWide">
            <FieldLabel htmlFor="photoNotes">Upload photos placeholder</FieldLabel>
            <textarea
              id="photoNotes"
              rows={3}
              placeholder="No upload yet. Tell us how many photos you can share or what media support you need."
              value={application.photoNotes}
              onChange={(event) => updateField("photoNotes", event.target.value)}
            />
          </div>

          <fieldset className="membershipFieldset">
            <legend>Membership interest</legend>
            <div className="membershipChoiceGrid">
              {membershipOptions.map((option) => (
                <label className="membershipChoice" key={option.value}>
                  <input
                    type="radio"
                    name="membershipInterest"
                    value={option.value}
                    checked={application.membershipInterest === option.value}
                    onChange={(event) => updateField("membershipInterest", event.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="fieldGroup fieldWide">
            <FieldLabel htmlFor="notes">Notes/special requests</FieldLabel>
            <textarea
              id="notes"
              rows={4}
              value={application.notes}
              onChange={(event) => updateField("notes", event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="onboardingActions">
        <a className="secondaryAction" href="/partners">
          Back to partner program
        </a>
        <button className="primaryButton" type="submit">
          Review application
        </button>
      </div>
    </form>
  );
}
