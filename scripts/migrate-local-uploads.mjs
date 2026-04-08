import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";

const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};
const FOLDERS = new Set(["projects", "profile", "certifications", "seo"]);
const missingUploads = new Set();

async function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = await readFile(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
    }
  }
}

await loadEnvFile(path.join(process.cwd(), ".env.local"));

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is missing. Add it to your environment or `.env.local`.");
  process.exit(1);
}

function isLocalUpload(value) {
  return typeof value === "string" && value.startsWith("/uploads/");
}

function getLocalUploadFile(value) {
  const parts = value.split("/").filter(Boolean);
  const folder = parts[1];
  const filename = parts.slice(2).join("/");

  if (!FOLDERS.has(folder) || !filename || filename.includes("..")) {
    return null;
  }

  const filePath = path.join(process.cwd(), "public", "uploads", folder, filename);
  const ext = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[ext];

  if (!contentType || !existsSync(filePath)) {
    missingUploads.add(value);
    return null;
  }

  return { folder, filename, filePath, contentType };
}

async function getOwnerUserId(db, siteId) {
  const site = await db.collection("sites").findOne({ _id: siteId }, { projection: { ownerUserId: 1 } });
  return site?.ownerUserId || null;
}

async function migrateOne(db, siteId, value) {
  const upload = getLocalUploadFile(value);
  if (!upload) {
    return value;
  }

  const ownerUserId = await getOwnerUserId(db, siteId);
  if (!ownerUserId) {
    return value;
  }

  const existing = await db.collection("uploadassets").findOne(
    { siteId, filename: upload.filename },
    { projection: { _id: 1 } }
  );

  if (existing?._id) {
    return `/api/uploads/${existing._id.toString()}`;
  }

  const [data, fileStat] = await Promise.all([readFile(upload.filePath), stat(upload.filePath)]);
  const now = new Date();
  const result = await db.collection("uploadassets").insertOne({
    siteId,
    ownerUserId,
    folder: upload.folder,
    filename: upload.filename,
    contentType: upload.contentType,
    size: fileStat.size,
    data,
    createdAt: now,
    updatedAt: now,
  });

  return `/api/uploads/${result.insertedId.toString()}`;
}

async function migrateStringField(db, collectionName, fieldName) {
  let changed = 0;
  const docs = await db
    .collection(collectionName)
    .find({ [fieldName]: /^\/uploads\// }, { projection: { [fieldName]: 1, siteId: 1 } })
    .toArray();

  for (const doc of docs) {
    if (!doc.siteId) continue;
    const nextValue = await migrateOne(db, doc.siteId, doc[fieldName]);
    if (nextValue !== doc[fieldName]) {
      await db.collection(collectionName).updateOne(
        { _id: doc._id },
        { $set: { [fieldName]: nextValue, updatedAt: new Date() } }
      );
      changed += 1;
    }
  }

  return changed;
}

async function migrateProjectImages(db) {
  let changed = 0;
  const docs = await db
    .collection("projects")
    .find(
      { images: { $elemMatch: { $regex: /^\/uploads\// } } },
      { projection: { images: 1, siteId: 1 } }
    )
    .toArray();

  for (const doc of docs) {
    if (!doc.siteId || !Array.isArray(doc.images)) continue;
    const nextImages = [];

    for (const image of doc.images) {
      nextImages.push(isLocalUpload(image) ? await migrateOne(db, doc.siteId, image) : image);
    }

    if (JSON.stringify(nextImages) !== JSON.stringify(doc.images)) {
      await db.collection("projects").updateOne(
        { _id: doc._id },
        { $set: { images: nextImages, updatedAt: new Date() } }
      );
      changed += 1;
    }
  }

  return changed;
}

async function main() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  const db = mongoose.connection.db;

  const results = {
    aboutProfileImages: await migrateStringField(db, "abouts", "profileImage"),
    projectThumbnails: await migrateStringField(db, "projects", "thumbnail"),
    projectImages: await migrateProjectImages(db),
    certificationImages: await migrateStringField(db, "certifications", "image"),
    seoOgImages: await migrateStringField(db, "seos", "ogImage"),
  };

  console.log("Upload migration complete:", results);
  if (missingUploads.size > 0) {
    console.warn("These DB upload paths were not found in local `public/uploads` and must be re-uploaded:");
    for (const value of missingUploads) {
      console.warn(`- ${value}`);
    }
  }
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Upload migration failed.");
  console.error(error instanceof Error ? error.message : error);
  await mongoose.disconnect();
  process.exit(1);
});
