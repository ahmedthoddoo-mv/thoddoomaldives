import { NextResponse, type NextRequest } from "next/server";

const partnerAccessTokenCookie = "ithoddoo_partner_access_token";

const publicPartnerRoutes = new Set([
  "/partner/login",
  "/partner/forgot-password",
  "/partner/reset-password"
]);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!pathname.startsWith("/partner")) {
    return NextResponse.next();
  }

  if (publicPartnerRoutes.has(pathname)) {
    return NextResponse.next();
  }

  if (process.env.NEXT_PUBLIC_DATA_MODE !== "supabase") {
    return NextResponse.next();
  }

  const hasPartnerSession = Boolean(request.cookies.get(partnerAccessTokenCookie)?.value);
  if (hasPartnerSession) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/partner/login";
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/partner/:path*"]
};
