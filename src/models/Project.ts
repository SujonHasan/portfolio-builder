import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String },
    description: { type: String, required: true },
    shortDescription: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    images: [{ type: String }],
    technologies: [{ type: String }],
    category: { type: String, default: "web" },
    liveUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    status: { type: String, enum: ["published", "draft"], default: "published" },
  },
  { timestamps: true }
);

projectSchema.index({ siteId: 1, slug: 1 }, { unique: true, sparse: true });

projectSchema.pre("save", function () {
  if (!this.slug || this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

export default mongoose.models.Project || mongoose.model("Project", projectSchema);
