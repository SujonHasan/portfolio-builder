import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function toBuffer(value: unknown): Buffer | null {
  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (value instanceof ArrayBuffer) {
    return Buffer.from(value);
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }

  if (value && typeof value === "object") {
    const binaryValue = value as Record<string, unknown>;

    if (typeof binaryValue.value === "function") {
      const raw = binaryValue.value.call(binaryValue, true);
      const rawBuffer = toBuffer(raw);
      if (rawBuffer) {
        return rawBuffer;
      }
    }

    if (binaryValue.buffer) {
      const nestedBuffer = toBuffer(binaryValue.buffer);
      if (nestedBuffer) {
        return nestedBuffer;
      }
    }

    if (Buffer.isBuffer(binaryValue.data)) {
      return binaryValue.data;
    }

    if (binaryValue.data instanceof Uint8Array) {
      return Buffer.from(binaryValue.data);
    }

    if (binaryValue.data instanceof ArrayBuffer) {
      return Buffer.from(binaryValue.data);
    }

    if (Array.isArray(binaryValue.data)) {
      return Buffer.from(binaryValue.data);
    }
  }

  return null;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 });
  }

  const connection = await connectDB();
  const asset = await connection.connection.db!.collection("uploadassets").findOne(
    { _id: new mongoose.Types.ObjectId(id) },
    {
      projection: {
        contentType: 1,
        data: 1,
      },
    }
  ) as {
    contentType: string;
    data: unknown;
  } | null;

  if (!asset?.data) {
    return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 });
  }

  const buffer = toBuffer(asset.data);
  if (!buffer) {
    return NextResponse.json({ success: false, error: "Image data is invalid" }, { status: 500 });
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": asset.contentType,
      "Content-Length": buffer.byteLength.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
