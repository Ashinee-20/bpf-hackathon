import { NextResponse } from "next/server";
import { streamText } from "ai";
import { z } from "zod";
import { configuredModel, LEARNING_SYSTEM } from "@/lib/ai";
import { sessionId } from "@/lib/session";
import { loadState, saveState } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;
const schema = z.object({ mode: z.enum(["explain", "prepare", "explore"]), question: z.string().min(3).max(2000), course: z.string().max(80).optional() });

export async function POST(request: Request) {
  const id = await sessionId();
  try {
    const input = schema.parse(await request.json()); const interactionId = crypto.randomUUID();
    const result = streamText({
      model: configuredModel(), system: LEARNING_SYSTEM,
      prompt: `Mode: ${input.mode}. Course context: ${input.course || "none"}. Student question: ${input.question}`,
      onFinish: async ({ text }) => {
        const state = await loadState(id);
        state.interactions.push({ id: interactionId, mode: input.mode, question: input.question, answer: text, createdAt: new Date().toISOString() });
        state.version += 1; await saveState(id, state);
      },
    });
    return result.toTextStreamResponse({ headers: { "X-Interaction-Id": interactionId } });
  } catch (error) {
    return NextResponse.json({ code: "AI_UNAVAILABLE", message: error instanceof Error ? error.message : "Learning request failed.", retryable: true }, { status: 503 });
  }
}
