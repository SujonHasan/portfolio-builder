import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { IAbout } from "@/types";

type AboutRecord = Record<string, unknown> & {
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  siteId?: mongoose.Types.ObjectId;
};

async function getAboutCollection() {
  const connection = await connectDB();
  return connection.connection.db!.collection<AboutRecord>("abouts");
}

export async function getAboutBySiteId(siteId: string) {
  const collection = await getAboutCollection();
  return collection.findOne(
    { siteId: new mongoose.Types.ObjectId(siteId) },
    { sort: { updatedAt: -1, createdAt: -1 } }
  ) as Promise<IAbout | null>;
}

export async function getLatestAboutLean(siteId?: string) {
  if (!siteId) {
    return null;
  }

  return getAboutBySiteId(siteId);
}

export async function getLatestAboutQuery(siteId?: string) {
  return getLatestAboutLean(siteId);
}

export async function saveAboutSingleton(siteId: string, data: Record<string, unknown>) {
  const collection = await getAboutCollection();
  const now = new Date();
  const objectSiteId = new mongoose.Types.ObjectId(siteId);
  const existing = await collection.findOne(
    { siteId: objectSiteId },
    { sort: { updatedAt: -1, createdAt: -1 } }
  );

  if (existing?._id) {
    await collection.updateOne(
      { _id: existing._id },
      {
        $set: {
          ...data,
          siteId: objectSiteId,
          updatedAt: now,
        },
      }
    );

    return collection.findOne({ _id: existing._id });
  }

  const result = await collection.insertOne({
    ...data,
    siteId: objectSiteId,
    createdAt: now,
    updatedAt: now,
  });

  return collection.findOne({ _id: result.insertedId });
}
