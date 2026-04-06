import mongoose, { Schema } from "mongoose";

const contactSchema = new Schema(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true, index: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    mapEmbedUrl: { type: String, default: "" },
    availability: { type: String, default: "Available for freelance" },
  },
  { timestamps: true }
);

export default mongoose.models.Contact || mongoose.model("Contact", contactSchema);
