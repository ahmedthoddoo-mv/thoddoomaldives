"use client";

import { useState, useTransition } from "react";
import { savePartnerBusinessProfile } from "@/app/partner/actions";
import { AdminImagePicker } from "@/components/admin/AdminImagePicker";
import { partnerProfile } from "@/data/partnerPortal";
import { MediaRepository } from "@/lib/repositories";
import type { PartnerPortalProfileForm } from "@/lib/partner-portal/partnerAccess";

type PartnerProfileEditorProps = {
  initialProfile?: PartnerPortalProfileForm;
};

function toEditableProfile(profile: typeof partnerProfile): PartnerPortalProfileForm {
  return {
    businessName: profile.businessName,
    shortDescription: profile.description,
    description: profile.description,
    address: profile.address,
    googleMaps: profile.map,
    whatsapp: profile.whatsapp,
    email: profile.email,
    website: profile.website,
    instagram: profile.socialMedia[0] ?? "",
    facebook: profile.socialMedia[1] ?? "",
    operatingHours: "Daily by WhatsApp",
    languages: profile.languages,
    amenities: ["Wi-Fi", "Breakfast", "Transfer support"],
    policies: profile.policies,
    seoTitle: `${profile.businessName} | iThoddoo Maldives`,
    seoDescription: profile.description
  };
}

export function PartnerProfileEditor({ initialProfile }: PartnerProfileEditorProps) {
  const [profile, setProfile] = useState<PartnerPortalProfileForm>(initialProfile ?? toEditableProfile(partnerProfile));
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const mediaAssets = MediaRepository.findAll();

  function updateField<Field extends keyof PartnerPortalProfileForm>(field: Field, value: PartnerPortalProfileForm[Field]) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function saveProfile() {
    startTransition(async () => {
      const result = await savePartnerBusinessProfile(profile);
      setMessage(result.message);
    });
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
            <span>Short Description</span>
            <input value={profile.shortDescription} onChange={(event) => updateField("shortDescription", event.target.value)} />
          </label>
          <label className="partnerPortalWide">
            <span>Description</span>
            <textarea value={profile.description} onChange={(event) => updateField("description", event.target.value)} rows={5} />
          </label>
          <label>
            <span>Operating Hours</span>
            <input value={profile.operatingHours} onChange={(event) => updateField("operatingHours", event.target.value)} />
          </label>
          <label>
            <span>Instagram</span>
            <input value={profile.instagram} onChange={(event) => updateField("instagram", event.target.value)} />
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
            <input value={profile.googleMaps} onChange={(event) => updateField("googleMaps", event.target.value)} />
          </label>
          <label>
            <span>Facebook</span>
            <input value={profile.facebook} onChange={(event) => updateField("facebook", event.target.value)} />
          </label>
          <label className="partnerPortalWide">
            <span>Address</span>
            <input value={profile.address} onChange={(event) => updateField("address", event.target.value)} />
          </label>
          <label className="partnerPortalWide">
            <span>Amenities</span>
            <textarea
              value={profile.amenities.join("\n")}
              onChange={(event) => updateField("amenities", event.target.value.split("\n").filter(Boolean))}
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
          <label className="partnerPortalWide">
            <span>SEO Title</span>
            <input value={profile.seoTitle} onChange={(event) => updateField("seoTitle", event.target.value)} />
          </label>
          <label className="partnerPortalWide">
            <span>SEO Description</span>
            <textarea value={profile.seoDescription} onChange={(event) => updateField("seoDescription", event.target.value)} rows={3} />
          </label>
        </div>
        <div className="partnerPortalActions">
          <button disabled={isPending} onClick={saveProfile} type="button">
            {isPending ? "Saving..." : "Save to Supabase"}
          </button>
        </div>
        {message ? <p className="propertySaveStatus propertySaveStatusSuccess">{message}</p> : null}
        <div className="partnerPortalMediaPicker">
          <AdminImagePicker
            assets={mediaAssets}
            onSelectPath={() => setMessage("Use Gallery to change cover or hero images.")}
            selectedPaths={[]}
          />
        </div>
      </section>

      <aside className="partnerPortalPanel partnerPortalProfilePreview">
        <div style={{ backgroundImage: "url('/images/hero-thoddoo.jpg')" }} />
        <span>{profile.businessName.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")}</span>
        <h2>{profile.businessName}</h2>
        <p>{profile.description}</p>
        <small>{profile.address}</small>
        <div className="partnerPortalPills">
          <span>{profile.operatingHours || "Hours pending"}</span>
          <span>{profile.languages.length} languages</span>
          <span>{profile.amenities.length} amenities</span>
        </div>
      </aside>
    </div>
  );
}
