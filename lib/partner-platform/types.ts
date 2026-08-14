export type PartnerLifecycleState =
  | 'application'
  | 'verification_pending'
  | 'verification_rejected'
  | 'approved'
  | 'agreement_required'
  | 'agreement_pending'
  | 'active'
  | 'restricted'
  | 'suspended'
  | 'archived';

export type PartnerVerificationState =
  | 'not_started'
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'suspended';

export type AgreementState =
  | 'not_required'
  | 'required_pending_acceptance'
  | 'accepted'
  | 'requires_reacceptance'
  | 'expired'
  | 'superseded';

export type AgreementVersionStatus = 'draft' | 'published' | 'active' | 'superseded' | 'retired';

export type SubscriptionState =
  | 'draft'
  | 'complimentary_active'
  | 'paid_active'
  | 'grace_period'
  | 'expired'
  | 'cancelled'
  | 'suspended'
  | 'reactivated';

export type SubscriptionEventType =
  | 'created'
  | 'complimentary_started'
  | 'complimentary_extended'
  | 'converted_to_paid'
  | 'grace_started'
  | 'grace_ended'
  | 'plan_changed'
  | 'waived'
  | 'cancelled'
  | 'suspended'
  | 'reactivated';

export type PublicationEligibilityState = 'eligible' | 'not_eligible' | 'pending_review';

export type PartnerRoleCode = 'platform_owner' | 'admin' | 'finance' | 'partner_owner' | 'partner_staff';

export type PartnerRoleScope = 'platform' | 'partner';

export type PartnerAuditEventType =
  | 'agreement.accepted'
  | 'agreement.reacceptance_required'
  | 'agreement.published'
  | 'agreement.superseded'
  | 'agreement.assigned'
  | 'subscription.created'
  | 'subscription.extended'
  | 'subscription.plan_changed'
  | 'partner.restricted'
  | 'partner.suspended'
  | 'partner.reactivated'
  | 'listing.unpublished'
  | 'listing.republished'
  | 'fee.waived'
  | 'admin.override';

// Phase 1B-B: Agreement versioning and content management

export type AgreementRequirementAssignmentStrategy =
  | 'specific_partner'
  | 'all_active'
  | 'by_tier'
  | 'new_partners_forward';

export type AgreementRequirementState =
  | 'not_required'
  | 'pending'
  | 'accepted'
  | 'reacceptance_required'
  | 'grace_period'
  | 'overdue'
  | 'waived';

export type AgreementContentType = 'markdown' | 'html' | 'json_sections';

export interface AgreementContent {
  id: string;
  agreement_version_id: string;
  content_type: AgreementContentType;
  full_text: string;
  sections: Record<string, string>;
  summary: string;
  content_hash: string;
  created_at: string;
  updated_at: string;
}

export interface AgreementRequirementAssignment {
  id: string;
  agreement_version_id: string;
  partner_id: string | null;
  assignment_strategy: AgreementRequirementAssignmentStrategy;
  assigned_by_auth_user_id: string;
  assigned_at: string;
  acceptance_deadline_at: string | null;
  grace_end_at: string | null;
  waived_reason: string | null;
  state: AgreementRequirementState;
  created_at: string;
  updated_at: string;
}

export interface AgreementAcceptanceStatements {
  read_confirmation?: boolean;
  agreement_acceptance?: boolean;
  authorized_person?: string;
}

export interface AgreementAcceptanceEvidenceRecord {
  id: string;
  acceptance_id: string;
  content_hash_accepted: string;
  accepted_by_auth_user_id: string;
  accepting_role: PartnerRoleCode;
  accepted_at: string;
  ip_address: string | null;
  user_agent: string | null;
  acceptance_statements: AgreementAcceptanceStatements;
  correlation_id: string | null;
  created_at: string;
}

export interface FeatureFlag {
  id: string;
  flag_key: string;
  enabled: boolean;
  config: Record<string, unknown>;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Composite types for application layer

export interface AgreementVersionWithContent {
  id: string;
  version_number: number;
  title: string;
  slug: string;
  status: AgreementVersionStatus;
  effective_at: string | null;
  published_at: string | null;
  published_by_auth_user_id: string | null;
  summary: string | null;
  material_change: boolean;
  acceptance_deadline_days: number | null;
  content_hash: string | null;
  superseded_by_version_id: string | null;
  created_at: string;
  updated_at: string;
  content?: AgreementContent;
}

export interface PartnerAgreementStatus {
  partner_id: string;
  current_version: AgreementVersionWithContent | null;
  accepted_version: AgreementVersionWithContent | null;
  requirement_state: AgreementState;
  acceptance_deadline_at: string | null;
  accepted_at: string | null;
  requires_reacceptance: boolean;
  grace_period_active: boolean;
  reacceptance_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgreementAcceptanceForm {
  read_confirmation: boolean;
  agreement_acceptance: boolean;
  authorized_person?: string;
}
