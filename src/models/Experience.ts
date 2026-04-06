import mongoose, { Schema } from "mongoose";

const experienceSchema = new Schema(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true, index: true },
    company: { type: String, required: true },
    position: { type: String, required: true },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    current: { type: Boolean, default: false },
    location: { type: String, default: "" },
    companyUrl: { type: String, default: "" },
    technologies: [{ type: String }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Experience || mongoose.model("Experience", experienceSchema);
