import mongoose, { Schema } from "mongoose";

const aboutSchema = new Schema(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true, index: true },
    name: { type: String, required: true },
    tagline: { type: String, default: "" },
    bio: { type: String, required: true },
    profileImage: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    resumeTemplate: {
      type: String,
      enum: ["classic", "compact", "timeline"],
      default: "classic",
    },
    heroDescription: { type: String, default: "" },
    stats: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    socialLinks: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      facebook: { type: String, default: "" },
      website: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

aboutSchema.index({ siteId: 1, updatedAt: -1 });

export default mongoose.models.About || mongoose.model("About", aboutSchema);
