import mongoose, { Schema } from "mongoose";

const skillSchema = new Schema(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["frontend", "backend", "database", "tools", "other"],
      default: "other",
    },
    proficiency: { type: Number, min: 0, max: 100, default: 50 },
    icon: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Skill || mongoose.model("Skill", skillSchema);
