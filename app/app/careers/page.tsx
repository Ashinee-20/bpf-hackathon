"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  LoaderCircle,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { CAREERS, COURSES, LEARNING_RESOURCES } from "@/lib/catalog";
import { checkPrerequisites } from "@/lib/rules";
import { useApp } from "@/components/app-provider";
import { LoadingPage } from "@/components/loading-page";

export default function CareersPage() {
  const { state, loading, mutate, error } = useApp();
  const [active, setActive] = useState("");
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!state) return;
    const query = new URLSearchParams(window.location.search).get("path");
    const first = state.paths.find((p) => p.active)?.id || "";
    setActive(
      query && state.paths.some((p) => p.id === query && p.active)
        ? query
        : first,
    );
  }, [state?.paths]);
  function select(id: string) {
    setActive(id);
    window.history.replaceState(
      null,
      "",
      `/app/careers?path=${encodeURIComponent(id)}`,
    );
  }
  const path = state?.paths.find((p) => p.id === active);
  const info = CAREERS.find((c) => c.id === active);
  const recommendations = useMemo(
    () => COURSES.filter((c) => c.paths.includes(active as never)),
    [active],
  );
  if (loading || !state) return <LoadingPage />;
  const processingDocuments = state.documents.filter((document) =>
    ["queued", "processing"].includes(document.status),
  );
  const pathMilestones = path
    ? [
        state.plan.some((course) => course.careers.includes(path.id)),
        state.interactions.some((interaction) => interaction.feedback),
        state.opportunities.some(
          (opportunity) =>
            opportunity.paths.includes(path.id) &&
            Boolean(state.savedOpportunities[opportunity.id]) &&
            state.savedOpportunities[opportunity.id] !== "dismissed",
        ),
        state.projects.some(
          (project) =>
            project.pathId === path.id && project.status !== "planned",
        ),
      ]
    : [];
  const pathProgress = pathMilestones.length
    ? Math.round(
        (pathMilestones.filter(Boolean).length / pathMilestones.length) * 100,
      )
    : 0;
  async function pause(id: string) {
    await mutate("toggle_path", { id, active: false });
    setToast(
      "Path paused. Your learning history and semester plan were preserved.",
    );
    setTimeout(() => setToast(""), 4000);
  }
  async function addCourse(code: string) {
    await mutate("add_course", { code, career: active });
    setToast("Added to the combined semester plan.");
    setTimeout(() => setToast(""), 2500);
  }
  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Career planner</span>
          <h1>Keep your options connected</h1>
          <p className="subtitle">
            Compare independent paths. Your semester plan stays combined.
          </p>
        </div>
        <button className="btn" onClick={() => setAdding(!adding)}>
          <Plus size={16} /> Add path
        </button>
      </div>
      {processingDocuments.length > 0 && (
        <div className="processing-banner" role="status">
          <LoaderCircle className="spin" size={19} />
          <div>
            <strong>Your academic source is still processing.</strong>
            <br />
            <span className="fine">
              Career exploration is available now. Curriculum-grounded guidance
              will update automatically when processing finishes.
            </span>
          </div>
        </div>
      )}
      {state.guidanceStale && (
        <div className="notice" style={{ marginBottom: 16 }}>
          <strong>Guidance needs a refresh.</strong> Your confirmed academic or
          preference data changed. Deterministic checks below already use the
          latest record.
        </div>
      )}
      <div className="tabs" role="tablist" aria-label="Active career paths">
        {state.paths
          .filter((p) => p.active)
          .map((p) => (
            <button
              role="tab"
              aria-selected={active === p.id}
              className={`tab ${active === p.id ? "active" : ""}`}
              onClick={() => select(p.id)}
              key={p.id}
            >
              {p.label}
              <span
                role="button"
                tabIndex={0}
                aria-label={`Pause ${p.label}`}
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  pause(p.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    pause(p.id);
                  }
                }}
              >
                <X size={13} />
              </span>
            </button>
          ))}
        {state.paths
          .filter((p) => !p.active)
          .map((p) => (
            <button
              className="tab"
              key={p.id}
              onClick={() => mutate("toggle_path", { id: p.id, active: true })}
            >
              <RotateCcw size={13} /> Restore {p.label}
            </button>
          ))}
      </div>
      {adding && (
        <div className="card" style={{ marginBottom: 18 }}>
          <strong>Add another path</strong>
          <div className="chips">
            {CAREERS.filter((c) => !state.paths.some((p) => p.id === c.id)).map(
              (c) => (
                <button
                  className="chip"
                  key={c.id}
                  onClick={async () => {
                    await mutate("add_path", { id: c.id, label: c.label });
                    setAdding(false);
                  }}
                >
                  {c.label}
                </button>
              ),
            )}
          </div>
        </div>
      )}
      {!path ? (
        <div className="empty">
          <CompassIcon />
          <h2>No active path yet</h2>
          <p>
            That’s valid. Add a path when you are ready, or try a career task in
            Learning Studio.
          </p>
          <Link className="btn btn-primary" href="/app/learn">
            Explore a career task
          </Link>
        </div>
      ) : (
        <div className="content-grid">
          <div className="stack">
            <section className="card">
              <span className="label">Career overview</span>
              <h2 style={{ fontSize: 24, marginTop: 8 }}>{path.label}</h2>
              <p>
                {info?.description || "A custom path you chose to explore."}
              </p>
              <div className="path-progress">
                <div className="section-heading">
                  <span><strong>Exploration progress</strong><br/><span className="fine">Completed actions for this path—not a compatibility score.</span></span>
                  <strong>{pathProgress}%</strong>
                </div>
                <div className="progress-track" aria-label={`${pathProgress}% exploration progress for ${path.label}`}><span style={{ width: `${pathProgress}%` }}/></div>
                <div className="milestone-row"><span className={pathMilestones[0] ? "done" : ""}>Course</span><span className={pathMilestones[1] ? "done" : ""}>Reflection</span><span className={pathMilestones[2] ? "done" : ""}>Opportunity</span><span className={pathMilestones[3] ? "done" : ""}>Project</span></div>
              </div>
              <p className="fine">
                <strong>Why it is here:</strong> You explicitly selected this
                path during onboarding. No compatibility score has been
                inferred.
              </p>
            </section>
            <section className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <span className="label">Academic roadmap</span>
                  <h2>Relevant course options</h2>
                </div>
                <span className="badge warn">Advisory</span>
              </div>
              {recommendations.length ? (
                recommendations.map((course) => {
                  const eligibility = checkPrerequisites(course.code, state);
                  const planned = state.plan.some(
                    (p) => p.code === course.code,
                  );
                  return (
                    <article className="course" key={course.code}>
                      <div>
                        <h3>
                          {course.code} · {course.title}
                        </h3>
                        <div className="course-meta">
                          <span className="badge">
                            {course.credits} credits
                          </span>
                          <span className="badge">
                            Suggested term {course.term}
                          </span>
                          <span
                            className={`badge ${eligibility.state === "met" ? "success" : eligibility.state === "unmet" ? "warn" : ""}`}
                          >
                            {eligibility.state === "met" ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <CircleAlert size={12} />
                            )}{" "}
                            Prerequisite: {eligibility.state}
                          </span>
                        </div>
                        <p>
                          {course.topics} support work across{" "}
                          {course.paths
                            .map((p) => CAREERS.find((c) => c.id === p)?.label)
                            .join(", ")}
                          .
                        </p>
                        <p className="evidence">
                          <strong>Rule check:</strong> {eligibility.reason}
                          <br />
                          <strong>Source:</strong> {course.evidence}. This
                          prototype subset is synthetic and needs cohort
                          confirmation.
                        </p>
                      </div>
                      <button
                        className="btn"
                        disabled={planned || eligibility.state === "unmet"}
                        onClick={() => addCourse(course.code)}
                      >
                        {planned ? (
                          <>
                            <CheckCircle2 size={16} /> In plan
                          </>
                        ) : (
                          <>
                            <Plus size={16} /> Add
                          </>
                        )}
                      </button>
                    </article>
                  );
                })
              ) : (
                <div className="empty">
                  No mapped course candidates for this custom path yet.
                </div>
              )}
            </section>
            <section className="card">
              <span className="label">Beyond college</span>
              <h2>Verified places to learn</h2>
              {LEARNING_RESOURCES.slice(0, 2).map((resource) => (
                <div className="plan-item" key={resource.url}>
                  <span>
                    <strong>{resource.title}</strong>
                    <br />
                    <span className="fine">{resource.note}</span>
                  </span>
                  <a
                    className="btn"
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </section>
          </div>
          <aside className="stack">
            <section className="callout">
              <span className="label">One useful next step</span>
              <h2>Test the work, not the label.</h2>
              <p>
                Spend 25 minutes on a small{" "}
                {info?.orientation === "research"
                  ? "paper-reading and reproduction"
                  : "role-shaped practical"}{" "}
                task, then record interest and difficulty separately.
              </p>
              <Link className="btn btn-primary" href="/app/learn">
                Start an activity <ArrowRight size={15} />
              </Link>
            </section>
            <section className="card">
              <span className="label">Combined plan</span>
              <h2>
                {state.plan.length} course{state.plan.length === 1 ? "" : "s"}
              </h2>
              {state.plan.length ? (
                state.plan.map((course) => (
                  <div className="plan-item" key={course.code}>
                    <span>
                      <strong>{course.code}</strong>
                      <br />
                      <span className="fine">
                        {course.careers
                          .map(
                            (id) =>
                              CAREERS.find((c) => c.id === id)?.label || id,
                          )
                          .join(" · ")}
                      </span>
                    </span>
                    <span>{course.credits ?? "?"} cr</span>
                  </div>
                ))
              ) : (
                <p className="subtitle">
                  Nothing planned yet. A shared course is counted only once.
                </p>
              )}
              <Link
                className="btn"
                style={{ width: "100%", marginTop: 14 }}
                href="/app/semester"
              >
                Review semester
              </Link>
            </section>
            <section className="card">
              <span className="label">Enhance this profile</span>
              <h2>Find track-shaped practice</h2>
              <p className="subtitle">
                Live discovery uses Firecrawl; eligibility remains unknown until
                official criteria are checked.
              </p>
              <Link className="btn" href={`/app/opportunities?path=${active}`}>
                Browse opportunities
              </Link>
            </section>
          </aside>
        </div>
      )}
      {error && <div className="toast">{error}</div>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
function CompassIcon() {
  return <BookOpen size={28} style={{ color: "var(--accent)" }} />;
}
