import { CallsRepo } from "@/lib/repos/CallsRepo";
import { ICall } from "@/lib/db/models/Call";
import {
  summarizeCall,
  scoreCall,
  detectObjections,
  SummarizeResult,
  ScoreResult,
  ObjectionResult,
  isGroqAvailable,
} from "@/lib/ai/groq";
import { AppError } from "@/lib/errors";

export class AiService {
  static async generateSummary(callId: string, userId: string): Promise<SummarizeResult> {
    const call = await CallsRepo.findById(callId, userId);
    if (!call) {
      throw new AppError("Call not found", 404, "CALL_NOT_FOUND");
    }

    // If summary already exists and we're in demo mode, return cached
    if (call.aiSummary && !isGroqAvailable()) {
      // In demo mode, we'll regenerate to show the flow
      // In production, you might want to return cached
    }

    const result = await summarizeCall(call);

    // Save to database
    await CallsRepo.update(callId, userId, {
      aiSummary: result.summary,
      aiCoaching: result.coachingNotes,
    });

    return result;
  }

  static async generateScore(callId: string, userId: string): Promise<ScoreResult> {
    const call = await CallsRepo.findById(callId, userId);
    if (!call) {
      throw new AppError("Call not found", 404, "CALL_NOT_FOUND");
    }

    const result = await scoreCall(call);

    // Save to database
    await CallsRepo.update(callId, userId, {
      score: result,
    });

    return result;
  }

  static async detectObjections(callId: string, userId: string): Promise<ObjectionResult[]> {
    const call = await CallsRepo.findById(callId, userId);
    if (!call) {
      throw new AppError("Call not found", 404, "CALL_NOT_FOUND");
    }

    const result = await detectObjections(call);

    // Save to database
    await CallsRepo.update(callId, userId, {
      objections: result,
    });

    return result;
  }
}

