import { COURSES } from "./catalog";
import type { AppState } from "./types";

export type Eligibility = { state: "met" | "unmet" | "unknown"; reason: string };

export function checkPrerequisites(code: string, state: Pick<AppState, "completedCourses" | "pendingCourses">): Eligibility {
  const course = COURSES.find((item) => item.code === code);
  if (!course || course.prereq.state === "unknown") return { state: "unknown", reason: "The applicable curriculum does not provide a resolved prerequisite rule." };
  if (course.prereq.state === "explicit_none") return { state: "met", reason: "The source explicitly lists no prerequisite." };
  const pending = course.prereq.all.filter((item) => state.pendingCourses.includes(item));
  if (pending.length) return { state: "unknown", reason: `Result pending for ${pending.join(", ")}.` };
  const missing = course.prereq.all.filter((item) => !state.completedCourses.includes(item));
  if (missing.length) return { state: "unmet", reason: `Requires ${missing.join(" and ")}.` };
  return { state: "met", reason: `Known completed record satisfies ${course.prereq.all.join(" and ")}.` };
}

export function addCourseDeduplicated(state: AppState, code: string, career: string): AppState {
  const catalog = COURSES.find((item) => item.code === code);
  if (!catalog) throw new Error("Unknown course ID");
  const existing = state.plan.find((item) => item.code === code);
  if (existing) existing.careers = Array.from(new Set([...existing.careers, career]));
  else state.plan.push({ code: catalog.code, title: catalog.title, credits: catalog.credits, status: "planned", careers: [career] });
  state.version += 1; state.guidanceStale = false;
  return state;
}

export function deadlineStatus(deadline: string | null, now = new Date()): "closed" | "unverified" {
  if (!deadline) return "unverified";
  const parsed = new Date(deadline);
  return Number.isNaN(parsed.getTime()) || parsed < now ? "closed" : "unverified";
}

export function commitSemesterUpdate(state: AppState): AppState {
  const draft = state.semesterDraft;
  if (!draft || draft.state === "committed") return state;
  for (const result of draft.results) {
    if (result.status === "passed" && !state.completedCourses.includes(result.code)) state.completedCourses.push(result.code);
    if (result.status === "pending" && !state.pendingCourses.includes(result.code)) state.pendingCourses.push(result.code);
    if (result.status !== "pending") state.pendingCourses = state.pendingCourses.filter((code) => code !== result.code);
  }
  if (draft.completedTerm >= state.profile.programLength) state.profile.termStatus = "completed";
  else state.profile.semester = draft.nextTerm;
  state.plan = draft.nextCourses;
  draft.state = "committed";
  state.version += 1;
  state.guidanceStale = true;
  return state;
}
