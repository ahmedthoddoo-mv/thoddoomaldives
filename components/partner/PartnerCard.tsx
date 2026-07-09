import type { Partner, PartnerCategoryDefinition } from "@/types/partner";
import { PartnerBadge } from "./PartnerBadge";

type PartnerCardProps = {
  partner: Partner;
  category?: PartnerCategoryDefinition;
};

export function PartnerCard({ partner, category }: PartnerCardProps) {
  return (
    <article className="partnerCard">
      <div className="partnerCardMedia" role="img" aria-label={`${partner.name} visual placeholder`}>
        <span>{category?.label ?? partner.category}</span>
      </div>
      <div className="partnerCardBody">
        <div className="partnerCardHeader">
          <div>
            <p className="eyebrow">{category?.label}</p>
            <h3>{partner.name}</h3>
          </div>
          <PartnerBadge tier={partner.membershipTier} verificationStatus={partner.verificationStatus} />
        </div>
        <p>{partner.shortDescription}</p>
        <div className="partnerTagList">
          {partner.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
