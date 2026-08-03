import Link from "next/link";
import { getPartnerApplicationBusinessTypeLabel } from "@/data/partnerApplications";
import { ApplicationStatusBadge } from "@/components/admin/ApplicationStatusBadge";
import { ApplicationTimeline } from "@/components/admin/ApplicationTimeline";
import { RequestedChangesList } from "@/components/admin/RequestedChangesList";
import type { PartnerApplicationRecord } from "@/types/partner-application";

export function PartnerApplicationStatus({ application }: { application?: PartnerApplicationRecord }) {
  if (!application) return <section className="partnerPortalPanel"><h2>No application yet</h2><p>No application is linked to this authenticated partner identity.</p><Link className="primaryButton" href="/partners/onboarding">Start application</Link></section>;
  return (
    <div className="partnerPortalStack">
      <section className="partnerPortalPanel partnerApplicationHero"><div><ApplicationStatusBadge status={application.status} /><h2>{application.businessName}</h2><p>{application.description}</p></div><dl><div><dt>Business type</dt><dd>{getPartnerApplicationBusinessTypeLabel(application.businessType)}</dd></div><div><dt>Membership</dt><dd>{application.requestedMembershipTier}</dd></div><div><dt>Listing</dt><dd>{application.listingPublicationStatus}</dd></div></dl></section>
      <section className="partnerPortalPanel"><h2>Admin feedback</h2><RequestedChangesList changes={application.requestedChanges} />{application.adminNotes.length ? <ul className="requestedChangesList">{application.adminNotes.map((note, index) => <li key={`${note}-${index}`}>{note}</li>)}</ul> : <p>No admin notes.</p>}</section>
      <section className="partnerPortalPanel"><h2>Application timeline</h2><ApplicationTimeline timeline={application.timeline} /></section>
    </div>
  );
}
