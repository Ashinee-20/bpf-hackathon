import type { CareerId, Opportunity } from "./types";

export const CAREERS: Array<{ id: CareerId; label: string; orientation: string; description: string }> = [
  { id: "software", label: "Software Engineering", orientation: "technical", description: "Design, build, test, and evolve reliable software systems." },
  { id: "ai", label: "AI / ML", orientation: "ai-data", description: "Build systems that learn from data and support intelligent decisions." },
  { id: "data", label: "Data Science / Analytics", orientation: "ai-data", description: "Turn messy data into models, evidence, and useful decisions." },
  { id: "cyber", label: "Cybersecurity", orientation: "technical", description: "Protect systems by understanding threats, controls, and secure design." },
  { id: "cloud", label: "Cloud / DevOps", orientation: "technical", description: "Operate scalable software with automation, reliability, and observability." },
  { id: "mobile", label: "Mobile Development", orientation: "technical", description: "Create useful, responsive experiences for mobile devices." },
  { id: "frontend", label: "Frontend / UX Engineering", orientation: "design", description: "Build accessible interfaces where design and engineering meet." },
  { id: "iot", label: "Embedded Systems / IoT", orientation: "technical", description: "Connect software to sensors, devices, and the physical world." },
  { id: "research", label: "Research / Higher Studies", orientation: "research", description: "Investigate open questions and communicate reproducible evidence." },
  { id: "product", label: "Product / Entrepreneurship", orientation: "product", description: "Discover problems, shape products, and learn through market feedback." },
];

export const COURSES = [
  { code: "CS301", title: "Database Systems", credits: 4, term: 5, paths: ["software", "data", "product"], topics: "relational modeling, transactions, indexing", prereq: { state: "documented_rule", all: ["CS201"] }, evidence: "Demo curriculum fixture · course description and prerequisite table" },
  { code: "CS305", title: "Computer Networks", credits: 4, term: 5, paths: ["software", "cyber", "cloud", "iot"], topics: "protocols, routing, reliable transport", prereq: { state: "documented_rule", all: ["CS202"] }, evidence: "Demo curriculum fixture · semester V course table" },
  { code: "CS351", title: "Machine Learning", credits: 3, term: 6, paths: ["ai", "data", "research"], topics: "supervised learning, evaluation, optimization", prereq: { state: "documented_rule", all: ["MA201", "CS204"] }, evidence: "Demo curriculum fixture · elective group A" },
  { code: "CS356", title: "Information Security", credits: 3, term: 6, paths: ["cyber", "cloud", "software"], topics: "cryptography, authentication, secure systems", prereq: { state: "unknown", all: [] }, evidence: "Demo curriculum fixture · prerequisite field absent" },
  { code: "CS360", title: "Human Computer Interaction", credits: 3, term: 6, paths: ["frontend", "product", "research"], topics: "user research, prototyping, usability", prereq: { state: "explicit_none", all: [] }, evidence: "Demo curriculum fixture · elective group B" },
  { code: "CS402", title: "Distributed Systems", credits: 4, term: 7, paths: ["cloud", "software", "research"], topics: "consensus, replication, fault tolerance", prereq: { state: "documented_rule", all: ["CS305"] }, evidence: "Demo curriculum fixture · advanced elective table" },
] as const;

export const LEARNING_RESOURCES = [
  { title: "NPTEL Computer Science courses", provider: "NPTEL", url: "https://www.nptel.ac.in/courses", note: "Verified provider catalog; select a course after reviewing its current syllabus." },
  { title: "MDN Web Docs", provider: "Mozilla", url: "https://developer.mozilla.org/en-US/docs/Learn", note: "Maintained learning path for web fundamentals." },
  { title: "Google Machine Learning Crash Course", provider: "Google", url: "https://developers.google.com/machine-learning/crash-course", note: "Hands-on ML fundamentals with exercises." },
];

export const EVERGREEN_OPPORTUNITIES: Opportunity[] = [
  { id: "prep-open-source", title: "Open-source contribution sprint", organizer: "Pathwise preparation activity", category: "Open source", paths: ["software", "cloud", "frontend", "ai"], why: "Build a small, reviewable contribution before applying to a formal program.", officialUrl: "https://opensource.guide/how-to-contribute/", mode: "Online", dates: null, deadline: null, eligibility: "No formal eligibility; start with a project contribution guide.", fees: "Free", status: "unverified", eligibilityState: "likely_match", checkedAt: "2026-09-26T00:00:00.000Z", synthetic: true },
  { id: "prep-research", title: "Paper reproduction mini-project", organizer: "Pathwise preparation activity", category: "Research preparation", paths: ["research", "ai", "data"], why: "Practice reading methods, recording assumptions, and reproducing one result.", officialUrl: "https://paperswithcode.com/", mode: "Online", dates: null, deadline: null, eligibility: "Choose a paper with public code and a manageable dataset.", fees: "Unknown", status: "unverified", eligibilityState: "needs_information", checkedAt: "2026-09-26T00:00:00.000Z", synthetic: true },
  { id: "prep-product", title: "One-week problem interview challenge", organizer: "Pathwise preparation activity", category: "Product preparation", paths: ["product", "frontend"], why: "Collect evidence about a problem before building or pitching a solution.", officialUrl: "https://www.ycombinator.com/library", mode: "Hybrid", dates: null, deadline: null, eligibility: "No formal eligibility.", fees: "Free", status: "unverified", eligibilityState: "likely_match", checkedAt: "2026-09-26T00:00:00.000Z", synthetic: true },
];

