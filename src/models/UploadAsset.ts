import mongoose, { Schema, Document } from "mongoose";

export interface IUploadAssetDocument extends Document {
  siteId: mongoose.Types.ObjectId;
  ownerUserId: mongoose.Types.ObjectId;
  folder: "projects" | "profile" | "certifications" | "seo";
  filename: string;
  contentType: string;
  size: number;
  data: Buffer;
}

const uploadAssetSchema = new Schema<IUploadAssetDocument>(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true, index: true },
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    folder: {
      type: String,
      enum: ["projects", "profile", "certifications", "seo"],
      required: true,
      index: true,
    },
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.UploadAsset ||
  mongoose.model<IUploadAssetDocument>("UploadAsset", uploadAssetSchema);
