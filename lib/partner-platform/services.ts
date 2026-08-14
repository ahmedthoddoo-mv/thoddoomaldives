import { createSupabaseServiceRoleClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/types';
import { DEFAULT_COMPLIMENTARY_DISCOUNT_PERCENT, DEFAULT_COMPLIMENTARY_MEMBERSHIP_DAYS } from '@/lib/partner-platform/config';
import type {
  AgreementState,
  PartnerLifecycleState,
  PartnerVerificationState,
  PublicationEligibilityState,
  PartnerRoleCode,
  SubscriptionState,
} from '@/lib/partner-platform/types';

type PartnerLifecycleRow = Tables<'partner_lifecycles'>;
type PartnerVerificationRow = Tables<'partner_verifications'>;
type PartnerAgreementRow = Tables<'partner_agreements'>;
type PartnerSubscriptionRow = Tables<'partner_subscriptions'>;
type PartnerPublicationEligibilityRow = Tables<'partner_publication_eligibility'>;

export type PartnerOperationalStatus = {
  partnerId: string;
  lifecycle: {
    state: PartnerLifecycleState;
    editingAllowed: boolean;
    requiresAction: boolean;
    gracePeriodActive: boolean;
    canLogin: boolean;
    canViewDashboard: boolean;
    canManageListings: boolean;
    publicationBlockedReason: string | null;
    lastTransitionAt: string | null;
    lastTransitionReason: string | null;
    financialStandingState: string | null;
  };
  verification: {
    state: PartnerVerificationState;
    reviewedByAdminId: string | null;
    reviewedAt: string | null;
    reviewNotes: string | null;
    documentsComplete: boolean;
    documentsExpired: boolean;
    lastCheckedAt: string | null;
  };
  agreement: {
    requirementState: AgreementState;
    currentVersionId: string | null;
    acceptanceDeadlineAt: string | null;
    acceptedVersionId: string | null;
    acceptedAt: string | null;
    requiresReacceptance: boolean;
  };
  subscription: {
    state: SubscriptionState;
    planId: string | null;
    billingModel: string | null;
    discountPercentage: number;
    normalPriceAmount: number | null;
    currency: string | null;
    complimentaryStartAt: string | null;
    complimentaryEndAt: string | null;
    currentPeriodStartAt: string | null;
    currentPeriodEndAt: string | null;
    graceEndAt: string | null;
    nextBillingAt: string | null;
    autoRenew: boolean;
    waiverApplied: boolean;
    waiverReason: string | null;
  };
  publicationEligibility: PartnerPublicationEligibilitySummary[];
};

export type PartnerPublicationEligibilitySummary = {
  listingType: string;
  listingId: string;
  eligibilityState: PublicationEligibilityState;
  reasonCode: string | null;
  reasonDetails: string | null;
  evaluatedAt: string | null;
};

export type PartnerAgreementStatus = {
  partnerId: string;
  requirementState: AgreementState;
  currentVersionId: string | null;
  acceptanceDeadlineAt: string | null;
  acceptedVersionId: string | null;
  acceptedAt: string | null;
  requiresReacceptance: boolean;
  complimentaryMembershipDays: number;
};

export type PartnerSubscriptionStatus = {
  partnerId: string;
  state: SubscriptionState;
  planId: string | null;
  billingModel: string | null;
  discountPercentage: number;
  normalPriceAmount: number | null;
  currency: string | null;
  complimentaryStartAt: string | null;
  complimentaryEndAt: string | null;
  currentPeriodStartAt: string | null;
  currentPeriodEndAt: string | null;
  graceEndAt: string | null;
  nextBillingAt: string | null;
  autoRenew: boolean;
  waiverApplied: boolean;
  waiverReason: string | null;
};

export type ListingPublicationEligibility = {
  partnerId: string;
  listingId: string;
  listingType: string;
  eligibilityState: PublicationEligibilityState;
  reasonCode: string | null;
  reasonDetails: string | null;
  evaluatedAt: string | null;
};

function normalizeLifecycleState(value: string | null | undefined): PartnerLifecycleState {
  switch (value) {
    case 'verification_pending':
    case 'verification_rejected':
    case 'approved':
    case 'agreement_required':
    case 'agreement_pending':
    case 'active':
    case 'restricted':
    case 'suspended':
    case 'archived':
      return value;
    default:
      return 'application';
  }
}

function normalizeVerificationState(value: string | null | undefined): PartnerVerificationState {
  switch (value) {
    case 'pending':
    case 'in_review':
    case 'approved':
    case 'rejected':
    case 'expired':
    case 'suspended':
      return value;
    default:
      return 'not_started';
  }
}

function normalizeAgreementState(value: string | null | undefined): AgreementState {
  switch (value) {
    case 'required_pending_acceptance':
    case 'accepted':
    case 'requires_reacceptance':
    case 'expired':
    case 'superseded':
      return value;
    default:
      return 'not_required';
  }
}

function normalizeSubscriptionState(value: string | null | undefined): SubscriptionState {
  switch (value) {
    case 'complimentary_active':
    case 'paid_active':
    case 'grace_period':
    case 'expired':
    case 'cancelled':
    case 'suspended':
    case 'reactivated':
      return value;
    default:
      return 'draft';
  }
}

function normalizePublicationEligibilityState(value: string | null | undefined): PublicationEligibilityState {
  switch (value) {
    case 'eligible':
    case 'not_eligible':
      return value;
    default:
      return 'pending_review';
  }
}

export function calculateDaysRemaining(endAt: string | null | undefined): number | null {
  if (!endAt) {
    return null;
  }

  const endTime = new Date(endAt).getTime();
  if (Number.isNaN(endTime)) {
    return null;
  }

  const remainingMs = endTime - Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil(remainingMs / dayMs));
}

export function describeLifecycleState(state: PartnerLifecycleState): string {
  switch (state) {
    case 'active':
    case 'approved':
      return 'Active';
    case 'agreement_required':
    case 'agreement_pending':
      return 'Agreement pending';
    case 'restricted':
      return 'Restricted';
    case 'suspended':
      return 'Suspended';
    case 'archived':
      return 'Archived';
    case 'verification_pending':
      return 'Verification pending';
    case 'verification_rejected':
      return 'Verification rejected';
    default:
      return 'Application in progress';
  }
}

export function describeVerificationState(state: PartnerVerificationState): string {
  switch (state) {
    case 'approved':
      return 'Verified';
    case 'pending':
    case 'in_review':
      return 'Review in progress';
    case 'rejected':
      return 'Rejected';
    case 'expired':
      return 'Expired';
    case 'suspended':
      return 'Suspended';
    default:
      return 'Not started';
  }
}

export function describeAgreementState(state: AgreementState): string {
  switch (state) {
    case 'accepted':
      return 'Accepted';
    case 'required_pending_acceptance':
      return 'Action required';
    case 'requires_reacceptance':
      return 'Re-acceptance required';
    case 'expired':
      return 'Expired';
    case 'superseded':
      return 'Superseded';
    default:
      return 'Not required';
  }
}

export function describeSubscriptionState(state: SubscriptionState): string {
  switch (state) {
    case 'complimentary_active':
      return 'Complimentary';
    case 'paid_active':
      return 'Active';
    case 'grace_period':
      return 'Grace period';
    case 'expired':
      return 'Expired';
    case 'cancelled':
      return 'Cancelled';
    case 'suspended':
      return 'Suspended';
    case 'reactivated':
      return 'Reactivated';
    default:
      return 'Draft';
  }
}

export function formatCurrency(amount: number | null, currency: string | null): string {
  if (amount == null) {
    return 'Not set';
  }

  const currencyCode = currency ?? 'USD';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(amount);
}

export function listPartnerRoleCodes(roleCodes: PartnerRoleCode[]): PartnerRoleCode[] {
  return Array.from(new Set(roleCodes));
}

export function buildPartnerOperationalStatus(input: {
  partnerId: string;
  lifecycleRow?: PartnerLifecycleRow | null;
  verificationRow?: PartnerVerificationRow | null;
  agreementRow?: PartnerAgreementRow | null;
  subscriptionRow?: PartnerSubscriptionRow | null;
  publicationEligibilityRows?: PartnerPublicationEligibilityRow[];
}): PartnerOperationalStatus {
  const lifecycleRow = input.lifecycleRow ?? null;
  const verificationRow = input.verificationRow ?? null;
  const agreementRow = input.agreementRow ?? null;
  const subscriptionRow = input.subscriptionRow ?? null;
  const publicationEligibilityRows = input.publicationEligibilityRows ?? [];

  return {
    partnerId: input.partnerId,
    lifecycle: {
      state: normalizeLifecycleState(lifecycleRow?.lifecycle_state ?? null),
      editingAllowed: lifecycleRow?.editing_allowed ?? true,
      requiresAction: lifecycleRow?.requires_action ?? false,
      gracePeriodActive: lifecycleRow?.grace_period_active ?? false,
      canLogin: lifecycleRow?.can_login ?? true,
      canViewDashboard: lifecycleRow?.can_view_dashboard ?? true,
      canManageListings: lifecycleRow?.can_manage_listings ?? true,
      publicationBlockedReason: lifecycleRow?.publication_blocked_reason ?? null,
      lastTransitionAt: lifecycleRow?.last_transition_at ?? null,
      lastTransitionReason: lifecycleRow?.last_transition_reason ?? null,
      financialStandingState: lifecycleRow?.financial_standing_state ?? 'good_standing',
    },
    verification: {
      state: normalizeVerificationState(verificationRow?.verification_state ?? null),
      reviewedByAdminId: verificationRow?.reviewed_by_admin_id ?? null,
      reviewedAt: verificationRow?.reviewed_at ?? null,
      reviewNotes: verificationRow?.review_notes ?? null,
      documentsComplete: verificationRow?.documents_complete ?? false,
      documentsExpired: verificationRow?.documents_expired ?? false,
      lastCheckedAt: verificationRow?.last_checked_at ?? null,
    },
    agreement: {
      requirementState: normalizeAgreementState(agreementRow?.requirement_state ?? null),
      currentVersionId: agreementRow?.current_version_id ?? null,
      acceptanceDeadlineAt: agreementRow?.acceptance_deadline_at ?? null,
      acceptedVersionId: agreementRow?.accepted_version_id ?? null,
      acceptedAt: agreementRow?.accepted_at ?? null,
      requiresReacceptance: agreementRow?.requires_reacceptance ?? false,
    },
    subscription: {
      state: normalizeSubscriptionState(subscriptionRow?.subscription_state ?? null),
      planId: subscriptionRow?.plan_id ?? null,
      billingModel: subscriptionRow?.billing_model ?? null,
      discountPercentage: subscriptionRow?.discount_percentage ?? DEFAULT_COMPLIMENTARY_DISCOUNT_PERCENT,
      normalPriceAmount: subscriptionRow?.normal_price_amount ?? null,
      currency: subscriptionRow?.currency ?? null,
      complimentaryStartAt: subscriptionRow?.complimentary_start_at ?? null,
      complimentaryEndAt: subscriptionRow?.complimentary_end_at ?? null,
      currentPeriodStartAt: subscriptionRow?.current_period_start_at ?? null,
      currentPeriodEndAt: subscriptionRow?.current_period_end_at ?? null,
      graceEndAt: subscriptionRow?.grace_end_at ?? null,
      nextBillingAt: subscriptionRow?.next_billing_at ?? null,
      autoRenew: subscriptionRow?.auto_renew ?? false,
      waiverApplied: subscriptionRow?.waiver_applied ?? false,
      waiverReason: subscriptionRow?.waiver_reason ?? null,
    },
    publicationEligibility: publicationEligibilityRows.map((row) => ({
      listingType: row.listing_type,
      listingId: row.listing_id,
      eligibilityState: normalizePublicationEligibilityState(row.eligibility_state),
      reasonCode: row.reason_code ?? null,
      reasonDetails: row.reason_details ?? null,
      evaluatedAt: row.evaluated_at ?? null,
    })),
  };
}

export function buildPartnerAgreementStatus(input: {
  partnerId: string;
  agreementRow?: PartnerAgreementRow | null;
}): PartnerAgreementStatus {
  return {
    partnerId: input.partnerId,
    requirementState: normalizeAgreementState(input.agreementRow?.requirement_state ?? null),
    currentVersionId: input.agreementRow?.current_version_id ?? null,
    acceptanceDeadlineAt: input.agreementRow?.acceptance_deadline_at ?? null,
    acceptedVersionId: input.agreementRow?.accepted_version_id ?? null,
    acceptedAt: input.agreementRow?.accepted_at ?? null,
    requiresReacceptance: input.agreementRow?.requires_reacceptance ?? false,
    complimentaryMembershipDays: DEFAULT_COMPLIMENTARY_MEMBERSHIP_DAYS,
  };
}

export function buildPartnerSubscriptionStatus(input: {
  partnerId: string;
  subscriptionRow?: PartnerSubscriptionRow | null;
}): PartnerSubscriptionStatus {
  return {
    partnerId: input.partnerId,
    state: normalizeSubscriptionState(input.subscriptionRow?.subscription_state ?? null),
    planId: input.subscriptionRow?.plan_id ?? null,
    billingModel: input.subscriptionRow?.billing_model ?? null,
    discountPercentage: input.subscriptionRow?.discount_percentage ?? DEFAULT_COMPLIMENTARY_DISCOUNT_PERCENT,
    normalPriceAmount: input.subscriptionRow?.normal_price_amount ?? null,
    currency: input.subscriptionRow?.currency ?? null,
    complimentaryStartAt: input.subscriptionRow?.complimentary_start_at ?? null,
    complimentaryEndAt: input.subscriptionRow?.complimentary_end_at ?? null,
    currentPeriodStartAt: input.subscriptionRow?.current_period_start_at ?? null,
    currentPeriodEndAt: input.subscriptionRow?.current_period_end_at ?? null,
    graceEndAt: input.subscriptionRow?.grace_end_at ?? null,
    nextBillingAt: input.subscriptionRow?.next_billing_at ?? null,
    autoRenew: input.subscriptionRow?.auto_renew ?? false,
    waiverApplied: input.subscriptionRow?.waiver_applied ?? false,
    waiverReason: input.subscriptionRow?.waiver_reason ?? null,
  };
}

export function buildPublicationEligibilityResult(input: {
  partnerId: string;
  listingId: string;
  listingType: string;
  row?: PartnerPublicationEligibilityRow | null;
}): ListingPublicationEligibility {
  return {
    partnerId: input.partnerId,
    listingId: input.listingId,
    listingType: input.listingType,
    eligibilityState: normalizePublicationEligibilityState(input.row?.eligibility_state ?? null),
    reasonCode: input.row?.reason_code ?? null,
    reasonDetails: input.row?.reason_details ?? null,
    evaluatedAt: input.row?.evaluated_at ?? null,
  };
}

export async function getPartnerOperationalStatus(partnerId: string): Promise<PartnerOperationalStatus | null> {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return null;
  }

  const [lifecycleResult, verificationResult, agreementResult, subscriptionResult, eligibilityResult] = await Promise.all([
    supabase.from('partner_lifecycles').select('*').eq('partner_id', partnerId).maybeSingle(),
    supabase.from('partner_verifications').select('*').eq('partner_id', partnerId).maybeSingle(),
    supabase.from('partner_agreements').select('*').eq('partner_id', partnerId).maybeSingle(),
    supabase.from('partner_subscriptions').select('*').eq('partner_id', partnerId).maybeSingle(),
    supabase.from('partner_publication_eligibility').select('*').eq('partner_id', partnerId),
  ]);

  if (lifecycleResult.error || verificationResult.error || agreementResult.error || subscriptionResult.error || eligibilityResult.error) {
    return null;
  }

  return buildPartnerOperationalStatus({
    partnerId,
    lifecycleRow: lifecycleResult.data,
    verificationRow: verificationResult.data,
    agreementRow: agreementResult.data,
    subscriptionRow: subscriptionResult.data,
    publicationEligibilityRows: eligibilityResult.data ?? [],
  });
}

export async function getPartnerAgreementStatus(partnerId: string): Promise<PartnerAgreementStatus | null> {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.from('partner_agreements').select('*').eq('partner_id', partnerId).maybeSingle();
  if (error || !data) {
    return null;
  }

  return buildPartnerAgreementStatus({ partnerId, agreementRow: data });
}

export async function getPartnerSubscriptionStatus(partnerId: string): Promise<PartnerSubscriptionStatus | null> {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.from('partner_subscriptions').select('*').eq('partner_id', partnerId).maybeSingle();
  if (error || !data) {
    return null;
  }

  return buildPartnerSubscriptionStatus({ partnerId, subscriptionRow: data });
}

export async function isListingPublicationEligible(partnerId: string, listingId: string, listingType: string): Promise<ListingPublicationEligibility | null> {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('partner_publication_eligibility')
    .select('*')
    .eq('partner_id', partnerId)
    .eq('listing_id', listingId)
    .eq('listing_type', listingType)
    .maybeSingle();

  if (error || !data) {
    return buildPublicationEligibilityResult({ partnerId, listingId, listingType });
  }

  return buildPublicationEligibilityResult({ partnerId, listingId, listingType, row: data });
}
