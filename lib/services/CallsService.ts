import { CallsRepo, CallsFilter } from "@/lib/repos/CallsRepo";
import { ICall } from "@/lib/db/models/Call";
import { AppError } from "@/lib/errors";
import { isGroqAvailable, summarizeCall } from "@/lib/ai/groq";

export class CallsService {
  static async getCalls(userId: string, filter?: CallsFilter): Promise<ICall[]> {
    return CallsRepo.findByUserId(userId, filter);
  }

  static async getCall(id: string, userId: string): Promise<ICall> {
    const call = await CallsRepo.findById(id, userId);
    if (!call) {
      throw new AppError("Call not found", 404, "CALL_NOT_FOUND");
    }
    return call;
  }

  static async createCall(
    userId: string,
    data: {
      repId: string;
      title: string;
      occurredAt: Date;
      transcriptText: string;
      source: "paste" | "upload";
    }
  ): Promise<ICall> {
    if (!data.transcriptText.trim()) {
      throw new AppError("Transcript text is required", 400, "INVALID_INPUT");
    }

    if (data.transcriptText.length > 50000) {
      throw new AppError("Transcript is too long (max 50,000 characters)", 400, "INVALID_INPUT");
    }

    let category: string | undefined;
    let tags: string[] | undefined;

    // Best-effort auto-categorization using Groq when available
    if (isGroqAvailable()) {
      try {
        const fakeCallForClassification = {
          // Only fields used by summarizeCall are needed here
          transcriptText: data.transcriptText,
          repId: undefined as unknown as any,
        } as ICall;

        const summaryResult = await summarizeCall(fakeCallForClassification);
        category = summaryResult.category;
        tags = summaryResult.tags;
      } catch (error) {
        console.error("Error auto-classifying call category:", error);
      }
    }

    return CallsRepo.create({
      userId,
      ...data,
      category,
      tags,
    });
  }

  static async updateCall(
    id: string,
    userId: string,
    data: Partial<ICall>
  ): Promise<ICall> {
    const call = await CallsRepo.update(id, userId, data);
    if (!call) {
      throw new AppError("Call not found", 404, "CALL_NOT_FOUND");
    }
    return call;
  }

  static async deleteCall(id: string, userId: string): Promise<void> {
    const deleted = await CallsRepo.delete(id, userId);
    if (!deleted) {
      throw new AppError("Call not found", 404, "CALL_NOT_FOUND");
    }
  }
}

