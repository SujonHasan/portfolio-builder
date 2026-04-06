import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const normalizedHost = host.split(":")[0].toLowerCase();
  const parts = normalizedHost.split(".");
  const isSubdomain =
    (normalizedHost.endsWith(".localhost") && parts.length > 1) ||
    parts.length > 2;
  const subdomain = isSubdomain ? parts[0] : "";

  if (pathname === "/admin/login" || pathname === "/admin/register") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL("/admin/login", req.url));
      response.cookies.delete("token");
      return response;
    }
  }

  if (
    pathname === "/" &&
    isSubdomain &&
    !["www", "app", "admin", "api", "preview", "localhost"].includes(subdomain)
  ) {
    const url = req.nextUrl.clone();
    url.pathname = `/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
