import { Rep, IRep } from "@/lib/db/models/Rep";
import { connectDB } from "@/lib/db/connection";
import mongoose from "mongoose";

export class RepsRepo {
  static async findByUserId(userId: string): Promise<IRep[]> {
    await connectDB();
    return Rep.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  static async findById(id: string, userId: string): Promise<IRep | null> {
    await connectDB();
    return Rep.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();
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
    return Rep.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      },
      data,
      { new: true }
    ).lean();
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

