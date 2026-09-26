"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Link2,
  LoaderCircle,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type { AppState } from "@/lib/types";
import { useApp } from "@/components/app-provider";
import { LoadingPage } from "@/components/loading-page";

const STATUS_LABELS = {
  queued: "Queued",
  processing: "Processing",
  ready: "Ready",
  partial: "Needs review",
  failed: "Failed",
} as const;

export default function ProfilePage() {
  const { state, loading, mutate, refresh } = useApp();
  const [profile, setProfile] = useState<AppState["profile"]>();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (state) setProfile(state.profile);
  }, [state]);
  const pendingDocuments = useMemo(
    () =>
      state?.documents.filter((document) =>
        ["queued", "processing"].includes(document.status),
      ) ?? [],
    [state?.documents],
  );

  if (loading || !state || !profile) return <LoadingPage />;

  function set<K extends keyof AppState["profile"]>(
    key: K,
    value: AppState["profile"][K],
  ) {
    setProfile((old) => (old ? { ...old, [key]: value } : old));
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setMessage("");
    const form = event.currentTarget;
    const response = await fetch("/api/documents", {
      method: "POST",
      body: new FormData(form),
    });
    const data = await response.json();
    setUploading(false);
    setMessage(data.message);
    if (response.ok) {
      form.reset();
      await refresh();
    }
  }

  async function save() {
    await mutate("onboarding", { profile, step: 4, complete: true });
    setMessage("Profile saved. Dependent guidance will use this version.");
  }

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Profile & documents</span>
          <h1>Your academic context</h1>
          <p className="subtitle">
            Edit the facts Pathwise is allowed to use and see each source’s
            readiness.
          </p>
        </div>
        <button className="btn btn-primary" onClick={save}>
          <Save size={16} /> Save changes
        </button>
      </div>
      {pendingDocuments.length > 0 && (
        <div className="processing-banner" role="status">
          <LoaderCircle className="spin" size={19} />
          <div>
            <strong>
              {pendingDocuments.length} document
              {pendingDocuments.length === 1 ? " is" : "s are"} processing
            </strong>
            <br />
            <span className="fine">
              You can keep using Pathwise. Guidance based on these sources will
              appear after extraction and validation finish.
            </span>
          </div>
        </div>
      )}
      <div className="content-grid">
        <div className="stack">
          <section className="card">
            <span className="label">Academic identity</span>
            <div className="form-grid">
              <div className="field">
                <label>Preferred name</label>
                <input
                  className="input"
                  value={profile.preferredName}
                  onChange={(event) => set("preferredName", event.target.value)}
                />
              </div>
              <div className="field">
                <label>University</label>
                <input
                  className="input"
                  value={profile.university}
                  onChange={(event) => set("university", event.target.value)}
                />
              </div>
              <div className="field">
                <label>Program</label>
                <input
                  className="input"
                  value={profile.program}
                  onChange={(event) => set("program", event.target.value)}
                />
              </div>
              <div className="field">
                <label>Branch</label>
                <input
                  className="input"
                  value={profile.branch}
                  onChange={(event) => set("branch", event.target.value)}
                />
              </div>
              <div className="field">
                <label>Cohort</label>
                <input
                  className="input"
                  value={profile.cohort}
                  onChange={(event) => set("cohort", event.target.value)}
                />
              </div>
              <div className="field">
                <label>Current semester</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  max={profile.programLength}
                  value={profile.semester}
                  onChange={(event) =>
                    set("semester", Number(event.target.value))
                  }
                />
              </div>
              <div className="field">
                <label>Weekly exploration hours</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="40"
                  value={profile.weeklyHours}
                  onChange={(event) =>
                    set("weeklyHours", Number(event.target.value))
                  }
                />
              </div>
              <div className="field">
                <label>Learning language</label>
                <input
                  className="input"
                  value={profile.language}
                  onChange={(event) => set("language", event.target.value)}
                />
              </div>
            </div>
          </section>
          <section className="card">
            <span className="label">Sources</span>
            <h2>Documents and public pages</h2>
            <div className="doc-list">
              {state.documents.map((document) => (
                <div
                  className={`doc ${["queued", "processing"].includes(document.status) ? "doc-processing" : ""}`}
                  key={document.id}
                >
                  <span>
                    <strong>{document.name}</strong>{" "}
                    <span
                      className={`badge ${document.status === "ready" ? "success" : "warn"}`}
                    >
                      {["queued", "processing"].includes(document.status) && (
                        <LoaderCircle className="spin" size={12} />
                      )}{" "}
                      {STATUS_LABELS[document.status]}
                    </span>
                    <br />
                    <span className="fine">
                      {document.scope} · {document.message}
                    </span>
                  </span>
                  <button
                    className="btn"
                    aria-label={`Remove ${document.name}`}
                    onClick={() =>
                      mutate("remove_document", { id: document.id })
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {state.documents.length === 0 && (
                <div className="empty">
                  No sources yet. General exploration remains available.
                </div>
              )}
            </div>
          </section>
        </div>
        <aside className="stack">
          <form className="card" onSubmit={upload}>
            <span className="label">Add a source</span>
            <h2>Process a curriculum or record</h2>
            <div className="field">
              <label>
                <Link2 size={14} /> Public URL
              </label>
              <input
                className="input"
                type="url"
                name="url"
                placeholder="https://…"
              />
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label>
                <FileText size={14} /> Or PDF
              </label>
              <input
                className="input"
                type="file"
                name="file"
                accept="application/pdf"
              />
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label>Document type</label>
              <select className="input" name="type">
                <option value="curriculum">Curriculum / regulations</option>
                <option value="transcript">Transcript / marksheet</option>
                <option value="offering">Offering list / timetable</option>
              </select>
            </div>
            <button
              className="btn"
              disabled={uploading}
              style={{ width: "100%", marginTop: 14 }}
            >
              {uploading ? (
                <>
                  <LoaderCircle className="spin" size={15} /> Submitting…
                </>
              ) : (
                "Process source"
              )}
            </button>
          </form>
          <div className="notice">
            <ShieldCheck size={17} /> <strong>Privacy boundary</strong>
            <br />
            <span className="fine">
              Use synthetic student records only. Public curriculum sources stay
              separate from private student documents. Removing a source marks
              dependent guidance stale.
            </span>
          </div>
          {message && (
            <div className="notice" role="status">
              {message}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
