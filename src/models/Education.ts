import mongoose, { Schema } from "mongoose";

const educationSchema = new Schema(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true, index: true },
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    current: { type: Boolean, default: false },
    grade: { type: String, default: "" },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Education || mongoose.model("Education", educationSchema);
