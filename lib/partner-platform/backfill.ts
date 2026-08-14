export type BackfillState = {
  lifecycleState: string;
  verificationState: string;
  subscriptionState: string;
  editingAllowed: boolean;
  requiresAction: boolean;
  canLogin: boolean;
  canViewDashboard: boolean;
  canManageListings: boolean;
  publicationBlockedReason: string | null;
  financialStandingState: string;
  transitionReason: string;
  auditReason: string | null;
};

export function resolveLegacyPartnerBackfillState(legacyStatus: string | null | undefined): BackfillState {
  const normalizedStatus = (legacyStatus ?? '').trim().toLowerCase();

  if (normalizedStatus === 'suspended') {
    return {
      lifecycleState: 'suspended',
      verificationState: 'suspended',
      subscriptionState: 'suspended',
      editingAllowed: false,
      requiresAction: true,
      canLogin: true,
      canViewDashboard: true,
      canManageListings: false,
      publicationBlockedReason: 'suspended-legacy',
      financialStandingState: 'suspended',
      transitionReason: 'legacy-suspended',
      auditReason: null,
    };
  }

  if (normalizedStatus === 'archived') {
    return {
      lifecycleState: 'archived',
      verificationState: 'suspended',
      subscriptionState: 'cancelled',
      editingAllowed: false,
      requiresAction: true,
      canLogin: false,
      canViewDashboard: false,
      canManageListings: false,
      publicationBlockedReason: 'archived-legacy',
      financialStandingState: 'restricted',
      transitionReason: 'legacy-archived',
      auditReason: null,
    };
  }

  if (normalizedStatus === 'verified') {
    return {
      lifecycleState: 'approved',
      verificationState: 'approved',
      subscriptionState: 'complimentary_active',
      editingAllowed: true,
      requiresAction: false,
      canLogin: true,
      canViewDashboard: true,
      canManageListings: true,
      publicationBlockedReason: null,
      financialStandingState: 'good_standing',
      transitionReason: 'legacy-verified',
      auditReason: null,
    };
  }

  if (normalizedStatus === 'pending') {
    return {
      lifecycleState: 'verification_pending',
      verificationState: 'pending',
      subscriptionState: 'draft',
      editingAllowed: false,
      requiresAction: true,
      canLogin: false,
      canViewDashboard: false,
      canManageListings: false,
      publicationBlockedReason: 'verification-pending',
      financialStandingState: 'action_required',
      transitionReason: 'legacy-pending',
      auditReason: null,
    };
  }

  if (['new_lead', 'contacted', 'lead'].includes(normalizedStatus)) {
    return {
      lifecycleState: 'application',
      verificationState: 'not_started',
      subscriptionState: 'draft',
      editingAllowed: false,
      requiresAction: true,
      canLogin: false,
      canViewDashboard: false,
      canManageListings: false,
      publicationBlockedReason: 'application-in-progress',
      financialStandingState: 'action_required',
      transitionReason: 'legacy-application',
      auditReason: null,
    };
  }

  if (['approved', 'active', 'published'].includes(normalizedStatus)) {
    return {
      lifecycleState: 'approved',
      verificationState: 'approved',
      subscriptionState: 'complimentary_active',
      editingAllowed: true,
      requiresAction: false,
      canLogin: true,
      canViewDashboard: true,
      canManageListings: true,
      publicationBlockedReason: null,
      financialStandingState: 'good_standing',
      transitionReason: 'legacy-approved',
      auditReason: null,
    };
  }

  if (['restricted', 'action_required'].includes(normalizedStatus)) {
    return {
      lifecycleState: 'restricted',
      verificationState: 'pending',
      subscriptionState: 'draft',
      editingAllowed: false,
      requiresAction: true,
      canLogin: true,
      canViewDashboard: true,
      canManageListings: false,
      publicationBlockedReason: 'restricted-legacy',
      financialStandingState: 'restricted',
      transitionReason: 'legacy-restricted',
      auditReason: null,
    };
  }

  if (['rejected', 'declined', 'incomplete'].includes(normalizedStatus)) {
    return {
      lifecycleState: 'verification_rejected',
      verificationState: 'rejected',
      subscriptionState: 'draft',
      editingAllowed: false,
      requiresAction: true,
      canLogin: false,
      canViewDashboard: false,
      canManageListings: false,
      publicationBlockedReason: 'legacy-rejected',
      financialStandingState: 'action_required',
      transitionReason: 'legacy-rejected',
      auditReason: null,
    };
  }

  return {
    lifecycleState: 'verification_pending',
    verificationState: 'pending',
    subscriptionState: 'draft',
    editingAllowed: false,
    requiresAction: true,
    canLogin: false,
    canViewDashboard: false,
    canManageListings: false,
    publicationBlockedReason: 'legacy-status-unmapped',
    financialStandingState: 'action_required',
    transitionReason: 'legacy-status-unmapped',
    auditReason: 'legacy-status-unmapped-during-backfill',
  };
}

export function resolveMembershipPlanId(membershipPlanId: string | null | undefined, validPlanIds: Set<string>): string | null {
  if (!membershipPlanId) {
    return null;
  }

  return validPlanIds.has(membershipPlanId) ? membershipPlanId : null;
}

export function resolveBackfillReferenceTimestamp(
  approvedAt: string | null | undefined,
  createdAt: string | null | undefined,
  fallbackAt: string,
): string {
  return approvedAt ?? createdAt ?? fallbackAt;
}

export function isValidDiscountPercentage(value: number | null | undefined): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  return value >= 0 && value <= 100;
}

export function isValidDateRange(startAt: Date | null | undefined, endAt: Date | null | undefined): boolean {
  if (!startAt || !endAt) {
    return true;
  }

  return endAt.getTime() > startAt.getTime();
}
