"use client";

import { useState } from "react";
import { AdminImagePicker } from "@/components/admin/AdminImagePicker";
import { mediaAssets } from "@/data/adminCms";
import { partnerProfile } from "@/data/partnerPortal";

export function PartnerProfileEditor() {
  const [profile, setProfile] = useState(partnerProfile);

  function updateField<Field extends keyof typeof partnerProfile>(field: Field, value: (typeof partnerProfile)[Field]) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="partnerPortalTwoColumn">
      <section className="partnerPortalPanel">
        <div className="partnerPortalSectionHeader">
          <p className="eyebrow">Business profile</p>
          <h2>Editable Listing Details</h2>
        </div>
        <div className="partnerPortalFormGrid">
          <label className="partnerPortalWide">
            <span>Business Name</span>
            <input value={profile.businessName} onChange={(event) => updateField("businessName", event.target.value)} />
          </label>
          <label className="partnerPortalWide">
            <span>Description</span>
            <textarea value={profile.description} onChange={(event) => updateField("description", event.target.value)} rows={5} />
          </label>
          <label>
            <span>Logo</span>
            <input value={profile.logo} onChange={(event) => updateField("logo", event.target.value)} />
          </label>
          <label>
            <span>Cover Image</span>
            <input value={profile.coverImage} onChange={(event) => updateField("coverImage", event.target.value)} />
          </label>
          <label>
            <span>WhatsApp</span>
            <input value={profile.whatsapp} onChange={(event) => updateField("whatsapp", event.target.value)} />
          </label>
          <label>
            <span>Email</span>
            <input value={profile.email} onChange={(event) => updateField("email", event.target.value)} />
          </label>
          <label>
            <span>Website</span>
            <input value={profile.website} onChange={(event) => updateField("website", event.target.value)} />
          </label>
          <label>
            <span>Map</span>
            <input value={profile.map} onChange={(event) => updateField("map", event.target.value)} />
          </label>
          <label className="partnerPortalWide">
            <span>Address</span>
            <input value={profile.address} onChange={(event) => updateField("address", event.target.value)} />
          </label>
          <label className="partnerPortalWide">
            <span>Social Media</span>
            <textarea
              value={profile.socialMedia.join("\n")}
              onChange={(event) => updateField("socialMedia", event.target.value.split("\n").filter(Boolean))}
              rows={3}
            />
          </label>
          <label className="partnerPortalWide">
            <span>Policies</span>
            <textarea
              value={profile.policies.join("\n")}
              onChange={(event) => updateField("policies", event.target.value.split("\n").filter(Boolean))}
              rows={4}
            />
          </label>
          <label className="partnerPortalWide">
            <span>Languages</span>
            <input
              value={profile.languages.join(", ")}
              onChange={(event) => updateField("languages", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
            />
          </label>
        </div>
        <div className="partnerPortalMediaPicker">
          <AdminImagePicker
            assets={mediaAssets}
            onSelectPath={(path) => updateField("coverImage", path)}
            selectedPaths={[profile.coverImage]}
          />
        </div>
      </section>

      <aside className="partnerPortalPanel partnerPortalProfilePreview">
        <div style={{ backgroundImage: `url('${profile.coverImage}')` }} />
        <span>{profile.logo}</span>
        <h2>{profile.businessName}</h2>
        <p>{profile.description}</p>
        <small>{profile.address}</small>
        <div className="partnerPortalPills">
          <span>{profile.membershipPlan}</span>
          <span>{profile.verificationStatus}</span>
          <span>{profile.profileCompletion} complete</span>
        </div>
      </aside>
    </div>
  );
}
