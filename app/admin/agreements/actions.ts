"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  buildAgreementFullText,
  collectAgreementSectionsFromFormData,
} from "@/lib/partner-platform/agreement-admin";
import {
  createAgreementDraft,
  publishAgreement,
  updateAgreementDraft,
} from "@/lib/partner-platform/agreement-services";

function normalizeAgreementSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getRequiredField(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== "string") {
    throw new Error(`${name} is required.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${name} is required.`);
  }
  return trimmed;
}

function revalidateAgreementRoutes(versionId: string) {
  revalidatePath("/admin/agreements");
  revalidatePath(`/admin/agreements/${versionId}`);
  revalidatePath(`/admin/agreements/${versionId}/edit`);
  revalidatePath(`/admin/agreements/${versionId}/preview`);
  revalidatePath(`/admin/agreements/${versionId}/publish`);
}

export async function createAgreementDraftAction(formData: FormData) {
  const title = getRequiredField(formData, "title");
  const agreementKey = getRequiredField(formData, "agreement_key");
  const summary = getRequiredField(formData, "summary");
  const sections = collectAgreementSectionsFromFormData(formData);
  const fullText = buildAgreementFullText(title, sections);

  const version = await createAgreementDraft(
    title,
    normalizeAgreementSlug(agreementKey),
    "markdown",
    fullText,
    sections,
    summary,
  );

  revalidateAgreementRoutes(version.id);
  redirect(`/admin/agreements/${version.id}`);
}

export async function updateAgreementDraftAction(versionId: string, formData: FormData) {
  const title = getRequiredField(formData, "title");
  const summary = getRequiredField(formData, "summary");
  const sections = collectAgreementSectionsFromFormData(formData);
  const fullText = buildAgreementFullText(title, sections);

  await updateAgreementDraft(versionId, {
    title,
    summary,
    sections,
    fullText,
  });

  revalidateAgreementRoutes(versionId);
  redirect(`/admin/agreements/${versionId}`);
}

export async function publishAgreementDraftAction(versionId: string, formData: FormData) {
  const confirmPublish = formData.get("confirm_publish") === "on";
  const confirmImmutable = formData.get("confirm_immutable") === "on";
  const confirmNoAutoAssign = formData.get("confirm_no_auto_assign") === "on";

  if (!confirmPublish || !confirmImmutable || !confirmNoAutoAssign) {
    throw new Error("All publish confirmations are required.");
  }

  await publishAgreement(versionId, new Date());
  revalidateAgreementRoutes(versionId);
  redirect(`/admin/agreements/${versionId}`);
}
