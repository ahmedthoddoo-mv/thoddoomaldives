import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const adminSessionCookieName = "ithoddoo_admin_demo_session";

const sessionDurationMs = 8 * 60 * 60 * 1000;

type AdminSessionPayload = {
  issuedAt: number;
  expiresAt: number;
};

type AdminCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
  expires?: Date;
  maxAge?: number;
};

export function isAdminDemoPasswordConfigured() {
  return Boolean(process.env.ADMIN_DEMO_PASSWORD);
}

function getAdminDemoPassword() {
  return process.env.ADMIN_DEMO_PASSWORD ?? "";
}

function getCookieOptions(expiresAt?: number): AdminCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    ...(expiresAt ? { expires: new Date(expiresAt) } : {})
  };
}

function signPayload(payload: string) {
  return createHmac("sha256", getAdminDemoPassword()).update(payload).digest("base64url");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function createSessionValue() {
  const issuedAt = Date.now();
  const payload: AdminSessionPayload = {
    issuedAt,
    expiresAt: issuedAt + sessionDurationMs
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifySessionValue(value?: string) {
  if (!value || !isAdminDemoPasswordConfigured()) {
    return false;
  }

  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = signPayload(encodedPayload);
  if (!safeCompare(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<AdminSessionPayload>;
    return typeof payload.expiresAt === "number" && payload.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export async function hasAdminDemoSession() {
  const cookieStore = await cookies();
  return verifySessionValue(cookieStore.get(adminSessionCookieName)?.value);
}

export async function createAdminDemoSession() {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + sessionDurationMs;

  cookieStore.set(adminSessionCookieName, createSessionValue(), getCookieOptions(expiresAt));
}

export async function clearAdminDemoSession() {
  const cookieStore = await cookies();

  cookieStore.set(adminSessionCookieName, "", {
    ...getCookieOptions(),
    expires: new Date(0),
    maxAge: 0
  });
}

export function isValidAdminDemoPassword(password: string) {
  const expectedPassword = getAdminDemoPassword();

  if (!expectedPassword) {
    return false;
  }

  return safeCompare(password, expectedPassword);
}
