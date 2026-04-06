import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "api", "preview", "localhost"]);

function getAppHostname() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return null;
  }

  try {
    return new URL(appUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function getRequestSubdomain(normalizedHost: string) {
  const appHostname = getAppHostname();

  if (normalizedHost.endsWith(".localhost")) {
    const subdomain = normalizedHost.split(".")[0];
    return RESERVED_SUBDOMAINS.has(subdomain) ? null : subdomain;
  }

  if (appHostname) {
    if (normalizedHost === appHostname) {
      return null;
    }

    if (normalizedHost.endsWith(`.${appHostname}`)) {
      const subdomain = normalizedHost.slice(0, -(`.${appHostname}`.length)).split(".")[0];
      return RESERVED_SUBDOMAINS.has(subdomain) ? null : subdomain;
    }
  }

  if (normalizedHost.endsWith(".vercel.app")) {
    return null;
  }

  const parts = normalizedHost.split(".");
  if (parts.length > 2) {
    const subdomain = parts[0];
    return RESERVED_SUBDOMAINS.has(subdomain) ? null : subdomain;
  }

  return null;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const normalizedHost = host.split(":")[0].toLowerCase();
  const subdomain = getRequestSubdomain(normalizedHost);

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

  if (pathname === "/" && subdomain) {
    const url = req.nextUrl.clone();
    url.pathname = `/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
