import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: "manager" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["manager", "admin"],
      default: "manager",
    },
  },
  {
    timestamps: true,
  }
);

// Email index is automatically created by unique: true, no need for explicit index

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

