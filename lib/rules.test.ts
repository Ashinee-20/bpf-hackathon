import { describe, expect, it } from "vitest";
import { addCourseDeduplicated, checkPrerequisites, commitSemesterUpdate, deadlineStatus } from "./rules";
import { demoState } from "./default-state";

describe("deterministic academic rules", () => {
  it("never treats missing prerequisite data as eligible", () => {
    expect(checkPrerequisites("CS356", { completedCourses: [], pendingCourses: [] }).state).toBe("unknown");
  });
  it("keeps pending prerequisite results unknown", () => {
    expect(checkPrerequisites("CS402", { completedCourses: [], pendingCourses: ["CS305"] })).toEqual({ state: "unknown", reason: "Result pending for CS305." });
  });
  it("reports unmet prerequisites", () => {
    expect(checkPrerequisites("CS351", { completedCourses: ["MA201"], pendingCourses: [] }).state).toBe("unmet");
  });
  it("deduplicates one course across paths and credits", () => {
    const state = demoState();
    addCourseDeduplicated(state, "CS305", "software");
    addCourseDeduplicated(state, "CS305", "cloud");
    expect(state.plan.filter((course) => course.code === "CS305")).toHaveLength(1);
    expect(state.plan.find((course) => course.code === "CS305")?.careers).toEqual(["software", "cloud"]);
  });
  it("commits rollover idempotently", () => {
    const state = demoState(); const before = state.version;
    state.semesterDraft = { id: "update-1", completedTerm: 5, nextTerm: 6, resultStatus: "released", results: [{ code: "CS301", grade: "A", status: "passed" }], nextCourses: [], state: "preview", baseVersion: before };
    commitSemesterUpdate(state); commitSemesterUpdate(state);
    expect(state.version).toBe(before + 1);
    expect(state.completedCourses.filter((code) => code === "CS301")).toHaveLength(1);
    expect(state.profile.semester).toBe(6);
  });
  it("moves final-term students to completion review", () => {
    const state = demoState(); state.profile.semester = 8; state.profile.programLength = 8;
    state.semesterDraft = { id: "final", completedTerm: 8, nextTerm: 8, resultStatus: "released", results: [], nextCourses: [], state: "preview", baseVersion: state.version };
    commitSemesterUpdate(state);
    expect(state.profile.termStatus).toBe("completed"); expect(state.profile.semester).toBe(8);
  });
  it("does not label expired deadlines open", () => {
    expect(deadlineStatus("2025-01-01T00:00:00Z", new Date("2026-01-01T00:00:00Z"))).toBe("closed");
  });
});
