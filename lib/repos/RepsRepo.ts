import { Rep, IRep } from "@/lib/db/models/Rep";
import { connectDB } from "@/lib/db/connection";
import mongoose from "mongoose";

export class RepsRepo {
  static async findByUserId(userId: string): Promise<IRep[]> {
    await connectDB();
    const reps = await Rep.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
    return reps as unknown as IRep[];
  }

  static async findById(id: string, userId: string): Promise<IRep | null> {
    await connectDB();
    const rep = await Rep.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();
    return rep as unknown as IRep | null;
  }

  static async create(data: {
    userId: string;
    name: string;
    roleTitle: string;
    region?: string;
  }): Promise<IRep> {
    await connectDB();
    const rep = new Rep({
      ...data,
      userId: new mongoose.Types.ObjectId(data.userId),
    });
    await rep.save();
    return rep.toObject();
  }

  static async update(
    id: string,
    userId: string,
    data: Partial<IRep>
  ): Promise<IRep | null> {
    await connectDB();
    const rep = await Rep.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      },
      data,
      { new: true }
    ).lean();
    return rep as unknown as IRep | null;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    await connectDB();
    const result = await Rep.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });
    return result.deletedCount > 0;
  }
}

