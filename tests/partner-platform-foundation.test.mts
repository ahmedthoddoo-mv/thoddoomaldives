import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildPartnerAgreementStatus,
  buildPartnerOperationalStatus,
  buildPartnerSubscriptionStatus,
  buildPublicationEligibilityResult,
  calculateDaysRemaining,
} from '../lib/partner-platform/services.ts';
import { canAcceptAgreement, canManageListings, canViewPartnerFinancials, canViewPartnerOperationalData, getUserPartnerRoles, getUserPlatformRoles, hasPlatformPermission, hasPartnerPermission } from '../lib/partner-platform/permissions.ts';
import { DEFAULT_COMPLIMENTARY_DISCOUNT_PERCENT, DEFAULT_COMPLIMENTARY_MEMBERSHIP_DAYS } from '../lib/partner-platform/config.ts';

type OperationalStatusInput = Parameters<typeof buildPartnerOperationalStatus>[0];

type LifecycleRow = NonNullable<OperationalStatusInput['lifecycleRow']>;
type VerificationRow = NonNullable<OperationalStatusInput['verificationRow']>;
type AgreementRow = NonNullable<OperationalStatusInput['agreementRow']>;
type SubscriptionRow = NonNullable<OperationalStatusInput['subscriptionRow']>;
type PublicationEligibilityRow = NonNullable<OperationalStatusInput['publicationEligibilityRows']>[number];

function asLifecycleRow(value: object): LifecycleRow {
  return value as unknown as LifecycleRow;
}

function asVerificationRow(value: object): VerificationRow {
  return value as unknown as VerificationRow;
}

function asAgreementRow(value: object): AgreementRow {
  return value as unknown as AgreementRow;
}

function asSubscriptionRow(value: object): SubscriptionRow {
  return value as unknown as SubscriptionRow;
}

function asPublicationEligibilityRow(value: object): PublicationEligibilityRow {
  return value as unknown as PublicationEligibilityRow;
}

test('buildPartnerOperationalStatus aggregates lifecycle verification agreement and subscription state', () => {
  const status = buildPartnerOperationalStatus({
    partnerId: 'partner-1',
    lifecycleRow: asLifecycleRow({
      id: 'lifecycle-1',
      partner_id: 'partner-1',
      lifecycle_state: 'approved',
      editing_allowed: true,
      requires_action: false,
      grace_period_active: false,
      can_login: true,
      can_view_dashboard: true,
      can_manage_listings: true,
      publication_blocked_reason: null,
      last_transition_at: '2024-01-01T00:00:00.000Z',
      last_transition_reason: 'approved',
      financial_standing_state: 'good_standing',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    }),
    verificationRow: asVerificationRow({
      id: 'verification-1',
      partner_id: 'partner-1',
      verification_state: 'approved',
      reviewed_by_admin_id: 'user-1',
      reviewed_at: '2024-01-01T00:00:00.000Z',
      review_notes: 'Verified',
      documents_complete: true,
      documents_expired: false,
      last_checked_at: '2024-01-02T00:00:00.000Z',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-02T00:00:00.000Z',
    }),
    agreementRow: asAgreementRow({
      id: 'agreement-1',
      partner_id: 'partner-1',
      current_version_id: 'version-1',
      requirement_state: 'accepted',
      acceptance_deadline_at: '2024-04-01T00:00:00.000Z',
      accepted_version_id: 'version-1',
      accepted_at: '2024-01-10T00:00:00.000Z',
      requires_reacceptance: false,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-10T00:00:00.000Z',
    }),
    subscriptionRow: asSubscriptionRow({
      id: 'subscription-1',
      partner_id: 'partner-1',
      plan_id: 'plan-1',
      subscription_state: 'complimentary_active',
      billing_model: 'complimentary',
      normal_price_amount: null,
      discount_percentage: 100,
      currency: 'USD',
      complimentary_start_at: '2024-01-01T00:00:00.000Z',
      complimentary_end_at: '2024-04-01T00:00:00.000Z',
      current_period_start_at: '2024-01-01T00:00:00.000Z',
      current_period_end_at: '2024-04-01T00:00:00.000Z',
      grace_end_at: null,
      next_billing_at: null,
      auto_renew: false,
      waiver_applied: false,
      waiver_reason: null,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    }),
    publicationEligibilityRows: [
      asPublicationEligibilityRow({
        id: 'eligibility-1',
        partner_id: 'partner-1',
        listing_type: 'property',
        listing_id: 'listing-1',
        eligibility_state: 'eligible',
        reason_code: 'approved',
        reason_details: 'Approved partner',
        evaluated_at: '2024-01-02T00:00:00.000Z',
        evaluated_by_admin_id: null,
        created_at: '2024-01-02T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      }),
    ],
  });

  assert.equal(status.lifecycle.state, 'approved');
  assert.equal(status.verification.state, 'approved');
  assert.equal(status.agreement.requirementState, 'accepted');
  assert.equal(status.subscription.state, 'complimentary_active');
  assert.equal(status.publicationEligibility[0]?.eligibilityState, 'eligible');
});

test('buildPartnerAgreementStatus uses the centralized complimentary period configuration', () => {
  const status = buildPartnerAgreementStatus({
    partnerId: 'partner-2',
    agreementRow: asAgreementRow({
      id: 'agreement-2',
      partner_id: 'partner-2',
      current_version_id: 'version-2',
      requirement_state: 'required_pending_acceptance',
      acceptance_deadline_at: '2024-04-01T00:00:00.000Z',
      accepted_version_id: null,
      accepted_at: null,
      requires_reacceptance: true,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    }),
  });

  assert.equal(status.requirementState, 'required_pending_acceptance');
  assert.equal(status.complimentaryMembershipDays, DEFAULT_COMPLIMENTARY_MEMBERSHIP_DAYS);
});

test('buildPartnerSubscriptionStatus preserves complimentary defaults', () => {
  const status = buildPartnerSubscriptionStatus({
    partnerId: 'partner-3',
    subscriptionRow: asSubscriptionRow({
      id: 'subscription-3',
      partner_id: 'partner-3',
      plan_id: 'plan-2',
      subscription_state: 'complimentary_active',
      billing_model: 'complimentary',
      normal_price_amount: null,
      discount_percentage: DEFAULT_COMPLIMENTARY_DISCOUNT_PERCENT,
      currency: 'USD',
      complimentary_start_at: '2024-01-01T00:00:00.000Z',
      complimentary_end_at: '2024-04-01T00:00:00.000Z',
      current_period_start_at: '2024-01-01T00:00:00.000Z',
      current_period_end_at: '2024-04-01T00:00:00.000Z',
      grace_end_at: null,
      next_billing_at: null,
      auto_renew: false,
      waiver_applied: false,
      waiver_reason: null,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    }),
  });

  assert.equal(status.state, 'complimentary_active');
  assert.equal(status.discountPercentage, DEFAULT_COMPLIMENTARY_DISCOUNT_PERCENT);
});

test('buildPublicationEligibilityResult maps rows into the canonical summary shape', () => {
  const result = buildPublicationEligibilityResult({
    partnerId: 'partner-4',
    listingId: 'listing-4',
    listingType: 'restaurant',
    row: asPublicationEligibilityRow({
      id: 'eligibility-4',
      partner_id: 'partner-4',
      listing_type: 'restaurant',
      listing_id: 'listing-4',
      eligibility_state: 'pending_review',
      reason_code: 'manual_review',
      reason_details: 'Awaiting review',
      evaluated_at: '2024-01-03T00:00:00.000Z',
      evaluated_by_admin_id: null,
      created_at: '2024-01-03T00:00:00.000Z',
      updated_at: '2024-01-03T00:00:00.000Z',
    }),
  });

  assert.equal(result.eligibilityState, 'pending_review');
  assert.equal(result.reasonCode, 'manual_review');
});

test('calculateDaysRemaining returns a countdown based on the canonical subscription end date', () => {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  assert.equal(calculateDaysRemaining(tomorrow), 1);
  assert.equal(calculateDaysRemaining(null), null);
});

test('permission helpers support platform owner admin finance and partner roles without enforcing public listings', () => {
  const assignments = [
    { authUserId: 'admin-1', partnerId: null, roleCode: 'admin' as const, scopeType: 'platform' as const },
    { authUserId: 'finance-1', partnerId: null, roleCode: 'finance' as const, scopeType: 'platform' as const },
    { authUserId: 'partner-owner', partnerId: 'partner-1', roleCode: 'partner_owner' as const, scopeType: 'partner' as const },
    { authUserId: 'partner-staff', partnerId: 'partner-1', roleCode: 'partner_staff' as const, scopeType: 'partner' as const },
  ];

  assert.equal(hasPlatformPermission('admin-1', 'partner_operations', assignments), true);
  assert.equal(hasPlatformPermission('finance-1', 'financials', assignments), true);
  assert.equal(hasPartnerPermission('partner-owner', 'partner-1', 'listings', assignments), true);
  assert.equal(hasPartnerPermission('partner-staff', 'partner-1', 'listings', assignments), true);
  assert.equal(hasPartnerPermission('partner-staff', 'partner-1', 'agreement_acceptance', assignments), false);
  assert.equal(canAcceptAgreement('partner-staff', 'partner-1', assignments), false);
  assert.equal(canManageListings('partner-staff', 'partner-1', assignments), true);
  assert.equal(canViewPartnerFinancials('partner-staff', 'partner-1', assignments), false);
  assert.equal(canViewPartnerOperationalData('partner-staff', 'partner-1', assignments), true);
  assert.equal(canViewPartnerOperationalData('partner-staff', 'partner-2', assignments), false);
});

test('role scope helpers isolate platform roles from partner-scoped assignments', () => {
  const assignments = [
    { authUserId: 'platform-admin', partnerId: null, roleCode: 'admin' as const, scopeType: 'platform' as const },
    { authUserId: 'partner-owner', partnerId: 'partner-1', roleCode: 'partner_owner' as const, scopeType: 'partner' as const },
    { authUserId: 'partner-owner', partnerId: 'partner-2', roleCode: 'partner_staff' as const, scopeType: 'partner' as const },
  ];

  assert.deepEqual(getUserPlatformRoles('platform-admin', assignments), ['admin']);
  assert.deepEqual(getUserPartnerRoles('platform-admin', 'partner-1', assignments), []);
  assert.deepEqual(getUserPartnerRoles('platform-admin', 'partner-2', assignments), []);
  assert.equal(canAcceptAgreement('platform-admin', 'partner-1', assignments), false);
  assert.equal(canAcceptAgreement('partner-owner', 'partner-1', assignments), true);
  assert.equal(canAcceptAgreement('partner-owner', 'partner-2', assignments), false);
});
