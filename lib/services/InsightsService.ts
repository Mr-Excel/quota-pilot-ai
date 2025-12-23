import { CallsRepo } from "@/lib/repos/CallsRepo";
import { ICall } from "@/lib/db/models/Call";
import mongoose from "mongoose";

export interface InsightsOverview {
  totalCalls: number;
  avgScore: number;
  scoreTrend: Array<{ date: string; score: number }>;
  objectionFrequency: Array<{ type: string; count: number }>;
  repPerformance: Array<{
    repId: string;
    repName: string;
    avgScore: number;
    callCount: number;
    topCoachingArea: string;
  }>;
}

export class InsightsService {
  static async getOverview(userId: string): Promise<InsightsOverview> {
    const calls = await CallsRepo.findByUserId(userId);

    const totalCalls = calls.length;

    const scoredCalls = calls.filter((c) => c.score?.overall !== undefined);
    const avgScore =
      scoredCalls.length > 0
        ? scoredCalls.reduce((sum, c) => sum + (c.score?.overall || 0), 0) /
          scoredCalls.length
        : 0;

    // Score trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCalls = calls.filter(
      (c) => new Date(c.occurredAt) >= thirtyDaysAgo && c.score?.overall !== undefined
    );

    const scoreTrendMap = new Map<string, number[]>();
    recentCalls.forEach((call) => {
      const date = new Date(call.occurredAt).toISOString().split("T")[0];
      if (!scoreTrendMap.has(date)) {
        scoreTrendMap.set(date, []);
      }
      scoreTrendMap.get(date)!.push(call.score!.overall);
    });

    const scoreTrend = Array.from(scoreTrendMap.entries())
      .map(([date, scores]) => ({
        date,
        score: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Objection frequency
    const objectionCounts: Record<string, number> = {};
    calls.forEach((call) => {
      call.objections?.forEach((obj) => {
        objectionCounts[obj.type] = (objectionCounts[obj.type] || 0) + 1;
      });
    });

    const objectionFrequency = Object.entries(objectionCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Rep performance
    const repMap = new Map<
      string,
      {
        repName: string;
        scores: number[];
        callCount: number;
        categories: { discovery: number[]; objections: number[]; clarity: number[]; nextSteps: number[] };
      }
    >();

    calls.forEach((call) => {
      const repId = typeof call.repId === "object" ? call.repId._id.toString() : call.repId.toString();
      const repName =
        typeof call.repId === "object" && "name" in call.repId
          ? call.repId.name
          : "Unknown Rep";

      if (!repMap.has(repId)) {
        repMap.set(repId, {
          repName,
          scores: [],
          callCount: 0,
          categories: { discovery: [], objections: [], clarity: [], nextSteps: [] },
        });
      }

      const rep = repMap.get(repId)!;
      rep.callCount++;

      if (call.score) {
        rep.scores.push(call.score.overall);
        rep.categories.discovery.push(call.score.categories.discovery);
        rep.categories.objections.push(call.score.categories.objections);
        rep.categories.clarity.push(call.score.categories.clarity);
        rep.categories.nextSteps.push(call.score.categories.nextSteps);
      }
    });

    const repPerformance = Array.from(repMap.entries()).map(([repId, data]) => {
      const avgScore =
        data.scores.length > 0
          ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
          : 0;

      // Find lowest average category
      const categoryAvgs = {
        discovery:
          data.categories.discovery.length > 0
            ? data.categories.discovery.reduce((a, b) => a + b, 0) / data.categories.discovery.length
            : 10,
        objections:
          data.categories.objections.length > 0
            ? data.categories.objections.reduce((a, b) => a + b, 0) / data.categories.objections.length
            : 10,
        clarity:
          data.categories.clarity.length > 0
            ? data.categories.clarity.reduce((a, b) => a + b, 0) / data.categories.clarity.length
            : 10,
        nextSteps:
          data.categories.nextSteps.length > 0
            ? data.categories.nextSteps.reduce((a, b) => a + b, 0) / data.categories.nextSteps.length
            : 10,
      };

      const topCoachingArea = Object.entries(categoryAvgs)
        .sort((a, b) => a[1] - b[1])[0][0]
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());

      return {
        repId,
        repName: data.repName,
        avgScore: Math.round(avgScore * 10) / 10,
        callCount: data.callCount,
        topCoachingArea,
      };
    });

    return {
      totalCalls,
      avgScore: Math.round(avgScore * 10) / 10,
      scoreTrend,
      objectionFrequency,
      repPerformance: repPerformance.sort((a, b) => b.avgScore - a.avgScore),
    };
  }
}

