"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

function getTurnstile() {
  return (window as unknown as {
    turnstile?: {
      remove?: (widgetId: string) => void;
      render: (
        container: HTMLElement,
        options: {
          action?: string;
          callback?: (token: string) => void;
          "error-callback"?: (errorCode: string) => void;
          "expired-callback"?: () => void;
          "unsupported-callback"?: () => void;
          sitekey: string;
        },
      ) => string;
      reset?: (widgetId?: string) => void;
    };
  }).turnstile;
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetInstanceIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const hasSiteKey = Boolean(siteKey);

  useEffect(() => {
    return () => {
      const turnstile = getTurnstile();
      if (widgetInstanceIdRef.current && turnstile?.remove) {
        turnstile.remove(widgetInstanceIdRef.current);
      }
      widgetInstanceIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    const turnstile = getTurnstile();

    if (!hasSiteKey) {
      return;
    }

    if (!containerRef.current) {
      return;
    }

    if (!turnstile && !scriptReady) {
      return;
    }

    if (!turnstile) {
      return;
    }

    if (widgetInstanceIdRef.current) {
      return;
    }

    const resolvedSiteKey = siteKey;
    if (!resolvedSiteKey) {
      return;
    }

    widgetInstanceIdRef.current = turnstile.render(containerRef.current, {
      sitekey: resolvedSiteKey,
      action,
      callback: onToken,
      "expired-callback": () => {
        onToken("");
      },
    });
  }, [action, hasSiteKey, onToken, scriptReady, siteKey, widgetId]);

  if (!siteKey) {
    return <p className="mutedText">Enquiry protection is not configured.</p>;
  }

  return (
    <>
      <Script
        src={TURNSTILE_SCRIPT_SRC}
        strategy="afterInteractive"
        onLoad={() => {
          setScriptReady(true);
        }}
      />
      <div
        ref={containerRef}
        data-sitekey={siteKey}
        data-widget-id={widgetId}
      />
    </>
  );
}
