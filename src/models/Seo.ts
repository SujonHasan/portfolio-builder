import mongoose, { Schema } from "mongoose";

const seoSchema = new Schema(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true, index: true },
    page: { type: String, required: true, default: "home" },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    keywords: [{ type: String }],
    ogImage: { type: String, default: "" },
    autoGenerate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

seoSchema.index({ siteId: 1, page: 1 }, { unique: true });

export default mongoose.models.Seo || mongoose.model("Seo", seoSchema);
