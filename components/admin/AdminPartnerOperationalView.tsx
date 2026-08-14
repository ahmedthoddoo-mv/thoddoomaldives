import type { PartnerOperationalStatus } from '@/lib/partner-platform/services';
import { describeAgreementState, describeLifecycleState, describeSubscriptionState, describeVerificationState } from '@/lib/partner-platform/services';
import { canManageListings, canViewPartnerFinancials } from '@/lib/partner-platform/permissions';
import type { PartnerRoleCode } from '@/lib/partner-platform/types';

type AdminPartnerOperationalViewProps = {
  partnerName: string;
  legacyStatus: string;
  partnerId: string;
  operationalStatus: PartnerOperationalStatus | null;
  roles: { authUserId: string; roleCode: PartnerRoleCode; partnerId: string | null }[];
  authUserId: string | null;
};

export function AdminPartnerOperationalView({ partnerName, legacyStatus, partnerId, operationalStatus, roles, authUserId }: AdminPartnerOperationalViewProps) {
  const lifecycle = operationalStatus?.lifecycle;
  const verification = operationalStatus?.verification;
  const agreement = operationalStatus?.agreement;
  const subscription = operationalStatus?.subscription;
  const partnerRoles = roles.filter((role) => role.partnerId === partnerId).map((role) => role.roleCode);
  const platformRoles = roles.filter((role) => role.partnerId == null && role.authUserId === authUserId).map((role) => role.roleCode);

  return (
    <section className="adminPanel partnerOperationsAdminPanel">
      <div className="partnerPortalSectionHeader">
        <p className="eyebrow">Read-only operations view</p>
        <h2>{partnerName}</h2>
      </div>
      <p>Operational state is derived from the Phase 1A domain tables and remains non-enforcing in this release.</p>
      <div className="partnerPortalSnapshotGrid">
        <div>
          <span>Legacy status</span>
          <strong>{legacyStatus}</strong>
          <small>Authoritative legacy application state</small>
        </div>
        <div>
          <span>Lifecycle</span>
          <strong>{lifecycle ? describeLifecycleState(lifecycle.state) : 'No lifecycle row'}</strong>
          <small>{lifecycle?.requiresAction ? 'Action required' : 'No action required'}</small>
        </div>
        <div>
          <span>Verification</span>
          <strong>{verification ? describeVerificationState(verification.state) : 'Not started'}</strong>
          <small>{verification?.reviewedAt ? `Reviewed ${verification.reviewedAt}` : 'Awaiting review'}</small>
        </div>
        <div>
          <span>Subscription</span>
          <strong>{subscription ? describeSubscriptionState(subscription.state) : 'No subscription row'}</strong>
          <small>{subscription?.billingModel ?? 'No billing model'}</small>
        </div>
      </div>
      <div className="partnerPortalSnapshotGrid" style={{ marginTop: '12px' }}>
        <div>
          <span>Agreement</span>
          <strong>{agreement ? describeAgreementState(agreement.requirementState) : 'Not available'}</strong>
          <small>{agreement?.acceptedAt ? `Accepted ${agreement.acceptedAt}` : 'No acceptance recorded'}</small>
        </div>
        <div>
          <span>Publication</span>
          <strong>{lifecycle?.canManageListings ? 'Eligible to manage' : 'Restricted'}</strong>
          <small>{lifecycle?.publicationBlockedReason ?? 'Legacy publication logic remains authoritative'}</small>
        </div>
        <div>
          <span>Permissions</span>
          <strong>{partnerRoles.length > 0 ? partnerRoles.join(', ') : 'No partner roles'}</strong>
          <small>{platformRoles.length > 0 ? `Platform roles: ${platformRoles.join(', ')}` : 'No platform roles'}</small>
        </div>
        <div>
          <span>Read access</span>
          <strong>{canManageListings(authUserId, partnerId, roles.map((role) => ({ authUserId: role.authUserId, partnerId: role.partnerId, roleCode: role.roleCode }))) ? 'Listing access' : 'No listing access'}</strong>
          <small>{canViewPartnerFinancials(authUserId, partnerId, roles.map((role) => ({ authUserId: role.authUserId, partnerId: role.partnerId, roleCode: role.roleCode }))) ? 'Financial access' : 'No financial access'}</small>
        </div>
      </div>
    </section>
  );
}
