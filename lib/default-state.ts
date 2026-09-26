import { CAREERS } from "./catalog";
import type { AppState } from "./types";

export function emptyState(): AppState {
  return {
    version: 1, onboardingComplete: false, onboardingStep: 1, demo: false,
    profile: { preferredName: "", university: "", program: "B.Tech", branch: "Computer Science and Engineering", cohort: "2024", semester: 1, programLength: 8, termStatus: "ongoing", weeklyHours: 3, language: "English" },
    paths: [], plan: [], completedCourses: [], pendingCourses: [], documents: [], interactions: [], observations: [], savedOpportunities: {}, preparationPlans: {}, guidanceStale: false, jobs: [], opportunities: [],
  };
}

export function demoState(): AppState {
  const state = emptyState();
  state.onboardingComplete = true;
  state.onboardingStep = 4;
  state.demo = true;
  state.profile = { preferredName: "Guest", university: "National Institute of Technology Karnataka", program: "B.Tech", branch: "Computer Science and Engineering", cohort: "2024", semester: 5, programLength: 8, termStatus: "ongoing", weeklyHours: 5, language: "English", termEnd: "2026-11-30" };
  state.paths = ["software", "research"].map((id) => { const item = CAREERS.find((c) => c.id === id)!; return { id, label: item.label, active: true, explicit: true, selectedAt: new Date().toISOString() }; });
  state.completedCourses = ["CS201", "CS202", "CS204", "MA201"];
  state.plan = [{ code: "CS301", title: "Database Systems", credits: 4, status: "enrolled", careers: ["software"] }];
  state.documents = [
    { id: "demo-curriculum", name: "CSE curriculum fixture", type: "curriculum", scope: "public", status: "partial", source: "https://cse.l3.nitk.ac.in/programmes/ug", message: "Synthetic extracted course subset for demo; cohort applicability requires confirmation.", addedAt: new Date().toISOString() },
    { id: "demo-transcript", name: "Synthetic cumulative transcript", type: "transcript", scope: "private", status: "ready", message: "Synthetic fixture — not a real student record.", addedAt: new Date().toISOString() },
  ];
  return state;
}
