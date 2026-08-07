"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    __ithoddooTurnstileHandlers?: Record<string, (token: string) => void>;
    __ithoddooTurnstileExpiredHandlers?: Record<string, () => void>;
  }
}

export function TurnstileWidget({
  onToken,
  action = "turnstile-spin-v2",
  siteKey,
  widgetId,
}: {
  onToken: (token: string) => void;
  action?: string;
  siteKey?: string;
  widgetId: string;
}) {
  const callbackName = `onTurnstileSuccess_${widgetId}`;
  const expiredCallbackName = `onTurnstileExpired_${widgetId}`;

  useEffect(() => {
    window.__ithoddooTurnstileHandlers ??= {};
    window.__ithoddooTurnstileExpiredHandlers ??= {};
    window.__ithoddooTurnstileHandlers[callbackName] = onToken;
    window.__ithoddooTurnstileExpiredHandlers[expiredCallbackName] = () => onToken("");

    (window as unknown as Record<string, unknown>)[callbackName] = (token: string) => {
      const handler = window.__ithoddooTurnstileHandlers?.[callbackName];
      if (handler) handler(token);
    };
    (window as unknown as Record<string, unknown>)[expiredCallbackName] = () => {
      const handler = window.__ithoddooTurnstileExpiredHandlers?.[expiredCallbackName];
      if (handler) handler();
    };

    return () => {
      delete window.__ithoddooTurnstileHandlers?.[callbackName];
      delete window.__ithoddooTurnstileExpiredHandlers?.[expiredCallbackName];
      delete (window as unknown as Record<string, unknown>)[callbackName];
      delete (window as unknown as Record<string, unknown>)[expiredCallbackName];
    };
  }, [callbackName, expiredCallbackName, onToken]);

  if (!siteKey) {
    return <p className="mutedText">Enquiry protection is not configured.</p>;
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div
        className="cf-turnstile"
        data-action={action}
        data-callback={callbackName}
        data-expired-callback={expiredCallbackName}
        data-sitekey={siteKey}
      />
    </>
  );
}
