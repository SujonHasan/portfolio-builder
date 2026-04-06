import mongoose, { Schema, Document } from "mongoose";

export interface ISiteDocument extends Document {
  ownerUserId: mongoose.Types.ObjectId;
  username: string;
  subdomain: string;
  title: string;
  publishStatus: "draft" | "published";
  onboardingCompleted: boolean;
}

const siteSchema = new Schema<ISiteDocument>(
  {
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    subdomain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true },
    publishStatus: { type: String, enum: ["draft", "published"], default: "draft" },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Site || mongoose.model<ISiteDocument>("Site", siteSchema);
