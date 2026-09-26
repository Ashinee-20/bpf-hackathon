"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarRange,
  ClipboardCheck,
  Compass,
  GraduationCap,
  Menu,
  Route,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useApp } from "./app-provider";

const links = [
  { href: "/app/careers", label: "Career Planner", icon: Compass },
  { href: "/app/learn", label: "Learning Studio", icon: GraduationCap },
  {
    href: "/app/opportunities",
    label: "Enhance Profile",
    icon: BriefcaseBusiness,
  },
  { href: "/app/tracker", label: "Tracker & This Week", icon: ClipboardCheck },
  { href: "/app/semester", label: "My Semester", icon: CalendarRange },
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, refresh } = useApp();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const previous = useRef<Record<string, string>>({});
  useEffect(() => {
    const processing = state?.jobs?.some(
      (job) => job.status === "queued" || job.status === "processing",
    );
    if (!processing) return;
    const timer = setInterval(() => refresh(), 1800);
    return () => clearInterval(timer);
  }, [state?.jobs, refresh]);
  useEffect(() => {
    if (!state) return;
    for (const job of state.jobs ?? []) {
      const before = previous.current[job.id];
      if (
        before &&
        before !== job.status &&
        ["ready", "partial", "failed"].includes(job.status)
      ) {
        const label =
          job.type === "document"
            ? "Document"
            : job.type === "preparation"
              ? "Preparation checklist"
              : "Opportunity search";
        setToast(
          job.status === "failed"
            ? `${label} failed: ${job.error ?? "Please retry."}`
            : `${label} finished.`,
        );
        setTimeout(() => setToast(""), 5000);
      }
      previous.current[job.id] = job.status;
    }
  }, [state]);
  return (
    <div className="app-frame">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link className="brand" href="/">
            <span className="brand-mark">
              <Route size={18} />
            </span>
            Pathwise
          </Link>
          <button
            className="btn mobile-menu"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X size={17} />
          </button>
        </div>
        <nav className="nav-list" aria-label="Main navigation">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              onClick={() => setOpen(false)}
              className={`nav-link ${pathname === href ? "active" : ""}`}
              key={href}
              href={href}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link
            className={`nav-link ${pathname === "/app/profile" ? "active" : ""}`}
            href="/app/profile"
          >
            <UserRound size={18} />
            Profile & Documents
          </Link>
          <span className="nav-link">
            <Settings size={18} />
            Settings <span className="fine">Soon</span>
          </span>
          {state?.demo && (
            <div className="notice fine" style={{ marginTop: 10 }}>
              <Sparkles size={13} /> Synthetic demo data
            </div>
          )}
        </div>
      </aside>
      <main className="app-main">
        <header className="app-header">
          <button
            className="btn mobile-menu"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu size={18} />
          </button>
          <div className="header-context">
            <strong>{state?.profile.branch || "Computing program"}</strong>
            <span>·</span>
            <span>Semester {state?.profile.semester || "—"}</span>
          </div>
          <Link
            className="btn btn-primary"
            href={
              pathname === "/app/semester"
                ? "/app/semester#update"
                : "/app/learn"
            }
          >
            {pathname === "/app/semester" ? "Update semester" : "Ask Pathwise"}
          </Link>
        </header>
        {children}
      </main>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
