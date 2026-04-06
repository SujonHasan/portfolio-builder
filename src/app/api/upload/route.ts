import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { withAuth } from "@/lib/auth-guard";
import crypto from "crypto";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const ALLOWED_FOLDERS = ["projects", "profile", "certifications", "seo"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  return withAuth(req, async (request) => {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const rawFolder = (formData.get("folder") as string) || "projects";

      // Prevent path traversal - only allow whitelisted folder names
      const folder = ALLOWED_FOLDERS.includes(rawFolder) ? rawFolder : "projects";

      if (!file) {
        return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
      }

      if (!ALLOWED_TYPES[file.type]) {
        return NextResponse.json(
          { success: false, error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { success: false, error: "File too large. Maximum 5MB" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Get extension from MIME type, not from user filename
      const ext = ALLOWED_TYPES[file.type];
      const filename = `${crypto.randomUUID()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);

      const url = `/uploads/${folder}/${filename}`;
      return NextResponse.json({ success: true, data: { url } });
    } catch {
      return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 });
    }
  });
}
