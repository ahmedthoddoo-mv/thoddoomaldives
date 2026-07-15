import type { SmartBusinessType } from "@/types/partner-smart-onboarding";

export type VerificationDocumentKey =
  | "tourism_operating_license"
  | "business_registration"
  | "gst_registration"
  | "green_tax_registration"
  | "owner_id"
  | "operating_permit"
  | "insurance"
  | "food_license"
  | "vessel_registration"
  | "captain_license";

export type VerificationDocumentStatus = "missing" | "submitted" | "approved" | "rejected" | "more_required";

export type VerificationDocumentRequirement = {
  key: VerificationDocumentKey;
  label: string;
  required: boolean;
  description: string;
};

export type PartnerVerificationDocumentInput = {
  key: VerificationDocumentKey;
  label: string;
  required: boolean;
  fileName: string;
  storagePathOrNote: string;
  status: VerificationDocumentStatus;
};

const commonBusinessRegistration: VerificationDocumentRequirement = {
  key: "business_registration",
  label: "Business Registration",
  required: true,
  description: "Official business registration document."
};

const ownerId: VerificationDocumentRequirement = {
  key: "owner_id",
  label: "Owner ID",
  required: true,
  description: "Owner identity document for internal verification."
};

export function getVerificationRequirements(type: SmartBusinessType): VerificationDocumentRequirement[] {
  if (type === "guesthouse" || type === "hotel") {
    return [
      {
        key: "tourism_operating_license",
        label: "Ministry of Tourism Operating License",
        required: true,
        description: "Required for accommodation partners before publication."
      },
      commonBusinessRegistration,
      {
        key: "gst_registration",
        label: "GST Registration",
        required: true,
        description: "GST registration document."
      },
      {
        key: "green_tax_registration",
        label: "Green Tax Registration",
        required: false,
        description: "Required where applicable for the business."
      },
      ownerId
    ];
  }

  if (type === "watersports" || type === "excursion-operator" || type === "dive-center") {
    return [
      commonBusinessRegistration,
      {
        key: "operating_permit",
        label: "Relevant Operating Permits/Licenses",
        required: true,
        description: "Tour, watersports, dive, or activity operating permit."
      },
      {
        key: "insurance",
        label: "Insurance",
        required: false,
        description: "Optional insurance document."
      },
      ownerId
    ];
  }

  if (type === "restaurant" || type === "cafe") {
    return [
      commonBusinessRegistration,
      {
        key: "food_license",
        label: "Food-related License",
        required: false,
        description: "Food safety or restaurant license where applicable."
      },
      ownerId
    ];
  }

  if (type === "speedboat-company" || type === "ferry-operator" || type === "transfer-company") {
    return [
      commonBusinessRegistration,
      {
        key: "vessel_registration",
        label: "Vessel Registration",
        required: true,
        description: "Registration document for the vessel used in transfers."
      },
      {
        key: "captain_license",
        label: "Captain/Skipper License",
        required: false,
        description: "Captain or skipper license where applicable."
      },
      {
        key: "insurance",
        label: "Insurance",
        required: false,
        description: "Optional vessel or operator insurance."
      },
      ownerId
    ];
  }

  return [commonBusinessRegistration, ownerId];
}

export function createVerificationDocuments(type: SmartBusinessType): PartnerVerificationDocumentInput[] {
  return getVerificationRequirements(type).map((requirement) => ({
    key: requirement.key,
    label: requirement.label,
    required: requirement.required,
    fileName: "",
    storagePathOrNote: "",
    status: "missing"
  }));
}

export function getVerificationCompletion(documents: PartnerVerificationDocumentInput[]) {
  const requiredDocuments = documents.filter((document) => document.required);
  if (requiredDocuments.length === 0) return 100;
  const submitted = requiredDocuments.filter((document) => document.fileName.trim() || document.storagePathOrNote.trim());
  return Math.round((submitted.length / requiredDocuments.length) * 100);
}
