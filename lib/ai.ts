import { generateText } from "ai";
import { createVertex } from "@ai-sdk/google-vertex";

export function configuredModel() {
  const model = process.env.AI_MODEL;
  if (!model) throw new Error("Live AI is unavailable. Configure AI_MODEL; your question was preserved.");
  if (process.env.AI_PROVIDER === "vertex") {
    const vertex = createVertex({ project: process.env.GOOGLE_VERTEX_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT, location: process.env.GOOGLE_VERTEX_LOCATION ?? "us-central1" });
    return vertex(model);
  }
  if (!process.env.AI_GATEWAY_API_KEY) throw new Error("Live AI is unavailable. Configure AI_GATEWAY_API_KEY or use the Vertex provider; your question was preserved.");
  return model;
}

export const LEARNING_SYSTEM = `You are Pathwise, a concise academic learning coach. Separate explanation from assessment. Do not infer career interest from an exam question. Give: a direct explanation, one concrete example, one optional practice question, and at most one verified resource. Only recommend one of these verified URLs when relevant: NPTEL https://www.nptel.ac.in/courses, MDN https://developer.mozilla.org/en-US/docs/Learn, Google ML Crash Course https://developers.google.com/machine-learning/crash-course. Never invent a URL or claim to have watched a video.`;

export async function learningAnswer(input: { mode: string; question: string; course?: string }) {
  const model = configuredModel();
  const { text } = await generateText({
    model,
    system: LEARNING_SYSTEM,
    prompt: `Mode: ${input.mode}. Course context: ${input.course || "none"}. Student question: ${input.question}`,
  });
  return text;
}

export async function preparationChecklist(title: string, eligibility: string | null) {
  let model: ReturnType<typeof configuredModel>;
  try { model = configuredModel(); } catch { return ["Read the official details and record the exact eligibility rules.", "List the required materials and their owners.", "Set a personal deadline before the official deadline."]; }
  const { text } = await generateText({ model, system: "Create a grounded, editable preparation checklist. Do not claim submission or invent requirements. Return 3 concise lines only.", prompt: `Opportunity: ${title}. Known eligibility: ${eligibility ?? "unknown—tell the student to verify it"}.` });
  return text.split("\n").map((line) => line.replace(/^[-*\d.)\s]+/, "").trim()).filter(Boolean).slice(0, 5);
}
