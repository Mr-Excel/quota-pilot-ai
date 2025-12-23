import mongoose, { Schema, Document } from "mongoose";
// Import models to ensure they're registered before Call uses them in populate
import "@/lib/db/models/User";
import "@/lib/db/models/Rep";

export interface IScore {
  overall: number;
  categories: {
    discovery: number;
    objections: number;
    clarity: number;
    nextSteps: number;
  };
  rationale: string;
}

export interface IObjection {
  type: string;
  snippet: string;
  confidence: number;
}

export interface ICall extends Document {
  userId: mongoose.Types.ObjectId;
  repId: mongoose.Types.ObjectId;
  title: string;
  occurredAt: Date;
  transcriptText: string;
  source: "paste" | "upload";
  // High-level category & tags inferred from AI at creation time
  category?: string;
  tags?: string[];
  aiSummary?: string;
  aiCoaching?: string;
  score?: IScore;
  objections?: IObjection[];
  createdAt: Date;
  updatedAt: Date;
}

const ScoreSchema = new Schema<IScore>(
  {
    overall: { type: Number, required: true, min: 0, max: 100 },
    categories: {
      discovery: { type: Number, required: true, min: 0, max: 10 },
      objections: { type: Number, required: true, min: 0, max: 10 },
      clarity: { type: Number, required: true, min: 0, max: 10 },
      nextSteps: { type: Number, required: true, min: 0, max: 10 },
    },
    rationale: { type: String, required: true },
  },
  { _id: false }
);

const ObjectionSchema = new Schema<IObjection>(
  {
    type: { type: String, required: true },
    snippet: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false }
);

const CallSchema = new Schema<ICall>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    repId: {
      type: Schema.Types.ObjectId,
      ref: "Rep",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    occurredAt: {
      type: Date,
      required: true,
      index: true,
    },
    transcriptText: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["paste", "upload"],
      required: true,
    },
    category: {
      type: String,
    },
    tags: {
      type: [String],
      default: undefined,
    },
    aiSummary: {
      type: String,
    },
    aiCoaching: {
      type: String,
    },
    score: {
      type: ScoreSchema,
    },
    objections: {
      type: [ObjectionSchema],
    },
  },
  {
    timestamps: true,
  }
);

CallSchema.index({ userId: 1, occurredAt: -1 });
CallSchema.index({ repId: 1 });

export const Call = mongoose.models.Call || mongoose.model<ICall>("Call", CallSchema);

