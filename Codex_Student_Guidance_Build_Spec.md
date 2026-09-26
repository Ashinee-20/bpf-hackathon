# Student Guidance Platform — Codex Build Specification

Version: 1.0 · 26 September 2026

Purpose: Build a working AI academic and career guidance prototype for the Day-1 EdTech buildathon. This project is independent of EduMesh. Working product label: **Pathwise**; keep the name configurable and do not imply trademark availability.

## 1. Instructions to the implementing Codex agent

Implement the application described below, including working persistence and live AI calls. Inspect any existing repository and follow its instructions before choosing dependencies. Use its established stack where practical. Build a complete vertical journey first, then broaden coverage. Do not stop after producing static screens.

The academic knowledge graph is a BACKEND implementation detail. Do not build a “My Academic Map” navigation item, graph visualization, node editor, or student-facing graph page. Students see recommendations, semester roadmaps, course cards, and source evidence only.

Support onboarding in ANY semester. Support an adaptive semester update that requests the previous semester's marksheet and the new semester's plan. Preserve historical records and allow results-pending states. Add track-specific profile enhancement opportunities. Follow the light, orange-accented visual direction in section 15.

Build substantially during the challenge window. Use synthetic student records only. Disclose seeded histories and fixtures. Do not simulate model responses or pretend an external integration succeeded. No private pre-existing proprietary code. Record external code/data sources and relevant licenses in the README.

## 2. Problem and product outcome

Students must choose electives and prepare for careers while their interests are still evolving. Their academic constraints live in curriculum documents, policies, course lists, and personal results. Their learning experiences and career exploration rarely connect to those decisions.

Build an advisor that starts from the student's current academic position, helps them explore several careers, learns from explicit feedback and daily learning, and recommends suitable next steps grounded in university evidence. Update guidance as semesters, results, and preferences change.

Target prototype audience: students in one supported computing program, from first semester through final semester. Architecture must support different program lengths and later additional branches. Do not advertise support for every university on day one.

Success in the demo means a new input causes a real, explainable change in guidance; academic rules remain enforced, and missing information remains visible.

## 3. Non-negotiable requirements

1. Academic graph stays entirely in the backend.
2. Students can enter from any semester; never assume all earlier courses were passed.
3. Curriculum URL and document upload are both entry routes; missing documents do not prevent general learning and career exploration.
4. Selected careers become independent tabs within Career Planner. Students can add and pause paths.
5. There is one combined semester plan across all career tabs.
6. Daily Learning supports concept help, preparation, exploration, and verified resource links.
7. Interest, proficiency, and assessment urgency are distinct signals.
8. Semester rollover requests marksheet/results and next-semester plan, with review before applying changes.
9. Enhance Profile provides opportunities appropriate to each track, with verified links, deadlines, and eligibility status.
10. Every academic eligibility claim is checked in code against known rules and student information.
11. Unknown information remains unknown. Upload presence alone does not mean a feature is ready.
12. No silent career deletion, automatic enrollment, or automatic application submission.

## 4. Navigation and route structure

| Route | Screen | Primary purpose |
|---|---|---|
| `/` | Minimal entry page | Explain the product and enter onboarding or an explicitly labeled synthetic demo |
| `/onboarding` | Adaptive onboarding | Establish academic context and interests |
| `/app/careers` | Career Planner | Career tabs, academic roadmaps, external learning, next actions |
| `/app/learn` | Daily Learning | Concept explanations, practice, exploration, weekly check-in |
| `/app/opportunities` | Enhance Profile | Track-specific opportunities and preparation |
| `/app/semester` | My Semester | Current/planned courses, results summary, next-semester update |
| `/app/profile` | Profile & Documents | Academic identity, editable preferences, source documents |

Sidebar order: Career Planner, Daily Learning, Enhance Profile, My Semester. Profile & Documents and settings sit at the bottom. Career Planner is the default destination after onboarding. No academic map route.

Desktop: persistent narrow sidebar and a wide content panel. Header shows program, current semester, and one contextual primary action. Mobile: sidebar becomes a drawer; career tabs scroll horizontally without overflowing the viewport.

## 5. Adaptive onboarding

### 5.1 Personal and academic context

Required: preferred name, university, program, branch, admission/cohort year, current semester, expected program length if not available from the curriculum. Optional: learning-language preference and available weekly exploration time. Age and gender are unnecessary for this prototype; do not require them or use them for guidance.

Ask whether the current semester is ongoing, about to start, or just completed. Ask for term start/end dates only if not reliably available. Allow dates to be approximate and editable. Distinguish semester number from calendar term and study year.

University names may use an autocomplete with a manual fallback. Unsupported university must not be a dead end. A college name alone is insufficient to assert the correct curriculum version.

### 5.2 Obtain academic information

Offer: paste an official curriculum/department URL; upload a curriculum PDF; or continue with general guidance. Additional optional documents: regulations, current offering list, timetable. Discover a small bounded set of relevant same-university links from the supplied page; do not build an unlimited crawler.

Reuse a previously imported public curriculum for the same institution, program, and version. Keep public program data separate from private student documents. Show the detected program and curriculum/cohort applicability for confirmation.

Support text PDFs first. For image-only PDFs, use configured OCR if available; otherwise clearly explain the limitation and offer a text PDF/manual route. Unsupported file types must fail clearly, not appear successfully processed.

### 5.3 Branch based on academic position

| Student situation | Ask for | Do not assume |
|---|---|---|
| First semester, no results | Current or upcoming course plan | Prior college grades exist |
| Any later semester | Cumulative transcript or available marksheets; current courses; optional manual completed-course confirmation | Every previous semester was completed successfully |
| Mid-semester joiner | Current enrolled courses and latest available results | A new semester has just begun |
| Results pending | Known completed courses and pending-result status | Pending means failed or passed |
| Transfer/lateral entry | Recognized credits and equivalences if available | Previous institution's course names establish equivalence |
| Final semester | Remaining requirements and near-term goals | There will be another university semester |

Do not require one file for every past semester. Accept a cumulative transcript or a concise student-confirmed course history. Self-reported records remain labeled self-reported. For missing records, unlock only guidance supported by known information.

### 5.4 Career bubbles

Present ten multi-select chips for the supported computing program: Software Engineering; AI/ML; Data Science/Analytics; Cybersecurity; Cloud/DevOps; Mobile Development; Frontend/UX Engineering; Embedded Systems/IoT; Research/Higher Studies; Product/Entrepreneurship.

Include Other with free text and “I'm still exploring.” The initial list is setup data, not an AI prediction. Use a short clarifying question for ambiguous custom paths. Persist canonical path IDs while retaining the student's wording. Selecting no career is valid: offer a few exploration activities instead of fabricating interests.

### 5.5 Processing and confirmation

Run extraction while the student selects careers. Show actual stages: queued, reading, extracting courses, validating rules, preparing suggestions, ready/partially ready/failed. Never run a fake progress animation that implies completed backend work.

Before completing onboarding, show detected program/cohort, current academic position, missing information, and selected paths. Allow corrections and resume after refresh. Save each completed step. If analysis fails, preserve form data and provide Retry or Continue with available guidance.

## 6. Academic ingestion and backend knowledge graph

Pipeline: fetch/upload → validate file → extract page-aware text → LLM structured extraction → schema validation → resolve course identities → validate relationships → save versioned data → derive feature readiness.

Treat retrieved text as untrusted source content, never as executable instructions. Fetch only safe public HTTP(S) destinations with timeouts and size limits; reject local/private network destinations and unsafe redirects. Keep credentials server-side.

Extract course code, title, description/topics, credits, course category, elective group, curriculum placement, explicit prerequisites, co-requisites, minimum grades, and program credit rules where present. Preserve source document, page/section, and supporting excerpt for each material claim.

Store the graph using relational records and edge tables or JSON rules; a graph database is unnecessary. Nodes may represent courses and elective groups. Edges represent documented prerequisite/co-requisite relations. Skill-to-course associations generated by AI belong in a separate mapping with inference provenance, not official prerequisite edges.

Represent prerequisite expressions with AND/OR groups. Support minimum grade and concurrent-enrollment rules when documented. Missing prerequisite information must not become an empty prerequisite list: distinguish `unknown`, `explicit_none`, and `documented_rule`.

Validate duplicate course codes within a curriculum, unresolved course references, contradictory credits, and impossible prerequisite cycles. Some co-requisites can be mutual: do not confuse them with prerequisite cycles. Flag unresolved cases rather than guessing.

Maintain separate fields for recommended curriculum semester and confirmed semester offering. A course in a catalog is not evidence it is offered this term. Policies must match the institution/program/cohort; unclear or conflicting versions produce an unresolved status.

## 7. Career Planner

Top row: horizontally scrollable career tabs, Add path, and an overflow menu for paused paths. An accessible close button pauses a path and offers Undo. Preserve learning history. Changing tabs changes content without resetting the global semester plan.

Within each tab:

1. **Career overview:** concise work description; why this path is being explored; explicit interests versus tentative inferences.
2. **Academic roadmap:** current and future semester cards with relevant electives and prerequisite preparation. Previous semesters are summarized only where known.
3. **Beyond college:** a few verified learning resources and a practical project/activity suggestion.
4. **Next step:** one manageable action, not a giant task list.
5. **Enhance this profile:** a few matching opportunities linking to the full Enhance Profile screen.

Each course card includes course ID/name, known credits, relevance explanation tied to syllabus evidence, proposed term, prerequisite check, availability status, and source drawer. Primary action: Add to semester plan. Show trade-offs and courses useful across multiple active careers.

Backend first identifies candidates compatible with known constraints; AI ranks and explains relevance. Revalidate returned IDs and claimed evidence. A path recommendation is advisory, not an official registration approval.

One global semester plan deduplicates courses across careers. A course may have several career associations but counts once for credits. Explicitly document whether external courses earn academic credit; default to no credit unless policy confirms it.

If no valid option exists, explain the blocking constraints. Unknown information produces provisional suggestions, not fabricated feasibility. AI cannot silently relax academic rules or change saved selections.

## 8. My Semester and adaptive semester rollover

My Semester shows confirmed enrolled courses, separately planned courses, known credits, relevant missing information, available results, and Update semester. A course recommendation is not an enrollment record.

### 8.1 Trigger

When a confirmed/estimated term-end date is reached, display an in-app update prompt on the next visit: “Has your semester ended? Add your results and next semester's plan.” Always offer a manual Update semester action. Do not auto-increment the semester based only on time. Let users defer when exams or results are delayed.

No email/push automation is necessary for the MVP. An app-load check plus a manual action demonstrates the lifecycle honestly.

### 8.2 Update wizard

1. Confirm completed term and intended next term, including dates if known.
2. Request the completed term's marksheet or cumulative transcript. Offer Results not released yet and manual entry when unavailable.
3. Extract course identifiers, grade/marks, credits if present, and recorded result status. Show editable rows for student confirmation. Unknown grading schemes must not be guessed; do not convert marks to grades without a supplied scale.
4. Request the new semester plan: upload/paste course list, select from catalog, or manually enter courses. Ask which selections are confirmed versus tentative. Offering list and timetable are optional supporting documents.
5. Reconcile results, retakes, pending results, transfer credits, and newly planned courses. Ask about unknown mappings. Do not infer failure from absence in a marksheet.
6. Generate a preview: completed courses, unresolved prerequisites, changed suggestions, added learning support, and changed opportunity matches. Explain why each material change occurs.
7. Commit only after confirmation. Save the previous plan/results snapshot and a new version atomically. Refresh dependent guidance using the committed version.

### 8.3 Edge conditions

- Missing marksheet: keep update pending or allow a clearly provisional next-term plan; dependent eligibility checks remain unknown.
- Results pending for a prerequisite: do not mark the next course eligible.
- Failed prerequisite: propose support/retake and revise dependent course timing using official rules; do not downgrade career interest automatically.
- Retake: store attempts separately. Count earned credits once, using documented institutional rules; if aggregation rules are missing, do not calculate an authoritative total/CGPA.
- Revised result: version the correction and recompute affected checks.
- Semester break, repeated semester, changed program length: support explicit edits rather than forcing increment by one.
- Final term completed: move to completion review and career/profile guidance; do not create an extra semester.
- Curriculum change: require explicit version selection and explain unresolved mappings; never silently replace cohort rules.

### 8.4 Reliability

Use idempotent commits so repeated submission cannot create duplicate results or semesters. A failed regeneration must not destroy the confirmed academic record; mark guidance stale and allow retry. Reject overwrites based on an obsolete record version and ask the UI to reload the change preview.

## 9. Daily Learning and weekly reflection

Entry modes: Explain a concept, Prepare for a topic, Explore a career task. Accept natural-language input and optional course context. Answer with a concise explanation, relevant example, optional practice question, and a verified resource when available.

Select videos from stored verified URLs or an actual search integration; never invent YouTube IDs. Do not claim to summarize a video from its title alone. If no transcript is available, recommend it based on available metadata and state that limit where material.

After an activity, collect interest, difficulty, and desire to continue as distinct optional responses. A correct answer indicates performance on that item, not broad mastery. An exam-related question is not strong career-interest evidence.

Persist preference observations with interaction IDs, timestamps, explicit/inferred status, and reason. Show editable “What I've learned about you” information. Explicit corrections override earlier inference. Do not infer sensitive traits.

Weekly check-in is due seven days after the last completed check-in; show it within Daily Learning and as a small contextual reminder. Ask what was enjoyable, difficult, and worth exploring next. AI proposes a preference update; student confirms it. It may reprioritize suggested activities and paths but cannot silently change the saved semester plan.

Keep alternative exploration available. Never permanently eliminate a career based on low marks or a single interaction. No arbitrary compatibility percentages presented as calibrated predictions.

## 10. Enhance Profile — track-specific opportunities

This is a dedicated sidebar screen, also reachable from a career tab. It helps students identify relevant experiences and the next preparation step.

| Track orientation | Useful categories |
|---|---|
| Software/technical | Hackathons, coding challenges, open-source programs, project showcases, technical internships |
| AI/data | ML challenges, data competitions, AI hackathons, research internships, reproducible projects |
| Research/higher studies | Conferences, workshops, student research competitions, poster/abstract calls, research internships, reading/paper-reproduction activities |
| Product/entrepreneurship | Case competitions, startup pitch events, incubator programs, product challenges |
| Design/HCI | Design challenges, portfolio reviews, HCI workshops, relevant research events |

These are overlapping categories, not rigid boxes. A research-oriented student may also enjoy a hackathon. Personalize ranking by active paths, interests, current skills, semester, location/mode preference, time capacity, eligibility, and deadlines.

### Opportunity card

Required fields: title, organizer, category, matched path(s), concise why-this-fits explanation, official URL, mode/location, dates, deadline with timezone, eligibility summary, fees if known, status, and last checked timestamp. Missing fields display Unknown, not invented defaults.

Actions: View official details, Save, Dismiss, Help me prepare. Help me prepare creates a short editable checklist tied to that opportunity's actual requirements; it does not submit an application.

Conferences must distinguish attendance registration from abstract/paper/poster submission. Do not imply a beginner is ready to publish because they selected Research. Separate current opportunities from evergreen preparation activities.

### Retrieval and verification

For the demo, use a small curated set of official URLs checked during the challenge or a real search provider. AI may rank/explain records but must not generate event records from memory. Recheck the official page before calling registration Open. Store the exact deadline and timezone; filter expired deadlines against runtime time, not a hardcoded date.

Possible states: verified_open, upcoming_not_open, closed, unverified. Eligibility states: likely_match, mismatch, needs_information. Unknown student eligibility must remain needs_information. Hide mismatches by default or clearly separate them.

Deduplicate by normalized official URL plus event edition. Do not present an old edition as upcoming. Cached listings show last verified time; if refresh fails, retain the timestamp and avoid presenting a stale status as freshly confirmed. If no credible results are available, show an honest empty state and relevant evergreen preparation tasks. Synthetic opportunity fixtures must be explicitly labeled and not mixed with real open listings.

## 11. Capability gating

| Capability | Needed information | If unavailable |
|---|---|---|
| General career exploration | Basic student preferences | Fully available even without documents |
| General concept help | Student question | Available; do not claim course-specific alignment |
| Course relevance | Applicable catalog and adequate syllabus content | Limit claims or request syllabus |
| Prerequisite check | Explicit rule and relevant completed-course/grade evidence | Unknown, with a specific request |
| Credit-limit check | Applicable credit rule and complete proposed credit values | Cannot confirm credit compliance |
| Current-term availability | Current offering evidence | Provisional timing only |
| Timetable compatibility | Complete relevant schedule | Clash check unavailable |
| Performance-informed support | Confirmed results and grading context | General support only |
| Opportunity eligibility | Official criteria and matching student fields | Needs information |

Compute readiness server-side from validated fields and versions. Prefer local explanations beside the affected card over a page full of locked features. Use “Add marksheet to check this prerequisite” rather than generic “Locked.”

## 12. Suggested data model

All student-scoped tables require an owner/session identifier; enforce ownership server-side. Shared curriculum data contains no student marksheets.

| Entity | Key fields |
|---|---|
| StudentProfile | id, preferred_name, university_id, program_id, cohort, current_term_id, language, onboarding_state, version |
| CurriculumVersion | id, institution, program, cohort_applicability, source_ids, status, extracted_at |
| SourceDocument | id, scope public/private, owner_id, type, URL/storage_key, checksum, version, parse_status, extracted_at |
| SourceEvidence | id, document_version_id, page/section, excerpt, field_path |
| Course | id, curriculum_version_id, code, title, topics, credits nullable, category, elective_group, suggested_term nullable |
| AcademicRule | id, curriculum_version_id, type, expression JSON, evidence_ids, resolution_status |
| CourseRelation | from_course_id, to_course_id, relation_type, rule_id |
| AcademicTerm | id, student_id, semester_number, label, dates, status, version |
| CourseAttempt | id, student_id, term_id, course_id nullable, source_course_text, grade, scale_id, result_status, evidence_ids, confirmation_status |
| TermCourse | term_id, course_id, status planned/enrolled/completed/withdrawn, career_reasons |
| CareerPath | id, canonical_name, orientation_tags, description |
| StudentPath | student_id, path_id, active/paused, explicit_priority, selected_at |
| Interaction | id, student_id, mode, course_id optional, path_id optional, timestamp, content/reference |
| PreferenceObservation | student_id, dimension, value, evidence_interaction_ids, explicit/inferred, proposed/confirmed/rejected |
| GuidanceVersion | id, student_id, path_id, input_versions, output JSON, evidence_ids, generated_at, stale_status |
| LearningResource | id, title, provider, verified_url, topic_tags, transcript_status, last_checked_at |
| Opportunity | id, organizer, title, edition, category, official_url, dates/timezones, eligibility JSON, fees nullable, verification_status, checked_at |
| SavedOpportunity | student_id, opportunity_id, saved/dismissed/completed, preparation_plan |
| SemesterUpdate | id, student_id, old/new_term_ids, draft_payload, preview, state, base_version, idempotency_key |
| ProcessingJob | id, owner_id, type, stage, status, error_code, timestamps |

Do not combine academic evidence confidence with career-interest confidence. Preserve raw extracted grades alongside interpreted status. IDs and versions must make cached guidance invalidation straightforward.

## 13. API contracts and orchestration

Use the existing stack; absent a repository, a TypeScript React app with a server API and a simple SQL database is sufficient. A single provider abstraction handles LLM calls. No separate graph service or agent framework is required. Choose model IDs from configured available models, not a hardcoded assumption about availability.

Suggested endpoints:

| Endpoint | Request/response purpose |
|---|---|
| `POST /api/onboarding` | Save stage, academic context, and initial preferences |
| `POST /api/documents` | Validated upload or public URL; returns document ID and job ID |
| `GET /api/jobs/:id` | Actual processing stage, readiness, recoverable error |
| `POST /api/academic-review` | Confirm/correct extracted academic fields with base version |
| `GET /api/capabilities` | Available, provisional, and unavailable checks with missing-field reasons |
| `POST /api/paths` | Add canonical/custom path |
| `PATCH /api/paths/:id` | Pause, restore, or prioritize a path |
| `POST /api/guidance/generate` | Produce validated guidance for current committed profile/path version |
| `GET /api/guidance/:pathId` | Return latest guidance and freshness status |
| `POST /api/learn` | Stream answer/activity and persist interaction |
| `POST /api/learn/feedback` | Store explicit activity feedback |
| `POST /api/checkins/preview` | Propose evidence-backed preference changes |
| `POST /api/checkins/confirm` | Apply selected preference changes |
| `GET /api/opportunities` | Filter verified records by path/category/status |
| `POST /api/opportunities/:id/save` | Save or dismiss opportunity |
| `POST /api/opportunities/:id/prepare` | Generate a grounded editable preparation checklist |
| `POST /api/semester-updates` | Start/update draft from results and next-term plan |
| `POST /api/semester-updates/:id/preview` | Reconcile academic changes and return proposed effects |
| `POST /api/semester-updates/:id/commit` | Version-checked idempotent transaction |

Every mutating endpoint validates input and ownership. Structured errors use code, readable message, retryable flag, and affected fields. Check server readiness rather than trusting disabled client controls.

### LLM responsibilities

- Extraction: source text to schema, evidence pointers, unresolved fields.
- Guidance: explain relevance and trade-offs from supplied candidate courses, career information, and preferences.
- Learning: generate explanations, examples, questions, and resource selections.
- Preference analysis: propose evidence-backed observations, not unconditional personality judgments.
- Opportunity assistance: rank supplied verified records and explain preparation requirements.

### Deterministic responsibilities

Prerequisite logic; credits; date/deadline comparisons; source applicability; ownership; capability gating; ID validation; deduplication; state transitions; versioning. Return `met`, `unmet`, or `unknown` for individual checks; never let an LLM convert `unknown` to `met`.

All model outputs pass schema validation. Validate cited evidence IDs and ensure quoted support exists. Retry malformed output once with validation feedback, then show an honest partial/failure state. Never fall back to invented successful output. Use bounded requests and cache by input versions. Missing API configuration must produce an explicit unavailable state; a labeled fixture mode may support UI development but cannot masquerade as live intelligence.

## 14. State and persistence rules

- Autosave onboarding and semester-update drafts.
- Keep selected career tab in route/query state and restore it after refresh.
- Persist paths, course plans, observations, conversations, and saved opportunities.
- Invalidate dependent recommendations after confirmed results, curriculum, plan, or preference changes.
- Do not let an older async response replace newer guidance; match request/input versions.
- Keep committed academic information intact when generation fails.
- Use loading skeletons for requested content, useful empty states, and local retry controls.
- Synthetic demo session may use a server-issued identifier; do not expose other demo users' data. If real accounts are introduced, use established authentication and row ownership checks.
- In the challenge, marksheets/transcripts are synthetic only. Keep uploaded records private, avoid full-document logs, and include a way to remove a document and invalidate dependent claims.

## 15. Visual design direction

Reference: https://www.firecrawl.dev/ — visually inspected on 26 September 2026. Observed inspiration: light neutral surfaces, vivid orange emphasis, fine grid lines, dark sans-serif typography, generous whitespace, restrained rounded panels, and subtle technical ornament. Adapt the visual language to a student application; do not copy logos, marketing claims, proprietary artwork, or the exact page composition.

The following are proposed application tokens, not measured Firecrawl brand specifications:

| Token | Value | Use |
|---|---|---|
| Canvas | `#FAFAF9` | Main light background |
| Surface | `#FFFFFF` | Cards, forms, drawers |
| Surface muted | `#F4F4F2` | Secondary controls and quiet panels |
| Text primary | `#202020` | Headings and body |
| Text secondary | `#626262` | Supporting labels |
| Border | `#E7E7E3` | Fine dividers and cards |
| Accent | `#FF5A00` | Selected indicators, icons, sparing highlights |
| Accent strong | `#C83C00` | Primary button background with white text; verify contrast |
| Accent soft | `#FFF1E8` | Active sidebar/tab backgrounds |
| Success | `#176B45` | Confirmed checks, paired with text/icon |
| Warning | `#8A5700` | Missing information, paired with text/icon |
| Error | `#B42318` | Blocking errors |

Typography: Inter or a comparable available sans serif, system fallback. Body 15–16px, metadata at least 12–13px, page title 28–34px. Use 8px-based spacing, 12–16px card radii, restrained shadows, consistent outlined icons. Desktop sidebar approximately 224–240px; content padding 24–32px. Main reading width should remain comfortable on wide screens.

Onboarding: centered 680–760px form surface with short step labels, optional faint grid outside the form, orange selection states. Career bubbles are accessible multi-select chips with visible checks. No large decorative animation blocking progress.

Career Planner: calm title row, career tabs, one highlighted next action, then readable semester cards. Distinguish official facts, provisional advice, and missing information through labels rather than excessive colors.

Daily Learning: readable conversation column plus optional desktop context panel; input stays accessible, resource cards appear inline. Enhance Profile: filter chips, responsive opportunity cards, clear deadlines and saved state. Semester update: focused wizard with a before/after review table.

Interactions: 120–200ms transitions, visible keyboard focus, semantic tab behavior and labeled close buttons. Respect reduced motion. Do not depend on hover or color alone. Support 360px mobile width and typical laptop layouts. Verify contrast; bright orange decoration does not justify low-contrast body text.

Avoid a dense admin dashboard, neon gradients, glass panels, giant KPI counters, academic graph visuals, and unnecessary gamification. A simple semester roadmap is allowed; it is not the backend graph.

## 16. MVP boundaries and implementation sequence

The core paths below must work end to end. Breadth can be bounded without faking behavior.

1. App shell and persistent adaptive onboarding, including first-, middle-, and final-semester branches.
2. PDF/URL curriculum extraction, review, source evidence, and missing-data gates for one supported program.
3. Career tabs and live, grounded course guidance with one combined semester plan.
4. One real Daily Learning interaction, feedback, and confirmable preference update.
5. Semester rollover using synthetic marksheet and next-semester plan, review, commit, and guidance refresh.
6. Enhance Profile with a small verified opportunity dataset, per-track ranking, save/dismiss, and preparation help.
7. Error states, responsive polish, focused tests, deployment/readme, and demo rehearsal.

If time is tight, reduce catalog size, resource count, supported programs, and opportunity count. Keep semester rollover, mid-degree onboarding, backend-only graph, and honest source boundaries intact. Do not replace core interactions with static success screens.

Defer universal university discovery, SIS/LMS integration, automated emails, full job-board ingestion, automatic registration, advanced OCR if unavailable, job outcome prediction, production-scale scheduling, and multi-agent infrastructure.

## 17. Acceptance tests

| ID | Scenario | Required outcome |
|---|---|---|
| A1 | Student starts in semester 1 | No past marksheet required; first-term plan accepted |
| A2 | Student starts in semester 5 with one cumulative transcript | Earlier course records imported; no demand for four separate marksheets |
| A3 | Student starts in semester 5 without results | Earlier courses not assumed passed; general guidance works |
| A4 | Curriculum omits prerequisite information | Eligibility remains unknown, never eligible-by-default |
| A5 | Different cohort curriculum uploaded | Applicability review before using rules |
| A6 | Student selects multiple paths and reloads | Tabs and selection persist |
| A7 | Student closes and restores a path | Path history survives; semester plan unchanged |
| A8 | Same elective added through two paths | One plan entry and one credit count |
| A9 | Student asks a topic for an exam | No automatic career-interest confirmation |
| A10 | Student corrects an inferred preference | Confirmed correction drives updated guidance |
| A11 | Term date passes | Update prompt appears; current semester does not auto-increment |
| A12 | Marksheet includes failed prerequisite | Next plan shows the actual constraint and support suggestion |
| A13 | Results are pending | Provisional planning works; eligibility is not fabricated |
| A14 | Rollover commit submitted twice | One committed update; no duplicate attempts or terms |
| A15 | Older AI generation finishes after a profile edit | Older result cannot overwrite current guidance |
| A16 | Research versus technical path selected | Relevant opportunity categories and reasons change |
| A17 | Opportunity deadline has expired | It is not labeled verified open |
| A18 | Official page cannot be checked | Status is unverified/stale with timestamp; no invented fresh verification |
| A19 | Student in final term completes update | Completion review, not an extra semester |
| A20 | Scan UI routes and navigation | No My Academic Map or graph component is exposed |
| A21 | Provider fails or API key is missing | Clear error and preserved user data; no fabricated answer |
| A22 | Mobile keyboard and tab navigation | Forms, tabs, close controls, and primary actions remain usable |

Prioritize tests for academic rule evaluation, state transitions, deduplication, and deadline handling. Add one browser journey covering onboarding → guidance → learning feedback → semester update. Do not spend the challenge testing trivial visual implementation details.

## 18. Seven-minute demo narrative

1. Introduce a synthetic semester-5 student who is exploring software and research directions.
2. Import/review curriculum and a cumulative synthetic transcript; point out the absence of a frontend graph.
3. Compare career tabs and the evidence behind one elective suggestion.
4. Complete a short live activity and provide feedback that changes an earlier assumption. Confirm the profile update.
5. Compare technical and research profile opportunities with official links and verification dates.
6. Use the manual semester update action, upload synthetic results and a next-term plan, review a prerequisite-related change, and commit.
7. Explain that AI extracts/interprets/personalizes while deterministic code checks academic constraints; identify future university integration and pilot evaluation.

Clearly label preloaded histories as synthetic. Do not claim weeks of actual learning were observed. Demonstrate the algorithm on disclosed historical fixtures plus a live interaction.

## 19. Definition of done and handoff deliverables

- Runnable application with live AI integration and persistent state.
- Responsive light/orange interface matching this brief.
- All core routes functional and no frontend academic graph.
- Synthetic demo fixtures for a new student, later-semester student, and semester rollover.
- Source-linked curriculum data and clearly verified or explicitly unavailable opportunities.
- README with setup, environment variable names (no secrets), run/build commands, data sources/licenses, assumptions, known limitations, and demo steps.
- A short architecture description separating AI interpretation from deterministic checks.
- Meaningful test results and honest documentation of unsupported cases.
- No real confidential student records and no secrets committed.

Proposed evaluation for a later pilot: time to create a usable academic plan, invalid course selections prevented, student correction rate for preference inferences, guidance usefulness ratings, and repetitive advisor questions resolved with evidence. These are intended measures, not measured impact claims.

## 20. Reference links

- Visual reference: https://www.firecrawl.dev/ (inspected 26 September 2026; proposed tokens above are original implementation choices).
- Example public curriculum index: https://cse.l3.nitk.ac.in/programmes/ug (verify cohort applicability before use).
- Learning resources: https://www.nptel.ac.in/courses and https://www.nptel.ac.in/yt-courses.
- Optional occupational task/skill background: https://www.onetcenter.org/database.html (not evidence of Indian job demand; review attribution/license requirements before reuse).

Use organizer/institution official pages as the authority for specific deadlines, eligibility, course rules, and term offerings. A visual reference to Firecrawl does not require using Firecrawl as the extraction provider.
