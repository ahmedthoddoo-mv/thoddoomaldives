"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { submitSmartPartnerApplication } from "@/app/partners/onboarding/actions";
import { PricingEditor, createPricingRow } from "@/components/partner/PricingEditor";
import { membershipPlans } from "@/data/membershipPlans";
import { PartnerApplicationRepository } from "@/lib/applications/partnerApplicationRepository";
import { platformConfig } from "@/lib/config/platform";
import {
  businessTypeOptions,
  getBusinessTypeSchema,
  getCategoryAnswerReviewRows,
  validateCategoryAnswers,
  validatePricingRows
} from "@/lib/partner-onboarding/onboardingSchemas";
import { getBusinessTypeSchemaKind, normalizeBusinessType } from "@/types/business-type";
import type {
  PartnerApplicationMediaInput,
  SmartBusinessType,
  SmartPartnerApplicationInput
} from "@/types/partner-smart-onboarding";
import {
  createVerificationDocuments,
  getVerificationCompletion,
  getVerificationRequirements
} from "@/types/verification-documents";
import type { PartnerVerificationDocumentInput } from "@/types/verification-documents";

const draftKey = "ithoddoo.smart-partner-onboarding.v1";

const steps = ["Business type", "Business profile", "Services and pricing", "Media", "Documents", "Membership", "Review", "Submit"];

function createInitialMedia(): PartnerApplicationMediaInput[] {
  return [
    { id: "logo", mediaType: "logo", label: "Logo", pathOrNote: "", fileName: "" },
    { id: "cover", mediaType: "cover", label: "Cover image", pathOrNote: "", fileName: "" },
    { id: "gallery", mediaType: "gallery", label: "Gallery images", pathOrNote: "", fileName: "" },
    { id: "menu", mediaType: "menu", label: "Menu", pathOrNote: "", fileName: "" },
    { id: "price-list", mediaType: "price_list", label: "Price list", pathOrNote: "", fileName: "" },
    { id: "schedule", mediaType: "schedule", label: "Schedule document", pathOrNote: "", fileName: "" },
    { id: "license", mediaType: "license", label: "License document", pathOrNote: "", fileName: "" }
  ];
}

function createInitialApplication(): SmartPartnerApplicationInput {
  const schema = getBusinessTypeSchema("guesthouse");

  return {
    businessType: "guesthouse",
    businessName: "",
    contactPerson: "",
    whatsapp: "",
    email: "",
    island: "Thoddoo",
    address: "",
    googleMapsLink: "",
    website: "",
    instagram: "",
    facebook: "",
    shortDescription: "",
    fullDescription: "",
    registrationNumber: "",
    membershipPlan: "verified",
    notes: "",
    categoryAnswers: {},
    prices: [createPricingRow({ unit: schema.pricing.defaultUnit })],
    media: createInitialMedia(),
    verificationDocuments: createVerificationDocuments("guesthouse"),
    antiSpamAnswer: ""
  };
}

function getCategoryKey(type: SmartBusinessType) {
  const schemaKind = getBusinessTypeSchemaKind(type);
  if (schemaKind === "accommodation") return "accommodation";
  if (schemaKind === "dining") return "dining";
  if (schemaKind === "activity-service") return "activity";
  if (schemaKind === "transfer") return "transfer";
  if (schemaKind === "shop") return "shop";
  if (schemaKind === "wellness") return "wellness";
  return "other";
}

function formatValue(value: string | boolean) {
  return typeof value === "boolean" ? (value ? "Yes" : "No") : value || "Not provided";
}

function getVisibleMedia(application: SmartPartnerApplicationInput) {
  const commonIds = ["logo", "cover", "gallery"];
  const categoryIds: Record<string, string[]> = {
    accommodation: ["price-list"],
    activity: ["price-list", "license"],
    dining: ["menu"],
    transfer: ["schedule", "price-list"],
    shop: ["price-list"],
    photographer: [],
    wellness: ["price-list", "license"],
    farm: ["price-list"],
    guide: ["price-list"],
    other: ["price-list"]
  };
  const categoryKey = getCategoryKey(application.businessType);
  const visibleIds = new Set([...commonIds, ...(categoryIds[categoryKey] ?? [])]);

  return application.media.filter((media) => visibleIds.has(media.id));
}

function mergeVerificationDocuments(type: SmartBusinessType, savedDocuments: PartnerVerificationDocumentInput[] = []) {
  return createVerificationDocuments(type).map((document) => {
    const savedDocument = savedDocuments.find((item) => item.key === document.key);
    return savedDocument ? { ...document, ...savedDocument } : document;
  });
}

function buildMockApplication(input: SmartPartnerApplicationInput) {
  const businessType = normalizeBusinessType(input.businessType);

  return {
    businessName: input.businessName,
    businessType,
    contactPerson: input.contactPerson,
    whatsappNumber: input.whatsapp,
    email: input.email,
    island: input.island,
    address: input.address,
    shortDescription: input.shortDescription,
    servicesOffered: input.prices.map((price) => `${price.itemName} ${price.currency} ${price.price}`).join(", "),
    serviceCount: String(input.prices.length),
    priceRange: input.prices.map((price) => `${price.currency} ${price.price}`).filter(Boolean).join(", "),
    websiteOrSocial: [input.website, input.instagram, input.facebook].filter(Boolean).join(" · "),
    photoNotes: input.media.map((media) => `${media.label}: ${media.pathOrNote || media.fileName}`).filter(Boolean).join("\n"),
    membershipInterest: input.membershipPlan,
    rooms: String(input.categoryAnswers.roomCount ?? ""),
    checkInOut: [input.categoryAnswers.checkInTime, input.categoryAnswers.checkOutTime].filter(Boolean).join(" / "),
    amenities: String(input.categoryAnswers.amenities ?? ""),
    cuisine: String(input.categoryAnswers.cuisine ?? ""),
    openingHours: String(input.categoryAnswers.openingHours ?? ""),
    menuNotes: String(input.categoryAnswers.menuUpload ?? input.categoryAnswers.menuItems ?? ""),
    boatName: "",
    capacity: String(input.categoryAnswers.vesselCapacity ?? input.categoryAnswers.maxGuests ?? input.categoryAnswers.roomCapacity ?? ""),
    departureTimes: String(input.categoryAnswers.schedule ?? ""),
    airportTransferSupport: String(input.categoryAnswers.airportRep ?? input.categoryAnswers.airportTransfer ?? ""),
    activityType: String(input.categoryAnswers.activityName ?? input.categoryAnswers.activities ?? input.categoryAnswers.tourTypes ?? ""),
    duration: String(input.categoryAnswers.duration ?? ""),
    includedItems: String(input.categoryAnswers.includedItems ?? input.categoryAnswers.equipment ?? input.categoryAnswers.safetyInformation ?? ""),
    notes: input.notes
  };
}

export function PartnerOnboardingForm() {
  const [application, setApplication] = useState<SmartPartnerApplicationInput>(() => createInitialApplication());
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [reference, setReference] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState("");
  const [isPending, startTransition] = useTransition();
  const schema = getBusinessTypeSchema(application.businessType);
  const schemaKind = getBusinessTypeSchemaKind(application.businessType);
  const fields = schema.fields;

  useEffect(() => {
    let restoreTimer: number | undefined;
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) {
        const savedApplication = JSON.parse(raw) as Partial<SmartPartnerApplicationInput>;
        const nextBusinessType = normalizeBusinessType(savedApplication.businessType ?? "guesthouse");
        restoreTimer = window.setTimeout(() => {
          setApplication({
            ...createInitialApplication(),
            ...savedApplication,
            businessType: nextBusinessType,
            categoryAnswers:
              nextBusinessType === normalizeBusinessType(savedApplication.businessType)
                ? savedApplication.categoryAnswers ?? {}
                : {},
            verificationDocuments: mergeVerificationDocuments(
              nextBusinessType,
              savedApplication.verificationDocuments
            )
          });
        }, 0);
      }
    } catch {
      // Draft restore is best-effort only.
    }
    return () => {
      if (restoreTimer !== undefined) window.clearTimeout(restoreTimer);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(draftKey, JSON.stringify(application));
  }, [application]);

  function updateApplication(updates: Partial<SmartPartnerApplicationInput>) {
    setApplication((current) => ({ ...current, ...updates }));
  }

  function updateCategoryAnswer(key: string, value: string | boolean) {
    setApplication((current) => ({
      ...current,
      categoryAnswers: {
        ...current.categoryAnswers,
        [key]: value
      }
    }));
  }

  function changeBusinessType(type: SmartBusinessType) {
    const nextBusinessType = normalizeBusinessType(type);
    const nextSchema = getBusinessTypeSchema(nextBusinessType);
    setApplication((current) => ({
      ...current,
      businessType: nextBusinessType,
      categoryAnswers: {},
      prices: [createPricingRow({ unit: nextSchema.pricing.defaultUnit })],
      verificationDocuments: mergeVerificationDocuments(nextBusinessType)
    }));
  }

  function validateStep(step: number) {
    const nextErrors: string[] = [];
    if (step >= 1) {
      if (!application.businessName.trim()) nextErrors.push("Business name is required.");
      if (!application.contactPerson.trim()) nextErrors.push("Owner/contact person is required.");
      if (application.whatsapp.replace(/\D/g, "").length < 7) nextErrors.push("A valid WhatsApp number is required.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(application.email.trim())) nextErrors.push("A valid email is required.");
      if (!application.shortDescription.trim()) nextErrors.push("Short business description is required.");
      if (!application.fullDescription.trim()) nextErrors.push("Full business description is required.");
    }
    if (step >= 2) {
      nextErrors.push(...validateCategoryAnswers(application.businessType, application.categoryAnswers));
      nextErrors.push(...validatePricingRows(application.businessType, application.prices));
    }
    if (step === 4 || step >= 6) {
      const missingDocuments = getVerificationRequirements(application.businessType)
        .filter((requirement) => requirement.required)
        .filter((requirement) => {
          const document = application.verificationDocuments.find((item) => item.key === requirement.key);
          return !document || (!document.fileName.trim() && !document.storagePathOrNote.trim());
        });

      if (missingDocuments.length > 0) {
        nextErrors.push(`Required verification documents missing: ${missingDocuments.map((document) => document.label).join(", ")}.`);
      }
    }
    if (step >= 5 && application.antiSpamAnswer.trim() !== "8") {
      nextErrors.push("Anti-spam answer is required before review.");
    }
    setErrors(nextErrors);
    return nextErrors.length === 0;
  }

  function getStepClass(index: number) {
    if (index < currentStep) return "onboardingStep onboardingStepComplete";
    if (index === currentStep) return "onboardingStep onboardingStepActive";
    return "onboardingStep";
  }

  function updateVerificationDocument(key: string, updates: Partial<PartnerVerificationDocumentInput>) {
    updateApplication({
      verificationDocuments: application.verificationDocuments.map((document) =>
        document.key === key ? { ...document, ...updates } : document
      )
    });
  }

  function chooseDocumentFile(document: PartnerVerificationDocumentInput, fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    updateVerificationDocument(document.key, {
      fileName: file.name,
      storagePathOrNote: `Pending browser upload: ${file.name}`,
      status: "submitted"
    });
  }

  function removeDocumentFile(document: PartnerVerificationDocumentInput) {
    updateVerificationDocument(document.key, {
      fileName: "",
      storagePathOrNote: "",
      status: "missing"
    });
  }

  function goNext() {
    if (validateStep(currentStep)) setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function submitApplication() {
    if (!validateStep(6)) return;
    setErrors([]);
    startTransition(async () => {
      const result = await submitSmartPartnerApplication(application);
      if (result.mode === "mock" && process.env.NEXT_PUBLIC_DATA_MODE === "mock") {
        const saved = PartnerApplicationRepository.createFromOnboarding(buildMockApplication(application) as never);
        setReference(saved.id);
        setWhatsappUrl(`https://wa.me/${platformConfig.whatsappNumbers.partnerships.replace(/\D/g, "")}`);
        setCurrentStep(7);
        return;
      }
      if (result.mode === "mock") {
        setErrors(["Supabase mode is active, but the submission did not reach Supabase. Please check deployment data mode configuration."]);
        return;
      }
      if (!result.ok) {
        setErrors(result.errors ?? [result.message]);
        return;
      }
      setReference(result.reference ?? "");
      setWhatsappUrl(result.whatsappUrl ?? "");
      setDuplicateWarning(result.duplicateWarning ?? "");
      window.localStorage.removeItem(draftKey);
      setCurrentStep(7);
    });
  }

  const reviewRows = [
      ["Business type", schema.label],
      ["Business name", application.businessName],
      ["Owner/contact", application.contactPerson],
      ["WhatsApp", application.whatsapp],
      ["Email", application.email],
      ["Island", application.island],
      ["Address", application.address],
      ["Membership", application.membershipPlan],
      ["Short description", application.shortDescription],
      ["Full description", application.fullDescription],
      ...getCategoryAnswerReviewRows(application.businessType, application.categoryAnswers).map(([label, value]) => [label, formatValue(value)]),
      ["Pricing rows", String(application.prices.length)],
      ["Media metadata", getVisibleMedia(application).filter((media) => media.pathOrNote || media.fileName).map((media) => media.label).join(", ") || "None yet"],
      ["Verification completion", `${getVerificationCompletion(application.verificationDocuments)}%`],
      [
        "Verification documents",
        application.verificationDocuments
          .filter((document) => document.fileName || document.storagePathOrNote)
          .map((document) => document.label)
          .join(", ") || "None yet"
      ]
    ];

  return (
    <section className="smartOnboarding">
      <ol className="onboardingSteps" aria-label="Partner application progress">
        {steps.map((step, index) => (
          <li className={getStepClass(index)} key={step}>
            <span>{index < currentStep ? "✓" : index + 1}</span>
            {step}
          </li>
        ))}
      </ol>

      {errors.length > 0 ? (
        <div className="bookingValidationPanel" role="alert">
          <strong>Please fix these details</strong>
          <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      ) : null}

      {process.env.NODE_ENV !== "production" ? (
        <div className="onboardingSchemaIndicator">
          Selected type: {schema.label} · Schema: {schemaKind}
        </div>
      ) : null}

      {currentStep === 0 ? (
        <div className="onboardingCard">
          <div className="sectionHeader">
            <p className="eyebrow">Step 1</p>
            <h2>Choose business type</h2>
            <p>The form will only show questions relevant to the selected category.</p>
          </div>
          <div className="businessTypeGrid">
            {businessTypeOptions.map((type) => (
              <button className={application.businessType === type.id ? "businessTypeCard businessTypeCardActive" : "businessTypeCard"} key={type.id} onClick={() => changeBusinessType(type.id)} type="button">
                <strong>{type.label}</strong>
                <span>{type.description}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {currentStep === 1 ? (
        <div className="onboardingCard">
          <div className="sectionHeader">
            <p className="eyebrow">Step 2</p>
            <h2>Business profile</h2>
          </div>
          <div className="onboardingGrid">
            <label><span>Business name</span><input value={application.businessName} onChange={(event) => updateApplication({ businessName: event.target.value })} /></label>
            <label><span>Owner/contact person</span><input value={application.contactPerson} onChange={(event) => updateApplication({ contactPerson: event.target.value })} /></label>
            <label><span>WhatsApp</span><input value={application.whatsapp} onChange={(event) => updateApplication({ whatsapp: event.target.value })} placeholder="+960 914 2538" /></label>
            <label><span>Email</span><input type="email" value={application.email} onChange={(event) => updateApplication({ email: event.target.value })} /></label>
            <label><span>Island</span><input value={application.island} onChange={(event) => updateApplication({ island: event.target.value })} /></label>
            <label><span>Address</span><input value={application.address} onChange={(event) => updateApplication({ address: event.target.value })} /></label>
            <label><span>Google Maps link</span><input value={application.googleMapsLink} onChange={(event) => updateApplication({ googleMapsLink: event.target.value })} /></label>
            <label><span>Website</span><input value={application.website} onChange={(event) => updateApplication({ website: event.target.value })} /></label>
            <label><span>Instagram</span><input value={application.instagram} onChange={(event) => updateApplication({ instagram: event.target.value })} /></label>
            <label><span>Facebook</span><input value={application.facebook} onChange={(event) => updateApplication({ facebook: event.target.value })} /></label>
            <label><span>Registration/license number</span><input value={application.registrationNumber} onChange={(event) => updateApplication({ registrationNumber: event.target.value })} /></label>
            <label className="onboardingWide"><span>Short business description</span><textarea value={application.shortDescription} onChange={(event) => updateApplication({ shortDescription: event.target.value })} /></label>
            <label className="onboardingWide"><span>Full business description</span><textarea value={application.fullDescription} onChange={(event) => updateApplication({ fullDescription: event.target.value })} placeholder="Tell visitors what makes this business useful, trustworthy, and worth booking." /></label>
          </div>
        </div>
      ) : null}

      {currentStep === 2 ? (
        <div className="onboardingCard">
          <div className="sectionHeader">
            <p className="eyebrow">Step 3</p>
            <h2>{schema.sectionTitle}</h2>
            <p>{schema.sectionDescription}</p>
          </div>
          <div className="onboardingGrid">
            {fields.map((field) => (
              <label className={field.type === "textarea" ? "onboardingWide" : ""} key={field.key}>
                <span>{field.label}</span>
                {field.type === "checkbox" ? (
                  <input checked={Boolean(application.categoryAnswers[field.key])} onChange={(event) => updateCategoryAnswer(field.key, event.target.checked)} type="checkbox" />
                ) : field.type === "textarea" ? (
                  <textarea value={String(application.categoryAnswers[field.key] ?? "")} onChange={(event) => updateCategoryAnswer(field.key, event.target.value)} placeholder={field.placeholder} />
                ) : (
                  <input value={String(application.categoryAnswers[field.key] ?? "")} onChange={(event) => updateCategoryAnswer(field.key, event.target.value)} placeholder={field.placeholder} />
                )}
                {field.help ? <small>{field.help}</small> : null}
              </label>
            ))}
          </div>
          <PricingEditor rows={application.prices} onChange={(prices) => updateApplication({ prices })} copy={schema.pricing} />
        </div>
      ) : null}

      {currentStep === 3 ? (
        <div className="onboardingCard">
          <div className="sectionHeader">
            <p className="eyebrow">Step 4</p>
            <h2>Media metadata</h2>
            <p>Real upload is not enabled yet. Add links, existing file paths, or notes. This saves metadata only.</p>
          </div>
          <div className="onboardingGrid">
            {getVisibleMedia(application).map((media) => (
              <label key={media.id}>
                <span>{media.label}</span>
                <input value={media.pathOrNote} onChange={(event) => updateApplication({ media: application.media.map((item) => item.id === media.id ? { ...item, pathOrNote: event.target.value } : item) })} placeholder="Path, public link, or note" />
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {currentStep === 4 ? (
        <div className="onboardingCard">
          <div className="verificationChecklistPanel">
            <div className="sectionHeader">
              <p className="eyebrow">Step 5</p>
              <h2>Documents and verification</h2>
              <p>
                Verification documents are stored as private records for admin review. Use a private storage path,
                secure link, or file name placeholder until direct upload is connected.
              </p>
            </div>
            <div className="verificationCompletionBar" aria-label="Verification document completion">
              <span style={{ width: `${getVerificationCompletion(application.verificationDocuments)}%` }} />
            </div>
            <p className="mutedText">{getVerificationCompletion(application.verificationDocuments)}% complete</p>
            <div className="verificationDocumentGrid">
              {application.verificationDocuments.map((document) => (
                <div className="verificationDocumentCard" key={document.key}>
                  <div className="verificationDocumentHeader">
                    <div>
                      <strong>{document.label}</strong>
                      <span>{document.required ? "Required" : "Optional / where applicable"}</span>
                    </div>
                    <span className={document.fileName || document.storagePathOrNote ? "uploadStatus uploadStatusReady" : "uploadStatus"}>
                      {document.fileName || document.storagePathOrNote ? "Uploaded" : "Missing"}
                    </span>
                  </div>
                  <label className="documentDropzone">
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(event) => chooseDocumentFile(document, event.target.files)}
                      type="file"
                    />
                    <strong>{document.fileName ? "Replace file" : "Choose File"}</strong>
                    <span>Drag & Drop or choose PDF, JPG, PNG, or WEBP</span>
                  </label>
                  <div className="uploadProgressShell" aria-label={`${document.label} upload progress placeholder`}>
                    <span style={{ width: document.fileName || document.storagePathOrNote ? "100%" : "0%" }} />
                  </div>
                  <div className="uploadedFileMeta">
                    <span>Uploaded filename</span>
                    <strong>{document.fileName || "No file selected"}</strong>
                  </div>
                  <label>
                    Private storage path or note
                    <input
                      value={document.storagePathOrNote}
                      onChange={(event) =>
                        updateVerificationDocument(document.key, {
                          storagePathOrNote: event.target.value,
                          status: event.target.value || document.fileName ? "submitted" : "missing"
                        })
                      }
                      placeholder="partner-verification-documents/business/license.pdf"
                    />
                  </label>
                  <div className="documentUploadActions">
                    <label>
                      Replace
                      <input
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(event) => chooseDocumentFile(document, event.target.files)}
                        type="file"
                      />
                    </label>
                    <button type="button" onClick={() => removeDocumentFile(document)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {currentStep === 5 ? (
        <div className="onboardingCard">
          <div className="sectionHeader">
            <p className="eyebrow">Step 6</p>
            <h2>Membership</h2>
          </div>
          <div className="membershipCardGrid">
            {membershipPlans.map((plan) => (
              <label className={application.membershipPlan === plan.tier ? "membershipChoice membershipChoiceActive" : "membershipChoice"} key={plan.tier}>
                <input checked={application.membershipPlan === plan.tier} onChange={() => updateApplication({ membershipPlan: plan.tier })} type="radio" />
                <strong>{plan.name}</strong>
                <span>{plan.description}</span>
              </label>
            ))}
          </div>
          <label className="onboardingWide onboardingSoloField">
            <span>Notes</span>
            <textarea value={application.notes} onChange={(event) => updateApplication({ notes: event.target.value })} />
          </label>
          <label className="onboardingSoloField">
            <span>Anti-spam: what is 3 + 5?</span>
            <input value={application.antiSpamAnswer} onChange={(event) => updateApplication({ antiSpamAnswer: event.target.value })} />
          </label>
        </div>
      ) : null}

      {currentStep === 6 ? (
        <div className="onboardingCard">
          <div className="sectionHeader">
            <p className="eyebrow">Step 7</p>
            <h2>Review before submit</h2>
          </div>
          <div className="reviewGrid">
            {reviewRows.map(([label, value]) => (
              <div className="reviewItem" key={label}>
                <span>{label}</span>
                <strong>{value || "Not provided"}</strong>
              </div>
            ))}
          </div>
          <button className="adminContentAddButton adminContentSecondaryButton" type="button" onClick={() => window.print()}>
            Print summary
          </button>
        </div>
      ) : null}

      {currentStep === 7 ? (
        <div className="onboardingCard">
          <div className="sectionHeader">
            <p className="eyebrow">Submitted</p>
            <h2>Application submitted successfully</h2>
            <p>{reference ? `Reference: ${reference}` : "Your application has been saved."}</p>
            {duplicateWarning ? <p className="mutedText">{duplicateWarning}</p> : null}
          </div>
          <div className="onboardingActions">
            {whatsappUrl ? (
              <a className="adminContentAddButton" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                Continue to WhatsApp
              </a>
            ) : null}
            <Link className="adminContentAddButton adminContentSecondaryButton" href="/partners">
              Back to partner program
            </Link>
          </div>
        </div>
      ) : null}

      {currentStep < 7 ? (
        <div className="onboardingActions">
          <button disabled={currentStep === 0} type="button" onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}>Previous</button>
          {currentStep < 6 ? (
            <button type="button" onClick={goNext}>Next</button>
          ) : (
            <button disabled={isPending} type="button" onClick={submitApplication}>{isPending ? "Submitting..." : "Submit application"}</button>
          )}
          <a href={`https://wa.me/${platformConfig.whatsappNumbers.partnerships.replace(/\D/g, "")}?text=${encodeURIComponent("Hi, I need help with the iThoddoo Growth Partner application.")}`} target="_blank" rel="noopener noreferrer">
            Need help?
          </a>
        </div>
      ) : null}
    </section>
  );
}
