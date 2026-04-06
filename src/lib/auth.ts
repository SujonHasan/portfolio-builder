import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable");
}
const secret = new TextEncoder().encode(JWT_SECRET);

export async function signToken(userId: string, siteId: string): Promise<string> {
  return new SignJWT({ userId, siteId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<{ userId: string; siteId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; siteId: string };
  } catch {
    return null;
  }
}

export function extractTokenFromRequest(req: NextRequest) {
  const cookieToken = req.cookies.get("token")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1] || null;
}

export async function getAuthPayloadFromRequest(req: NextRequest) {
  const token = extractTokenFromRequest(req);
  if (!token) {
    return null;
  }

  return verifyToken(token);
}
