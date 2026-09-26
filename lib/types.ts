export type CareerId =
  | "software"
  | "ai"
  | "data"
  | "cyber"
  | "cloud"
  | "mobile"
  | "frontend"
  | "iot"
  | "research"
  | "product";
export type PathState = {
  id: CareerId | string;
  label: string;
  active: boolean;
  explicit: boolean;
  selectedAt: string;
};
export type PlannedCourse = {
  code: string;
  title: string;
  credits: number | null;
  status: "planned" | "enrolled";
  careers: string[];
};
export type DocumentRecord = {
  id: string;
  name: string;
  type: string;
  scope: "public" | "private";
  status: "queued" | "processing" | "ready" | "partial" | "failed";
  source?: string;
  message: string;
  addedAt: string;
};
export type ProcessingJob = {
  id: string;
  type: "document" | "opportunities" | "preparation";
  stage: string;
  status: "queued" | "processing" | "ready" | "partial" | "failed";
  targetId?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
};
export type Interaction = {
  id: string;
  mode: string;
  question: string;
  answer: string;
  createdAt: string;
  feedback?: { interest?: string; difficulty?: string; continue?: string };
};
export type ProjectRecord = {
  id: string;
  title: string;
  pathId: string;
  goal: string;
  nextStep: string;
  status: "planned" | "active" | "completed";
  createdAt: string;
};
export type Opportunity = {
  id: string;
  title: string;
  organizer: string;
  category: string;
  paths: string[];
  why: string;
  officialUrl: string;
  mode: string | null;
  dates: string | null;
  deadline: string | null;
  eligibility: string | null;
  fees: string | null;
  status: "verified_open" | "upcoming_not_open" | "closed" | "unverified";
  eligibilityState: "likely_match" | "mismatch" | "needs_information";
  checkedAt: string;
  synthetic?: boolean;
};
export type SemesterDraft = {
  id: string;
  completedTerm: number;
  nextTerm: number;
  resultStatus: "released" | "pending";
  results: Array<{ code: string; grade: string; status: string }>;
  nextCourses: PlannedCourse[];
  state: "draft" | "preview" | "committed";
  baseVersion: number;
};
export type AppState = {
  version: number;
  onboardingComplete: boolean;
  onboardingStep: number;
  demo: boolean;
  profile: {
    preferredName: string;
    university: string;
    program: string;
    branch: string;
    cohort: string;
    semester: number;
    programLength: number;
    termStatus: string;
    weeklyHours: number;
    language: string;
    termEnd?: string;
  };
  paths: PathState[];
  plan: PlannedCourse[];
  completedCourses: string[];
  pendingCourses: string[];
  documents: DocumentRecord[];
  interactions: Interaction[];
  observations: Array<{
    dimension: string;
    value: string;
    status: "proposed" | "confirmed";
    reason: string;
  }>;
  savedOpportunities: Record<
    string,
    "saved" | "preparing" | "applied" | "completed" | "dismissed"
  >;
  preparationPlans: Record<string, string[]>;
  projects: ProjectRecord[];
  completedWeeklyTasks: string[];
  semesterDraft?: SemesterDraft;
  lastCheckin?: string;
  guidanceStale: boolean;
  jobs: ProcessingJob[];
  opportunities: Opportunity[];
};
