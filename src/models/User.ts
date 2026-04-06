import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "editor";
  status: "active" | "pending";
  avatar: string;
  primarySiteId?: mongoose.Types.ObjectId;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["admin", "editor"], default: "editor" },
    status: { type: String, enum: ["active", "pending"], default: "active" },
    avatar: { type: String, default: "" },
    primarySiteId: { type: Schema.Types.ObjectId, ref: "Site", default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUserDocument>("User", userSchema);
