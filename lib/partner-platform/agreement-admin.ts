import { createSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { requireAdminSession } from '@/lib/admin/adminAuth';
import type { Json } from '@/lib/supabase/types';

export type AgreementSectionDefinition = {
  key: string;
  title: string;
  reviewTag?: 'owner' | 'legal';
};

export const AGREEMENT_SECTION_DEFINITIONS: AgreementSectionDefinition[] = [
  { key: 'parties_and_purpose', title: 'Parties and Agreement Purpose' },
  { key: 'definitions', title: 'Definitions' },
  { key: 'partner_eligibility', title: 'Partner Eligibility and Verification' },
  { key: 'partnership_relationship', title: 'Partnership Relationship' },
  { key: 'partner_responsibilities', title: 'Partner Responsibilities' },
  { key: 'ithoddoo_responsibilities', title: 'iThoddoo Maldives Responsibilities' },
  { key: 'business_information', title: 'Business Information and Listing Accuracy' },
  { key: 'rates_pricing_availability', title: 'Rates, Pricing and Availability' },
  { key: 'booking_enquiry_handling', title: 'Booking and Enquiry Handling' },
  { key: 'booking_commission', title: 'Booking Commission', reviewTag: 'owner' },
  { key: 'membership_plans_subscription_fees', title: 'Membership Plans and Subscription Fees' },
  { key: 'complimentary_membership_period', title: 'Complimentary Membership Period' },
  { key: 'billing_and_payment_terms', title: 'Billing and Payment Terms' },
  { key: 'failed_overdue_payments', title: 'Failed or Overdue Payments' },
  { key: 'cancellations_refunds_disputes', title: 'Cancellations, Refunds and Guest Disputes', reviewTag: 'legal' },
  { key: 'guest_communication', title: 'Guest Communication and Service Standards' },
  { key: 'promotions_discounts', title: 'Promotions, Discounts and Special Offers' },
  { key: 'content_rights', title: 'Photos, Videos, Logos and Other Content' },
  { key: 'intellectual_property', title: 'Intellectual Property and Brand Use' },
  { key: 'data_protection', title: 'Data Protection and Privacy' },
  { key: 'legal_regulatory', title: 'Legal and Regulatory Compliance', reviewTag: 'legal' },
  { key: 'account_security', title: 'Partner Account Security and Authorized Users' },
  { key: 'reviews_complaints', title: 'Reviews, Complaints and Quality Standards' },
  { key: 'suspension_unpublishing', title: 'Listing Suspension and Unpublishing' },
  { key: 'reactivation', title: 'Reactivation', reviewTag: 'owner' },
  { key: 'agreement_updates', title: 'Agreement Updates and Reacceptance' },
  { key: 'membership_changes', title: 'Membership Changes' },
  { key: 'termination_by_partner', title: 'Termination by Partner' },
  { key: 'termination_by_ithoddoo', title: 'Termination or Suspension by iThoddoo Maldives' },
  { key: 'outstanding_obligations', title: 'Outstanding Payments and Obligations' },
  { key: 'limitation_of_liability', title: 'Limitation of Liability', reviewTag: 'legal' },
  { key: 'indemnity', title: 'Indemnity / Responsibility for Partner Services', reviewTag: 'legal' },
  { key: 'force_majeure', title: 'Force Majeure' },
  { key: 'dispute_resolution', title: 'Dispute Resolution', reviewTag: 'legal' },
  { key: 'governing_law', title: 'Governing Law', reviewTag: 'legal' },
  { key: 'notices', title: 'Notices and Communications' },
  { key: 'electronic_agreement', title: 'Electronic Agreement and Digital Acceptance' },
  { key: 'entire_agreement', title: 'Entire Agreement' },
  { key: 'severability', title: 'Severability' },
  { key: 'contact_information', title: 'Contact Information' },
];

export type AgreementAdminSection = {
  key: string;
  title: string;
  body: string;
  reviewTag?: 'owner' | 'legal';
};

export type AgreementListRow = {
  id: string;
  title: string;
  slug: string;
  versionNumber: number;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  summary: string;
  sectionCount: number;
  assignmentCount: number;
  acceptanceCount: number;
  reacceptanceCount: number;
};

export type AgreementAuditEvent = {
  eventType: string;
  actorRole: string | null;
  actorAuthUserId: string | null;
  occurredAt: string;
  entityId: string | null;
  afterPayload: Json | null;
};

export type AgreementDetailRecord = {
  version: {
    id: string;
    version_number: number;
    title: string;
    slug: string;
    status: string;
    material_change: boolean;
    summary: string | null;
    effective_at: string | null;
    published_at: string | null;
    published_by_auth_user_id: string | null;
    created_at: string;
    updated_at: string;
    content_hash: string | null;
  };
  creatorAuthUserId: string | null;
  content: {
    id: string;
    agreement_version_id: string;
    content_type: string;
    summary: string;
    content_hash: string;
    sections: Record<string, string>;
    full_text: string;
  } | null;
  assignmentCount: number;
  acceptancesCount: number;
  reacceptanceCount: number;
  auditEvents: AgreementAuditEvent[];
};

export function getAgreementSectionValue(sections: Record<string, unknown> | null | undefined, key: string) {
  const value = sections?.[key];
  return typeof value === 'string' ? value : '';
}

export function collectAgreementSectionsFromFormData(formData: FormData) {
  return AGREEMENT_SECTION_DEFINITIONS.reduce<Record<string, string>>((acc, section) => {
    const value = formData.get(`section_${section.key}`);
    acc[section.key] = typeof value === 'string' ? value.trim() : '';
    return acc;
  }, {});
}

export function buildAgreementFullText(title: string, sections: Record<string, string>) {
  const body = AGREEMENT_SECTION_DEFINITIONS
    .map((section, index) => `## ${index + 1}. ${section.title}\n${sections[section.key] ?? ''}`.trim())
    .join('\n\n');

  return `# ${title}\n\n${body}\n`;
}

export function toAgreementPreviewSections(sections: Record<string, string> | null | undefined): AgreementAdminSection[] {
  return AGREEMENT_SECTION_DEFINITIONS.map((definition) => ({
    key: definition.key,
    title: definition.title,
    body: getAgreementSectionValue(sections, definition.key),
    reviewTag: definition.reviewTag,
  }));
}

function normalizeSummary(summary: string | null | undefined, contentSummary: string | null | undefined) {
  return (summary ?? contentSummary ?? '').trim();
}

function isServiceReady() {
  const client = createSupabaseServiceRoleClient();
  if (!client) {
    throw new Error('Supabase service client is not configured.');
  }
  return client;
}

export async function loadAgreementAdminList() {
  const { role } = await requireAdminSession();
  if (!['owner', 'admin'].includes(role)) {
    throw new Error('Agreement administration requires owner or admin access.');
  }

  const db = isServiceReady();

  const [versionsResult, contentResult, assignmentsResult, acceptancesResult, agreementsResult] = await Promise.all([
    db
      .from('agreement_versions')
      .select('id, version_number, title, slug, status, created_at, published_at, summary')
      .order('created_at', { ascending: false }),
    db
      .from('agreement_content')
      .select('agreement_version_id, summary, sections, content_hash'),
    db
      .from('agreement_requirement_assignments')
      .select('agreement_version_id, id'),
    db
      .from('agreement_acceptances')
      .select('agreement_version_id, id'),
    db
      .from('partner_agreements')
      .select('current_version_id, accepted_version_id, requires_reacceptance'),
  ]);

  for (const result of [versionsResult, contentResult, assignmentsResult, acceptancesResult, agreementsResult]) {
    if (result.error) {
      throw result.error;
    }
  }

  const contentMap = new Map(
    (contentResult.data ?? []).map((row) => [row.agreement_version_id, row])
  );
  const assignmentCounts = new Map<string, number>();
  const acceptanceCounts = new Map<string, number>();
  const reacceptanceCounts = new Map<string, number>();

  for (const row of assignmentsResult.data ?? []) {
    assignmentCounts.set(row.agreement_version_id, (assignmentCounts.get(row.agreement_version_id) ?? 0) + 1);
  }
  for (const row of acceptancesResult.data ?? []) {
    acceptanceCounts.set(row.agreement_version_id, (acceptanceCounts.get(row.agreement_version_id) ?? 0) + 1);
  }
  for (const row of agreementsResult.data ?? []) {
    if (row.requires_reacceptance && row.current_version_id) {
      reacceptanceCounts.set(row.current_version_id, (reacceptanceCounts.get(row.current_version_id) ?? 0) + 1);
    }
  }

  const rows: AgreementListRow[] = (versionsResult.data ?? []).map((version) => {
    const content = contentMap.get(version.id);
    const sections = content?.sections && typeof content.sections === 'object' ? (content.sections as Record<string, string>) : {};
    return {
      id: version.id,
      title: version.title,
      slug: version.slug,
      versionNumber: version.version_number,
      status: version.status,
      createdAt: version.created_at,
      publishedAt: version.published_at,
      summary: normalizeSummary(version.summary, content?.summary),
      sectionCount: Object.keys(sections).length,
      assignmentCount: assignmentCounts.get(version.id) ?? 0,
      acceptanceCount: acceptanceCounts.get(version.id) ?? 0,
      reacceptanceCount: reacceptanceCounts.get(version.id) ?? 0,
    };
  });

  return rows;
}

export async function loadAgreementAdminDetail(versionId: string): Promise<AgreementDetailRecord | null> {
  const { role } = await requireAdminSession();
  if (!['owner', 'admin'].includes(role)) {
    throw new Error('Agreement administration requires owner or admin access.');
  }

  const db = isServiceReady();

  const [versionResult, contentResult, assignmentsResult, acceptancesResult, agreementsResult, auditResult] = await Promise.all([
    db
      .from('agreement_versions')
      .select('id, version_number, title, slug, status, material_change, summary, effective_at, published_at, published_by_auth_user_id, created_at, updated_at, content_hash')
      .eq('id', versionId)
      .maybeSingle(),
    db
      .from('agreement_content')
      .select('id, agreement_version_id, content_type, summary, content_hash, sections, full_text')
      .eq('agreement_version_id', versionId)
      .maybeSingle(),
    db
      .from('agreement_requirement_assignments')
      .select('id')
      .eq('agreement_version_id', versionId),
    db
      .from('agreement_acceptances')
      .select('id')
      .eq('agreement_version_id', versionId),
    db
      .from('partner_agreements')
      .select('partner_id, current_version_id, accepted_version_id, requires_reacceptance')
      .eq('current_version_id', versionId),
    db
      .from('partner_audit_log')
      .select('event_type, actor_role, actor_auth_user_id, occurred_at, entity_id, after_payload')
      .eq('entity_id', versionId)
      .in('event_type', [
        'agreement.draft_created',
        'agreement.draft_edited',
        'agreement.published',
        'agreement.superseded',
        'agreement.assigned',
        'agreement.accepted',
        'agreement.reacceptance_required',
      ])
      .order('occurred_at', { ascending: false }),
  ]);

  for (const result of [versionResult, contentResult, assignmentsResult, acceptancesResult, agreementsResult, auditResult]) {
    if (result.error) {
      throw result.error;
    }
  }

  if (!versionResult.data) {
    return null;
  }

  return {
    version: versionResult.data,
    content: contentResult.data
      ? {
          ...contentResult.data,
          sections: (contentResult.data.sections ?? {}) as Record<string, string>,
        }
      : null,
    assignmentCount: assignmentsResult.data?.length ?? 0,
    acceptancesCount: acceptancesResult.data?.length ?? 0,
    reacceptanceCount: agreementsResult.data?.filter((row) => row.requires_reacceptance).length ?? 0,
    auditEvents: (auditResult.data ?? []).map((event) => ({
      eventType: event.event_type,
      actorRole: event.actor_role,
      actorAuthUserId: event.actor_auth_user_id,
      occurredAt: event.occurred_at,
      entityId: event.entity_id,
      afterPayload: event.after_payload,
    })),
    creatorAuthUserId: (auditResult.data ?? []).find((event) => event.event_type === 'agreement.draft_created')?.actor_auth_user_id ?? null,
  };
}

export function getAgreementDraftLifecycleActions(status: string) {
  if (status === 'draft') {
    return ['View', 'Edit', 'Preview', 'Publish'];
  }
  if (status === 'published' || status === 'active') {
    return ['View', 'Preview'];
  }
  return ['View', 'Preview'];
}

export function formatAgreementDateTime(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Indian/Maldives',
  }).format(new Date(value));
}

export function formatAgreementCount(value: number, label: string) {
  return `${value} ${label}${value === 1 ? '' : 's'}`;
}
