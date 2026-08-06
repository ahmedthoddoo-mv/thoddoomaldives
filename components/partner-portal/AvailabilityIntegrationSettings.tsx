"use client";
import { useState, useTransition } from "react";
import { setPartnerAvailabilityProvider } from "@/app/partner/actions";
import type { AvailabilityProvider } from "@/types/availability";

export function AvailabilityIntegrationSettings({ initialProvider }: { initialProvider: AvailabilityProvider }) {
  const [provider,setProvider] = useState(initialProvider); const [message,setMessage] = useState(""); const [pending,startTransition] = useTransition();
  return <section className="partnerPortalPanel"><p className="eyebrow">Availability source</p><h2>Integration settings</h2><p>Select how inventory will be maintained. Provider connections require a supported integration; this site never requests OTA owner passwords.</p><label><span>Provider</span><select value={provider} onChange={(event) => setProvider(event.target.value as AvailabilityProvider)}><option value="manual">Manual calendar</option><option value="pms">PMS</option><option value="channel_manager">Channel manager</option><option value="booking_connectivity_future">Future certified connectivity</option></select></label><div className="partnerPortalActions"><button disabled={pending} type="button" onClick={() => startTransition(async () => setMessage((await setPartnerAvailabilityProvider(provider)).message))}>Save integration preference</button></div><p role="status">{message}</p></section>;
}
