"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    onBookingTurnstileSuccess?: (token: string) => void;
    onBookingTurnstileExpired?: () => void;
    turnstile?: { reset: () => void };
  }
}

export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    window.onBookingTurnstileSuccess = onToken;
    window.onBookingTurnstileExpired = () => onToken("");
    return () => {
      delete window.onBookingTurnstileSuccess;
      delete window.onBookingTurnstileExpired;
    };
  }, [onToken]);

  if (!siteKey) {
    return <p className="mutedText">Enquiry protection is not configured.</p>;
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div
        className="cf-turnstile"
        data-action="turnstile-spin-v2"
        data-callback="onBookingTurnstileSuccess"
        data-expired-callback="onBookingTurnstileExpired"
        data-sitekey={siteKey}
      />
    </>
  );
}
