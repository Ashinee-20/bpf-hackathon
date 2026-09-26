"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Check,
  Circle,
  ExternalLink,
  FolderKanban,
  Plus,
  Target,
} from "lucide-react";
import type { Opportunity } from "@/lib/types";
import { useApp } from "@/components/app-provider";
import { LoadingPage } from "@/components/loading-page";

export default function TrackerPage() {
  const { state, loading, mutate, refresh } = useApp();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [busyOpportunity, setBusyOpportunity] = useState("");

  const saved = useMemo(
    () =>
      state?.opportunities.filter((item) => {
        const status = state.savedOpportunities[item.id];
        return status && status !== "dismissed";
      }) ?? [],
    [state?.opportunities, state?.savedOpportunities],
  );

  const weeklyTasks = useMemo(() => {
    if (!state) return [];
    const tasks: Array<{
      id: string;
      area: string;
      title: string;
      why: string;
    }> = [];
    const course = state.plan[0];
    if (course)
      tasks.push({
        id: `course-${course.code}`,
        area: "Academic",
        title: `Complete one focused block for ${course.code} · ${course.title}`,
        why: "Keeps the shared semester plan moving.",
      });
    else
      tasks.push({
        id: "academic-plan",
        area: "Academic",
        title: "Choose one course for the combined semester plan",
        why: "Connect curriculum constraints to all active paths.",
      });
    for (const path of state.paths.filter((item) => item.active).slice(0, 2))
      tasks.push({
        id: `path-${path.id}`,
        area: "Career",
        title: `Try one 25-minute ${path.label} task`,
        why: "Test the work, then record interest and difficulty separately.",
      });
    const opportunity = saved[0];
    if (opportunity)
      tasks.push({
        id: `opportunity-${opportunity.id}`,
        area: "Profile",
        title: `Take the next step for ${opportunity.title}`,
        why:
          state.preparationPlans[opportunity.id]?.[0] ??
          "Review its official eligibility and deadline.",
      });
    else
      tasks.push({
        id: "discover-opportunity",
        area: "Profile",
        title: "Run live opportunity discovery",
        why: "Find one credible way to build evidence beyond coursework.",
      });
    return tasks.slice(0, 5);
  }, [state, saved]);

  if (loading || !state) return <LoadingPage />;
  const completedCount = weeklyTasks.filter((task) =>
    state.completedWeeklyTasks.includes(task.id),
  ).length;

  async function addProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await mutate("add_project", {
      title: data.get("title"),
      pathId: data.get("pathId"),
      goal: data.get("goal"),
      nextStep: data.get("nextStep"),
    });
    event.currentTarget.reset();
    setShowProjectForm(false);
  }

  async function updateOpportunity(item: Opportunity, action: string) {
    setBusyOpportunity(item.id);
    await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, opportunity: item }),
    });
    await refresh();
    setBusyOpportunity("");
  }

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Action tracker</span>
          <h1>Turn guidance into visible progress</h1>
          <p className="subtitle">
            Bring academic work, career experiments, opportunities, and
            portfolio projects into one practical view.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowProjectForm((value) => !value)}
        >
          <Plus size={16} /> Add project
        </button>
      </div>

      <section className="card weekly-plan">
        <div className="section-heading">
          <div>
            <span className="label">This week</span>
            <h2>A combined academic + career plan</h2>
          </div>
          <strong>
            {completedCount}/{weeklyTasks.length} done
          </strong>
        </div>
        <div
          className="progress-track"
          aria-label={`${completedCount} of ${weeklyTasks.length} weekly tasks completed`}
        >
          <span
            style={{
              width: `${weeklyTasks.length ? (completedCount / weeklyTasks.length) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="weekly-tasks">
          {weeklyTasks.map((task) => {
            const done = state.completedWeeklyTasks.includes(task.id);
            return (
              <button
                className={`weekly-task ${done ? "done" : ""}`}
                key={task.id}
                onClick={() => mutate("toggle_weekly_task", { id: task.id })}
              >
                <span className="task-check">
                  {done ? <Check size={15} /> : <Circle size={15} />}
                </span>
                <span>
                  <span className="badge">{task.area}</span>
                  <strong>{task.title}</strong>
                  <small>{task.why}</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {showProjectForm && (
        <form className="card project-form" onSubmit={addProject}>
          <span className="label">New portfolio project</span>
          <h2>Define a project with a next action</h2>
          <div className="form-grid">
            <div className="field">
              <label>Project title</label>
              <input
                className="input"
                name="title"
                required
                placeholder="Campus event discovery app"
              />
            </div>
            <div className="field">
              <label>Career path</label>
              <select className="input" name="pathId" required>
                {state.paths
                  .filter((item) => item.active)
                  .map((path) => (
                    <option value={path.id} key={path.id}>
                      {path.label}
                    </option>
                  ))}
              </select>
            </div>
            <div className="field full">
              <label>Outcome / goal</label>
              <input
                className="input"
                name="goal"
                placeholder="A working demo and a short case study"
              />
            </div>
            <div className="field full">
              <label>Next smallest step</label>
              <input
                className="input"
                name="nextStep"
                required
                placeholder="Sketch the first user flow"
              />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 14 }}>
            Create project
          </button>
        </form>
      )}

      <div className="tracker-grid">
        <section className="card">
          <div className="section-heading">
            <div>
              <span className="label">Opportunity tracker</span>
              <h2>Saved and in progress</h2>
            </div>
            <BriefcaseBusiness size={20} />
          </div>
          {saved.length === 0 ? (
            <div className="empty">
              <p>No saved opportunities yet.</p>
              <Link className="btn" href="/app/opportunities">
                Discover opportunities
              </Link>
            </div>
          ) : (
            saved.map((item) => (
              <div className="tracker-item" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p className="fine">
                    {item.organizer} ·{" "}
                    {item.deadline
                      ? `Deadline ${item.deadline}`
                      : "Deadline unknown"}
                  </p>
                </div>
                <div className="tracker-actions">
                  <select
                    className="input compact"
                    aria-label={`Status for ${item.title}`}
                    value={state.savedOpportunities[item.id]}
                    disabled={busyOpportunity === item.id}
                    onChange={(event) =>
                      updateOpportunity(item, event.target.value)
                    }
                  >
                    <option value="saved">Saved</option>
                    <option value="preparing">Preparing</option>
                    <option value="applied">Applied</option>
                    <option value="completed">Completed</option>
                  </select>
                  <a
                    className="btn"
                    href={item.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${item.title}`}
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))
          )}
        </section>
        <section className="card">
          <div className="section-heading">
            <div>
              <span className="label">Project tracker</span>
              <h2>Build proof of work</h2>
            </div>
            <FolderKanban size={20} />
          </div>
          {state.projects.length === 0 ? (
            <div className="empty">
              <Target size={22} />
              <p>
                Add a small project tied to one career path. Track the next
                step, not just the final idea.
              </p>
            </div>
          ) : (
            state.projects.map((project) => (
              <div className="tracker-item" key={project.id}>
                <div>
                  <strong>{project.title}</strong>
                  <p className="fine">
                    {state.paths.find((path) => path.id === project.pathId)
                      ?.label ?? "Career project"}
                    <br />
                    Next: {project.nextStep}
                  </p>
                </div>
                <select
                  className="input compact"
                  aria-label={`Status for ${project.title}`}
                  value={project.status}
                  onChange={(event) =>
                    mutate("update_project", {
                      id: project.id,
                      status: event.target.value,
                    })
                  }
                >
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
