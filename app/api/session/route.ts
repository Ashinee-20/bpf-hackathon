import { NextResponse } from "next/server";
import { z } from "zod";
import { sessionId } from "@/lib/session";
import { loadState, saveState } from "@/lib/store";
import { demoState, emptyState } from "@/lib/default-state";
import { addCourseDeduplicated, commitSemesterUpdate } from "@/lib/rules";
import { CAREERS } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await loadState(await sessionId()));
}

const actionSchema = z.object({
  action: z.string(),
  payload: z.unknown().optional(),
  baseVersion: z.number().optional(),
});
export async function POST(request: Request) {
  try {
    const id = await sessionId();
    const body = actionSchema.parse(await request.json());
    let state = await loadState(id);
    if (body.baseVersion !== undefined && body.baseVersion !== state.version)
      return NextResponse.json(
        {
          code: "STALE_VERSION",
          message: "This record changed. Reload before applying your update.",
          retryable: true,
        },
        { status: 409 },
      );
    const payload = (body.payload ?? {}) as Record<string, unknown>;
    switch (body.action) {
      case "start_demo":
        state = demoState();
        break;
      case "reset":
        state = emptyState();
        break;
      case "onboarding": {
        if (payload.profile)
          state.profile = { ...state.profile, ...(payload.profile as object) };
        if (Array.isArray(payload.paths))
          state.paths = payload.paths.map((pathId) => {
            const known = CAREERS.find((c) => c.id === pathId);
            return {
              id: String(pathId),
              label: known?.label ?? String(pathId),
              active: true,
              explicit: true,
              selectedAt: new Date().toISOString(),
            };
          });
        state.onboardingStep = Number(payload.step ?? state.onboardingStep);
        state.onboardingComplete = Boolean(
          payload.complete ?? state.onboardingComplete,
        );
        state.version += 1;
        break;
      }
      case "add_course":
        state = addCourseDeduplicated(
          state,
          String(payload.code),
          String(payload.career),
        );
        break;
      case "toggle_path": {
        const path = state.paths.find((p) => p.id === payload.id);
        if (path) path.active = Boolean(payload.active);
        state.version += 1;
        break;
      }
      case "add_path": {
        const known = CAREERS.find((c) => c.id === payload.id);
        if (!state.paths.some((p) => p.id === payload.id))
          state.paths.push({
            id: String(payload.id),
            label: known?.label ?? String(payload.label),
            active: true,
            explicit: true,
            selectedAt: new Date().toISOString(),
          });
        state.version += 1;
        break;
      }
      case "feedback": {
        const interaction = state.interactions.find((i) => i.id === payload.id);
        if (interaction)
          interaction.feedback =
            payload.feedback as typeof interaction.feedback;
        if (payload.interest)
          state.observations.push({
            dimension: "learning interest",
            value: String(payload.interest),
            status: "proposed",
            reason: `Explicit feedback on interaction ${String(payload.id).slice(0, 8)}`,
          });
        state.version += 1;
        break;
      }
      case "confirm_observation": {
        const obs = state.observations[Number(payload.index)];
        if (obs) obs.status = "confirmed";
        state.version += 1;
        state.guidanceStale = true;
        break;
      }
      case "remove_document": {
        state.documents = state.documents.filter(
          (document) => document.id !== payload.id,
        );
        state.version += 1;
        state.guidanceStale = true;
        break;
      }
      case "add_project": {
        state.projects.push({
          id: crypto.randomUUID(),
          title: String(payload.title),
          pathId: String(payload.pathId),
          goal: String(payload.goal ?? ""),
          nextStep: String(
            payload.nextStep ?? "Define the first small deliverable.",
          ),
          status: "planned",
          createdAt: new Date().toISOString(),
        });
        state.version += 1;
        break;
      }
      case "update_project": {
        const project = state.projects.find((item) => item.id === payload.id);
        if (
          project &&
          ["planned", "active", "completed"].includes(String(payload.status))
        )
          project.status = String(payload.status) as typeof project.status;
        state.version += 1;
        break;
      }
      case "toggle_weekly_task": {
        const taskId = String(payload.id);
        const completed = new Set(state.completedWeeklyTasks);
        if (completed.has(taskId)) completed.delete(taskId);
        else completed.add(taskId);
        state.completedWeeklyTasks = [...completed];
        state.version += 1;
        break;
      }
      case "semester_draft": {
        state.semesterDraft = payload as unknown as typeof state.semesterDraft;
        state.version += 1;
        break;
      }
      case "semester_commit":
        state = commitSemesterUpdate(state);
        break;
      default:
        return NextResponse.json(
          {
            code: "UNKNOWN_ACTION",
            message: "Unsupported action.",
            retryable: false,
          },
          { status: 400 },
        );
    }
    await saveState(id, state);
    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json(
      {
        code: "INVALID_REQUEST",
        message: error instanceof Error ? error.message : "Invalid request",
        retryable: false,
      },
      { status: 400 },
    );
  }
}
