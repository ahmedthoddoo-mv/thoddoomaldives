import type { PartnerRoleCode, PartnerRoleScope } from '@/lib/partner-platform/types';

export type PartnerRoleAssignment = {
  authUserId: string;
  partnerId: string | null;
  roleCode: PartnerRoleCode;
  scopeType?: PartnerRoleScope | null;
};

export type PlatformPermission = 'partner_operations' | 'partner_review' | 'lifecycle_management' | 'agreement_admin' | 'financials' | 'listing_management' | 'partner_profile' | 'bookings' | 'membership_visibility' | 'agreement_acceptance';

export type PartnerPermission = 'partner_profile' | 'listings' | 'bookings' | 'membership_visibility' | 'agreement_acceptance' | 'financials';

function normalizeRoleCode(value: string | null | undefined): PartnerRoleCode | null {
  switch (value) {
    case 'platform_owner':
    case 'admin':
    case 'finance':
    case 'partner_owner':
    case 'partner_staff':
      return value;
    default:
      return null;
  }
}

function normalizeRoleScope(value: string | null | undefined): PartnerRoleScope | null {
  switch (value) {
    case 'platform':
    case 'partner':
      return value;
    default:
      return null;
  }
}

function resolveRoleScope(assignment: Pick<PartnerRoleAssignment, 'roleCode' | 'scopeType'>): PartnerRoleScope | null {
  const explicitScope = normalizeRoleScope(assignment.scopeType);
  if (explicitScope) {
    return explicitScope;
  }

  switch (assignment.roleCode) {
    case 'platform_owner':
    case 'admin':
    case 'finance':
      return 'platform';
    case 'partner_owner':
    case 'partner_staff':
      return 'partner';
    default:
      return null;
  }
}

function isPlatformScopedAssignment(assignment: PartnerRoleAssignment): boolean {
  return assignment.partnerId == null && resolveRoleScope(assignment) === 'platform';
}

function isPartnerScopedAssignment(assignment: PartnerRoleAssignment, partnerId: string | null | undefined): boolean {
  return assignment.partnerId === partnerId && resolveRoleScope(assignment) === 'partner';
}

export function getUserPlatformRoles(
  authUserId: string | null | undefined,
  assignments: PartnerRoleAssignment[] = []
): PartnerRoleCode[] {
  if (!authUserId) {
    return [];
  }

  return Array.from(new Set(
    assignments
      .filter((assignment) => assignment.authUserId === authUserId && isPlatformScopedAssignment(assignment))
      .map((assignment) => normalizeRoleCode(assignment.roleCode))
      .filter((role): role is PartnerRoleCode => Boolean(role))
  ));
}

export function getUserPartnerRoles(
  authUserId: string | null | undefined,
  partnerId: string | null | undefined,
  assignments: PartnerRoleAssignment[] = []
): PartnerRoleCode[] {
  if (!authUserId || !partnerId) {
    return [];
  }

  return Array.from(new Set(
    assignments
      .filter((assignment) => assignment.authUserId === authUserId && isPartnerScopedAssignment(assignment, partnerId))
      .map((assignment) => normalizeRoleCode(assignment.roleCode))
      .filter((role): role is PartnerRoleCode => Boolean(role))
  ));
}

export function hasPlatformPermission(
  authUserId: string | null | undefined,
  permission: PlatformPermission,
  assignments: PartnerRoleAssignment[] = []
): boolean {
  const roles = getUserPlatformRoles(authUserId, assignments);
  if (roles.includes('platform_owner')) {
    return true;
  }

  if (permission === 'financials' && roles.includes('finance')) {
    return true;
  }

  if (permission === 'partner_operations' || permission === 'partner_review' || permission === 'lifecycle_management' || permission === 'agreement_admin') {
    return roles.includes('admin');
  }

  return false;
}

export function hasPartnerPermission(
  authUserId: string | null | undefined,
  partnerId: string | null | undefined,
  permission: PartnerPermission,
  assignments: PartnerRoleAssignment[] = []
): boolean {
  const roles = getUserPartnerRoles(authUserId, partnerId, assignments);
  if (roles.includes('partner_owner')) {
    return true;
  }

  if (permission === 'partner_profile' || permission === 'listings' || permission === 'bookings' || permission === 'membership_visibility') {
    return roles.includes('partner_staff');
  }

  if (permission === 'agreement_acceptance') {
    return false;
  }

  if (permission === 'financials') {
    return false;
  }

  return false;
}

export function canAcceptAgreement(
  authUserId: string | null | undefined,
  partnerId: string | null | undefined,
  assignments: PartnerRoleAssignment[] = []
): boolean {
  return hasPartnerPermission(authUserId, partnerId, 'agreement_acceptance', assignments);
}

export function canViewPartnerFinancials(
  authUserId: string | null | undefined,
  partnerId: string | null | undefined,
  assignments: PartnerRoleAssignment[] = []
): boolean {
  const roles = getUserPartnerRoles(authUserId, partnerId, assignments);
  return roles.includes('partner_owner') || hasPlatformPermission(authUserId, 'financials', assignments);
}

export function canManageListings(
  authUserId: string | null | undefined,
  partnerId: string | null | undefined,
  assignments: PartnerRoleAssignment[] = []
): boolean {
  return hasPartnerPermission(authUserId, partnerId, 'listings', assignments);
}

export function canViewPartnerOperationalData(
  authUserId: string | null | undefined,
  requestedPartnerId: string | null | undefined,
  assignments: PartnerRoleAssignment[] = []
): boolean {
  if (!authUserId || !requestedPartnerId) {
    return false;
  }

  const platformRoles = getUserPlatformRoles(authUserId, assignments);
  if (platformRoles.length > 0) {
    return true;
  }

  return getUserPartnerRoles(authUserId, requestedPartnerId, assignments).length > 0;
}
