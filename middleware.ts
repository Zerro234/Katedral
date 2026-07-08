import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isLoggedIn = !!session;
  const userRole = session?.user?.role as string | undefined;

  // ============================================
  // Auth pages: redirect to dashboard if already logged in
  // ============================================
  if (
    pathname.startsWith("/masuk") ||
    pathname.startsWith("/daftar") ||
    pathname.startsWith("/cek-email")
  ) {
    if (isLoggedIn) {
      return redirectToDashboard(request, userRole);
    }
    return NextResponse.next();
  }

  // ============================================
  // Protected routes: redirect to login if not authenticated
  // ============================================
  const isProtectedRoute =
    pathname.startsWith("/dasbor") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/romo");

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/masuk", request.url));
  }

  // ============================================
  // Role-based access control
  // ============================================

  // /dasbor/* — only COUPLE
  if (pathname.startsWith("/dasbor")) {
    if (userRole !== "COUPLE") {
      return redirectToDashboard(request, userRole);
    }
  }

  // /admin/* — only ADMIN
  if (pathname.startsWith("/admin")) {
    if (userRole !== "ADMIN") {
      return redirectToDashboard(request, userRole);
    }
  }

  // /romo/* — only PRIEST
  if (pathname.startsWith("/romo")) {
    if (userRole !== "PRIEST") {
      return redirectToDashboard(request, userRole);
    }
  }

  return NextResponse.next();
}

/**
 * Redirect user to their role-appropriate dashboard
 */
function redirectToDashboard(
  request: NextRequest,
  role: string | undefined
): NextResponse {
  switch (role) {
    case "ADMIN":
      return NextResponse.redirect(new URL("/admin/ringkasan", request.url));
    case "PRIEST":
      return NextResponse.redirect(new URL("/romo/jadwal", request.url));
    case "COUPLE":
    default:
      return NextResponse.redirect(new URL("/dasbor/beranda", request.url));
  }
}

export const config = {
  runtime: "nodejs", // Required for Better Auth API calls
  matcher: [
    "/dasbor/:path*",
    "/admin/:path*",
    "/romo/:path*",
    "/masuk",
    "/daftar",
    "/cek-email",
  ],
};
