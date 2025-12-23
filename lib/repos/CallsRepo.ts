import { Call, ICall } from "@/lib/db/models/Call";
import { Rep } from "@/lib/db/models/Rep"; // Ensure Rep model is registered before populate
import { connectDB } from "@/lib/db/connection";
import mongoose from "mongoose";

export interface CallsFilter {
  repId?: string;
  from?: Date;
  to?: Date;
  minScore?: number;
  maxScore?: number;
}

export class CallsRepo {
  static async findByUserId(
    userId: string,
    filter?: CallsFilter
  ): Promise<ICall[]> {
    await connectDB();
    const query: any = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (filter?.repId) {
      query.repId = new mongoose.Types.ObjectId(filter.repId);
    }

    if (filter?.from || filter?.to) {
      query.occurredAt = {};
      if (filter.from) query.occurredAt.$gte = filter.from;
      if (filter.to) query.occurredAt.$lte = filter.to;
    }

    if (filter?.minScore !== undefined || filter?.maxScore !== undefined) {
      query["score.overall"] = {};
      if (filter.minScore !== undefined) query["score.overall"].$gte = filter.minScore;
      if (filter.maxScore !== undefined) query["score.overall"].$lte = filter.maxScore;
    }

    const calls = await Call.find(query)
      .populate("repId", "name roleTitle")
      .sort({ occurredAt: -1 })
      .lean();
    return calls as unknown as ICall[];
  }

  static async findById(id: string, userId: string): Promise<ICall | null> {
    await connectDB();
    const call = await Call.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    })
      .populate("repId", "name roleTitle")
      .lean();
    return call as unknown as ICall | null;
  }

  static async create(data: {
    userId: string;
    repId: string;
    title: string;
    occurredAt: Date;
    transcriptText: string;
    source: "paste" | "upload";
    category?: string;
    tags?: string[];
  }): Promise<ICall> {
    await connectDB();
    const call = new Call({
      ...data,
      userId: new mongoose.Types.ObjectId(data.userId),
      repId: new mongoose.Types.ObjectId(data.repId),
    });
    await call.save();
    return call.toObject();
  }

  static async update(
    id: string,
    userId: string,
    data: Partial<ICall>
  ): Promise<ICall | null> {
    await connectDB();
    const call = await Call.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      },
      data,
      { new: true }
    )
      .populate("repId", "name roleTitle")
      .lean();
    return call as unknown as ICall | null;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    await connectDB();
    const result = await Call.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });
    return result.deletedCount > 0;
  }

  static async getStats(userId: string): Promise<{
    total: number;
    avgScore: number;
    topObjection: string | null;
  }> {
    await connectDB();
    const calls = await Call.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    const total = calls.length;
    const scores = calls
      .filter((c) => c.score?.overall !== undefined)
      .map((c) => c.score!.overall);
    const avgScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const objectionCounts: Record<string, number> = {};
    calls.forEach((call) => {
      call.objections?.forEach((obj: { type: string }) => {
        objectionCounts[obj.type] = (objectionCounts[obj.type] || 0) + 1;
      });
    });

    const topObjection =
      Object.keys(objectionCounts).length > 0
        ? Object.entries(objectionCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null;

    return { total, avgScore: Math.round(avgScore * 10) / 10, topObjection };
  }
}

