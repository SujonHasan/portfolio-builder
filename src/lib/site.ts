import mongoose from "mongoose";
import { NextRequest } from "next/server";
import Site, { ISiteDocument } from "@/models/Site";
import User, { IUserDocument } from "@/models/User";
import { slugify } from "@/lib/utils";
import { connectDB } from "@/lib/db";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "admin",
  "api",
  "preview",
  "localhost",
]);

function getDb() {
  return mongoose.connection.db!;
}

async function getNextAvailableUsername(base: string) {
  const normalizedBase = normalizeUsername(base);
  let candidate = normalizedBase;
  let suffix = 1;

  while (RESERVED_SUBDOMAINS.has(candidate) || (await Site.findOne({ username: candidate }).lean())) {
    suffix += 1;
    candidate = `${normalizedBase}-${suffix}`;
  }

  return candidate;
}

export function normalizeUsername(value?: string | null) {
  const normalized = slugify(value || "");
  return normalized || "portfolio";
}

export async function ensureUniqueUsername(value?: string | null, excludeSiteId?: string) {
  const base = normalizeUsername(value);
  let candidate = base;
  let suffix = 1;

  while (
    RESERVED_SUBDOMAINS.has(candidate) ||
    (await Site.findOne({
      username: candidate,
      ...(excludeSiteId ? { _id: { $ne: excludeSiteId } } : {}),
    }).lean())
  ) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}

async function migrateLegacyContentToSite(siteId: string) {
  const db = getDb();
  const objectSiteId = new mongoose.Types.ObjectId(siteId);
  const collections = [
    "abouts",
    "projects",
    "skills",
    "experiences",
    "education",
    "certifications",
    "contacts",
    "seos",
    "analytics",
    "portfolio_settings",
    "theme_settings",
  ];

  for (const name of collections) {
    const collection = db.collection(name);
    await collection.updateMany(
      { siteId: { $exists: false } },
      {
        $set: { siteId: objectSiteId },
      }
    );
  }
}

function getDerivedUsernameSource(user: Pick<IUserDocument, "name" | "email">) {
  const fromName = normalizeUsername(user.name);
  if (fromName && fromName !== "portfolio") {
    return fromName;
  }

  return normalizeUsername(user.email.split("@")[0]);
}

export async function ensureUserSite(user: IUserDocument) {
  await connectDB();

  if (user.primarySiteId) {
    const existing = await Site.findById(user.primarySiteId);
    if (existing) {
      return existing;
    }
  }

  const existingSite = await Site.findOne({ ownerUserId: user._id });
  if (existingSite) {
    if (!user.primarySiteId || String(user.primarySiteId) !== String(existingSite._id)) {
      user.primarySiteId = existingSite._id as mongoose.Types.ObjectId;
      await user.save();
    }
    return existingSite;
  }

  const siteCount = await Site.countDocuments();
  const username = await getNextAvailableUsername(getDerivedUsernameSource(user));
  const site = await Site.create({
    ownerUserId: user._id,
    username,
    subdomain: username,
    title: `${user.name}'s Portfolio`,
    publishStatus: "draft",
    onboardingCompleted: false,
  });

  user.primarySiteId = site._id as mongoose.Types.ObjectId;
  await user.save();

  if (siteCount === 0) {
    await migrateLegacyContentToSite(site._id.toString());
  }

  return site;
}

export async function createSiteForUser(user: IUserDocument) {
  return ensureUserSite(user);
}

export async function getSiteForUser(userId: string) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  return ensureUserSite(user);
}

export async function getSiteByUsername(username: string) {
  await connectDB();
  return Site.findOne({ username: normalizeUsername(username) }).lean<ISiteDocument | null>();
}

export async function getSiteById(siteId: string) {
  await connectDB();
  return Site.findById(siteId).lean<ISiteDocument | null>();
}

export function getRequestedUsername(req: NextRequest) {
  const searchParam = req.nextUrl.searchParams.get("site");
  if (searchParam) {
    return normalizeUsername(searchParam);
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const normalizedHost = host.split(":")[0].toLowerCase();
  const parts = normalizedHost.split(".");

  if (normalizedHost.endsWith(".localhost") && parts.length > 1) {
    const subdomain = parts[0];
    if (!RESERVED_SUBDOMAINS.has(subdomain)) {
      return subdomain;
    }
  }

  if (parts.length > 2) {
    const subdomain = parts[0];
    if (!RESERVED_SUBDOMAINS.has(subdomain)) {
      return subdomain;
    }
  }

  return null;
}

export async function resolvePublicSiteFromRequest(req: NextRequest) {
  const username = getRequestedUsername(req);
  if (!username) {
    return null;
  }

  await connectDB();
  return Site.findOne({
    username: normalizeUsername(username),
    publishStatus: "published",
  }).lean<ISiteDocument | null>();
}
