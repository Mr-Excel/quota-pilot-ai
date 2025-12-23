import mongoose, { Schema, Document } from "mongoose";
// Import User model to ensure it's registered before Rep uses it in ref
import "@/lib/db/models/User";

export interface IRep extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  roleTitle: string;
  region?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RepSchema = new Schema<IRep>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    roleTitle: {
      type: String,
      required: true,
    },
    region: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

RepSchema.index({ userId: 1 });

export const Rep = mongoose.models.Rep || mongoose.model<IRep>("Rep", RepSchema);

