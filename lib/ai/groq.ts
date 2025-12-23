// Server-only file - Groq should only be accessed from API routes
import Groq from "groq-sdk";
import { ICall } from "@/lib/db/models/Call";
import { env } from "@/lib/env";

// Ensure this file is only used on the server
if (typeof window !== "undefined") {
  throw new Error("Groq client can only be used on the server side");
}

const MAX_TRANSCRIPT_LENGTH = 10000;

let groqClient: Groq | null = null;

const getGroqClient = (): Groq | null => {
  if (typeof window !== "undefined") {
    throw new Error("Groq client can only be used on the server side");
  }
  
  if (!env.GROQ_API_KEY) {
    return null;
  }
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: env.GROQ_API_KEY,
    });
  }
  return groqClient;
};

export const isGroqAvailable = (): boolean => {
  if (typeof window !== "undefined") {
    return false; // Always return false on client side
  }
  return getGroqClient() !== null;
};

const truncateTranscript = (text: string): string => {
  if (text.length <= MAX_TRANSCRIPT_LENGTH) {
    return text;
  }
  return text.substring(0, MAX_TRANSCRIPT_LENGTH) + "\n\n[Transcript truncated...]";
};

export interface SummarizeResult {
  summary: string;
  keyMoments: string[];
  nextSteps: string[];
  coachingNotes: string;
  isSalesCall?: boolean;
  // High-level category for the conversation (e.g. "sales_call", "support", "internal_meeting", "other")
  category?: string;
  // Lightweight tags inferred from the conversation (e.g. ["discovery", "demo", "pricing"])
  tags?: string[];
}

export const summarizeCall = async (
  call: ICall
): Promise<SummarizeResult> => {
  const client = getGroqClient();
  const transcript = truncateTranscript(call.transcriptText);

  if (!client) {
    // Return deterministic mock response
    return {
      summary: `This call between ${call.repId} and the prospect covered key discovery questions about their current process and pain points. The rep demonstrated good listening skills and identified several areas where our solution could help.`,
      keyMoments: [
        "Prospect mentioned current tool limitations at 5:30",
        "Budget discussion at 12:15",
        "Decision timeline shared at 18:00",
      ],
      nextSteps: [
        "Send pricing proposal by end of week",
        "Schedule technical demo for next Tuesday",
        "Follow up on budget approval process",
      ],
      coachingNotes: "Strong discovery work. Consider asking more about the decision-making process earlier in the call. The pricing objection was handled well with a soft close.",
      isSalesCall: true,
      category: "sales_call",
      tags: ["discovery", "pricing", "timeline"],
    };
  }

  try {
    const completion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert conversation analyst, sales coach, and call classifier. You must ALWAYS provide a concise, useful summary and structured insights for the transcript, even if it is not a sales call. Additionally, you must classify whether it is a sales call and infer a high-level category and tags.",
        },
        {
          role: "user",
          content: `Review the following transcript and return a JSON object with:
{
  "isSalesCall": <true if this is clearly a sales call between a sales rep and a prospect, false otherwise>,
  "category": "<one of: sales_call, customer_support, internal_meeting, training, other>",
  "tags": ["<short keyword tags like: discovery, demo, renewal, pricing, support, onboarding, q&a, etc.>"],
  "summary": "<3-5 sentence concise summary of the conversation>",
  "keyMoments": ["<3-5 bullet points with important moments, optionally with rough timestamps if present>"],
  "nextSteps": ["<0-5 next-step action items mentioned in the conversation>"],
  "coachingNotes": "<2-4 actionable coaching tips. If not a sales call, you can instead give neutral suggestions like 'No sales-specific coaching; this appears to be an internal or non-sales conversation.'>"
}

IMPORTANT:
- Even if this is NOT a sales call (e.g. internal meeting, tech support, interview, spam, or vague content), you MUST still provide a meaningful summary, key moments, and next steps if any are implied by the conversation.
- Only set "isSalesCall" to true if you are confident this is a sales conversation between a rep and a prospect.
- Choose the closest matching category and a few short, relevant tags to describe the conversation.

Transcript:
${transcript}
`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from Groq");
    }

    const parsed = JSON.parse(content);

    // Handle coachingNotes - can be string or array
    let coachingNotes = "";
    if (Array.isArray(parsed.coachingNotes)) {
      coachingNotes = parsed.coachingNotes.join("\n• ");
      if (coachingNotes) {
        coachingNotes = "• " + coachingNotes;
      }
    } else {
      coachingNotes = parsed.coachingNotes || "";
    }

    const isSalesCall =
      typeof parsed.isSalesCall === "boolean" ? parsed.isSalesCall : false;

    const category =
      typeof parsed.category === "string" && parsed.category.length > 0
        ? parsed.category
        : isSalesCall
        ? "sales_call"
        : "other";

    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.filter((t: unknown) => typeof t === "string" && t.trim().length > 0)
      : [];

    return {
      isSalesCall,
      category,
      tags,
      summary: parsed.summary || "",
      keyMoments: Array.isArray(parsed.keyMoments) ? parsed.keyMoments : [],
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
      coachingNotes,
    };
  } catch (error) {
    console.error("Groq API error:", error);
    throw new Error("Failed to generate summary");
  }
};

export interface ScoreResult {
  overall: number;
  categories: {
    discovery: number;
    objections: number;
    clarity: number;
    nextSteps: number;
  };
  rationale: string;
  isSalesCall?: boolean;
}

// Helper function to detect if transcript is nonsense/invalid
const isInvalidTranscript = (text: string): boolean => {
  const trimmed = text.trim();
  
  // Too short
  if (trimmed.length < 50) {
    return true;
  }
  
  // Check for excessive repetition (e.g., "sdasdasdsadsad")
  const uniqueChars = new Set(trimmed.toLowerCase().replace(/\s+/g, '')).size;
  const totalChars = trimmed.replace(/\s+/g, '').length;
  if (totalChars > 0 && uniqueChars / totalChars < 0.3 && totalChars < 100) {
    // Less than 30% unique characters in short text suggests repetition/nonsense
    return true;
  }
  
  // Check if it's mostly non-alphabetic characters (excluding common punctuation)
  const alphabeticChars = trimmed.replace(/[^a-zA-Z\s]/g, '').length;
  const totalLength = trimmed.length;
  if (totalLength > 0 && alphabeticChars / totalLength < 0.5) {
    // Less than 50% alphabetic characters suggests invalid content
    return true;
  }
  
  return false;
};

export const scoreCall = async (call: ICall): Promise<ScoreResult> => {
  const client = getGroqClient();
  const transcript = truncateTranscript(call.transcriptText);

  // Validate transcript quality - check for invalid/nonsensical content
  const trimmedTranscript = transcript.trim();
  if (isInvalidTranscript(trimmedTranscript)) {
    // Invalid transcript - return all zeros
    return {
      overall: 0,
      categories: {
        discovery: 0,
        objections: 0,
        clarity: 0,
        nextSteps: 0,
      },
      rationale: "Invalid or nonsensical transcript detected. Please provide a valid sales call transcript with meaningful dialogue between a sales representative and a prospect. The transcript should contain actual conversation content, not random characters or placeholder text.",
      isSalesCall: false,
    };
  }

  if (!client) {
    // Return deterministic mock response
    const baseScore = 72;
    return {
      overall: baseScore,
      categories: {
        discovery: 7,
        objections: 6,
        clarity: 8,
        nextSteps: 7,
      },
      rationale: "Good discovery questions and clear communication. Objection handling could be more proactive. Next steps were identified but could be more specific with timelines.",
      isSalesCall: true,
    };
  }

  try {
    const completion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert sales call evaluator and call classifier. First, determine if the transcript is for a real sales call (between a sales rep and a prospect). Only produce scores if you are confident it is a sales call. If not, return as specified below.`,
        },
        {
          role: "user",
          content: `Review the transcript below and return a JSON object with the following structure:

{
  "isSalesCall": <true if clearly a sales call, false otherwise>,
  "overall": <number 0-100, meaningful only if isSalesCall is true>,
  "categories": {
    "discovery": <number 0-10>,
    "objections": <number 0-10>,
    "clarity": <number 0-10>,
    "nextSteps": <number 0-10>
  },
  "rationale": "<detailed explanation of the score if a sales call, or a message clarifying why this isn't a sales call>"
}

IMPORTANT:
- If this is NOT a sales call (e.g. it's an internal meeting, tech support, interview, spam, or content is too vague), set "isSalesCall" to false, and set all numerical fields to 0 and rationale to a short sentence explaining why.
- If it IS a sales call, proceed to score it as follows:

EVALUATION CRITERIA IF SALES CALL:
- Discovery (0-10): Did the rep ask meaningful questions about customer needs, pain points, current situation, budget, timeline, decision-makers? Score low if superficial. Score 0-2 if no discovery.
- Objection handling (0-10): Did the rep handle or anticipate objections? Score low if none present or handled. Score 0-2 if no objections.
- Clarity (0-10): Was communication clear, structured, and professional? Score low for vague/poor structure.
- Next steps (0-10): Were concrete, specific next steps identified? Score low for vague commitments/no clear action items.

Overall (0-100) is a weighted average.

Transcript:
${transcript}
`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from Groq");
    }

    const parsed = JSON.parse(content);

    return {
      isSalesCall: typeof parsed.isSalesCall === "boolean" ? parsed.isSalesCall : false,
      overall: parsed.isSalesCall ? Math.round(parsed.overall || 0) : 0,
      categories: {
        discovery: parsed.isSalesCall ? Math.round(parsed.categories?.discovery || 0) : 0,
        objections: parsed.isSalesCall ? Math.round(parsed.categories?.objections || 0) : 0,
        clarity: parsed.isSalesCall ? Math.round(parsed.categories?.clarity || 0) : 0,
        nextSteps: parsed.isSalesCall ? Math.round(parsed.categories?.nextSteps || 0) : 0,
      },
      rationale: parsed.rationale || "",
    };
  } catch (error) {
    console.error("Groq API error:", error);
    throw new Error("Failed to score call");
  }
};

export interface ObjectionResult {
  type: string;
  snippet: string;
  confidence: number;
  isSalesCall?: boolean;
}

export const detectObjections = async (call: ICall): Promise<ObjectionResult[]> => {
  const client = getGroqClient();
  const transcript = truncateTranscript(call.transcriptText);

  const objectionTypes = [
    "pricing",
    "timing",
    "competitor",
    "authority",
    "need",
    "trust",
  ];

  if (!client) {
    // Return deterministic mock response
    const mockObjections: ObjectionResult[] = [];
    if (transcript.toLowerCase().includes("price") || transcript.toLowerCase().includes("cost")) {
      mockObjections.push({
        type: "pricing",
        snippet: transcript.substring(
          Math.max(0, transcript.toLowerCase().indexOf("price") - 50),
          Math.min(transcript.length, transcript.toLowerCase().indexOf("price") + 100)
        ),
        confidence: 0.85,
        isSalesCall: true,
      });
    }
    if (transcript.toLowerCase().includes("later") || transcript.toLowerCase().includes("not now")) {
      mockObjections.push({
        type: "timing",
        snippet: transcript.substring(
          Math.max(0, transcript.toLowerCase().indexOf("later") - 50),
          Math.min(transcript.length, transcript.toLowerCase().indexOf("later") + 100)
        ),
        confidence: 0.75,
        isSalesCall: true,
      });
    }
    return mockObjections.length > 0 ? mockObjections : [];
  }

  try {
    const completion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a call classifier and sales analyst. First, decide if the transcript is that of a sales call. If it is, detect and extract sales objections. If not, respond as specified below.",
        },
        {
          role: "user",
          content: `Review the transcript below and return a JSON object with:
{
  "isSalesCall": <true if clearly a sales call, false otherwise>,
  "objections": [
    {
      "type": "<string, one of: ${objectionTypes.join(", ")}>",
      "snippet": "<string, 50-150 characters excerpt>",
      "confidence": <number 0-1>
    }
  ]
}

IMPORTANT:
- If this is NOT a sales call (e.g. internal meeting, tech support, interview, or insufficient context), set "isSalesCall" to false and set "objections" to an empty array.
- If it IS a sales call, detect objections. For each, include:
    - "type": objection type (${objectionTypes.join(", ")})
    - "snippet": relevant excerpt (50-150 characters)
    - "confidence": likelihood 0.0-1.0

Transcript:
${transcript}
`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from Groq");
    }

    const parsed = JSON.parse(content);
    if (!parsed.isSalesCall) {
      return [];
    }
    return (parsed.objections || []).filter(
      (obj: ObjectionResult) => obj.confidence >= 0.5
    ).map((o: ObjectionResult) => ({ ...o, isSalesCall: true }));
  } catch (error) {
    console.error("Groq API error:", error);
    throw new Error("Failed to detect objections");
  }
};
