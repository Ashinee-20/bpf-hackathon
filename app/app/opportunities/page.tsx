"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  CalendarClock,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import type { Opportunity } from "@/lib/types";
import { useApp } from "@/components/app-provider";
import { LoadingPage } from "@/components/loading-page";

export default function OpportunitiesPage() {
  const { state, loading, refresh } = useApp();
  const [items, setItems] = useState<Opportunity[]>([]);
  const [source, setSource] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [preparingId, setPreparingId] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(
    () =>
      fetch("/api/opportunities")
        .then((response) => response.json())
        .then((data) => {
          setItems(data.opportunities);
          setSource(data.source);
        }),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    const discovery = state?.jobs
      ?.filter((job) => job.type === "opportunities")
      .at(-1);
    if (discovery?.status === "ready") {
      setDiscovering(false);
      load();
    }
    if (discovery?.status === "failed") {
      setDiscovering(false);
      setError(discovery.error ?? "Discovery failed.");
    }
    if (!preparingId) return;
    const preparation = state?.jobs
      ?.filter(
        (job) => job.type === "preparation" && job.targetId === preparingId,
      )
      .at(-1);
    if (
      state?.preparationPlans[preparingId] ||
      preparation?.status === "failed"
    )
      setPreparingId("");
  }, [state?.jobs, state?.preparationPlans, preparingId, load]);

  const visible = useMemo(
    () =>
      items
        .filter((item) => !item.synthetic)
        .filter((item) => state?.savedOpportunities[item.id] !== "dismissed")
        .filter(
          (item) =>
            filter === "all" || item.category.toLowerCase().includes(filter),
        ),
    [items, state?.savedOpportunities, filter],
  );

  if (loading || !state) return <LoadingPage />;

  async function discover() {
    setDiscovering(true);
    setError("");
    const response = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "discover" }),
    });
    const data = await response.json();
    if (!response.ok) {
      setDiscovering(false);
      setError(data.message);
      return;
    }
    await refresh();
  }

  async function act(action: string, item: Opportunity) {
    setError("");
    if (action === "prepare") setPreparingId(item.id);
    const response = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, opportunity: item }),
    });
    const data = await response.json();
    if (!response.ok) {
      setPreparingId("");
      setError(data.message);
      return;
    }
    await refresh();
  }

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Enhance profile</span>
          <h1>Find experiences that fit the track</h1>
          <p className="subtitle">
            Build credible evidence beyond coursework through live hackathons,
            competitions, conferences, open-source work, and projects.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={discover}
          disabled={discovering}
        >
          <RefreshCw className={discovering ? "spin" : ""} size={16} />
          {discovering ? "Searching in background…" : "Discover live"}
        </button>
      </div>

      <div className="notice" style={{ marginBottom: 18 }}>
        {discovering ? (
          <>
            <strong>Live discovery is running.</strong> You can continue using
            Pathwise; results will appear here when Firecrawl finishes.
          </>
        ) : source === "firecrawl_live" ? (
          <>
            <strong>Live discovery results.</strong> Review eligibility and
            deadlines on the official page before acting.
          </>
        ) : (
          <>
            <strong>No synthetic listings are shown.</strong> Select Discover
            live to search current official pages for your active career paths.
          </>
        )}
      </div>

      <div className="filters">
        <button
          className={`chip ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {["hackathon", "research", "product", "open source"].map((item) => (
          <button
            className={`chip ${filter === item ? "active" : ""}`}
            key={item}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {error && (
        <div
          className="notice"
          role="alert"
          style={{ marginBottom: 18, color: "var(--error)" }}
        >
          {error}
        </div>
      )}

      <div className="opportunity-grid">
        {visible.map((item) => {
          const isPreparing =
            preparingId === item.id ||
            state.jobs.some(
              (job) =>
                job.type === "preparation" &&
                job.targetId === item.id &&
                ["queued", "processing"].includes(job.status),
            );
          const saved =
            state.savedOpportunities[item.id] &&
            state.savedOpportunities[item.id] !== "dismissed";
          return (
            <article className="card op-card" key={item.id}>
              <div className="source-row">
                <span className="badge warn">Live · verify officially</span>
                <span>
                  Checked {new Date(item.checkedAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="label">{item.category}</span>
                <h2 style={{ fontSize: 21, marginTop: 7 }}>{item.title}</h2>
                <p className="subtitle">{item.organizer}</p>
              </div>
              <p>{item.why}</p>
              <div className="status-line">
                <CalendarClock size={15} />
                <span className="deadline">
                  Deadline: {item.deadline ?? "Unknown"}
                </span>
              </div>
              <p className="fine">
                <strong>Eligibility:</strong>{" "}
                {item.eligibility ?? "Unknown—check the official page."}
                <br />
                <strong>Mode:</strong> {item.mode ?? "Unknown"} ·{" "}
                <strong>Fees:</strong> {item.fees ?? "Unknown"}
              </p>
              {isPreparing && (
                <div className="notice" role="status">
                  <LoaderCircle className="spin" size={16} />{" "}
                  <strong>Building your checklist…</strong>
                  <br />
                  <span className="fine">
                    Pathwise is reviewing the known requirements in the
                    background.
                  </span>
                </div>
              )}
              {state.preparationPlans[item.id] && (
                <div className="notice">
                  <strong>Preparation checklist</strong>
                  <ul>
                    {state.preparationPlans[item.id].map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="actions">
                <a
                  className="btn btn-primary"
                  href={item.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Official details <ExternalLink size={14} />
                </a>
                <button className="btn" onClick={() => act("saved", item)}>
                  <Bookmark size={14} /> {saved ? "Saved" : "Save"}
                </button>
                <button
                  className="btn"
                  disabled={isPreparing}
                  onClick={() => act("prepare", item)}
                >
                  {isPreparing ? (
                    <LoaderCircle className="spin" size={14} />
                  ) : (
                    <WandSparkles size={14} />
                  )}{" "}
                  {isPreparing ? "Preparing…" : "Prepare"}
                </button>
                <button
                  className="btn"
                  aria-label={`Dismiss ${item.title}`}
                  onClick={() => act("dismissed", item)}
                >
                  <X size={14} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {visible.length === 0 && (
        <div className="empty">
          <Sparkles size={24} />
          <h2>No live opportunities yet</h2>
          <p>
            Run live discovery. Pathwise will not fill this space with synthetic
            events.
          </p>
        </div>
      )}
    </div>
  );
}
