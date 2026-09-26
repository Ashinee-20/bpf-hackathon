import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  GraduationCap,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { LandingActions } from "@/components/landing-actions";

const features = [
  {
    icon: Compass,
    title: "Career-fit discovery",
    text: "Compare multiple directions side by side and keep your options honest with real prerequisites, credits, and deadlines.",
  },
  {
    icon: BookOpenCheck,
    title: "Semester planning",
    text: "See the next few terms as a living roadmap that catches conflicts, counts shared courses once, and updates as your results change.",
  },
  {
    icon: Sparkles,
    title: "Daily learning nudges",
    text: "Get short, focused explanations and practice prompts that make progress feel continuous instead of abstract.",
  },
];

const steps = [
  {
    title: "Map your goals",
    text: "Choose the paths, interests, and constraints you want to take seriously before the semester gets crowded.",
  },
  {
    title: "Check the evidence",
    text: "Every prerequisite, pending result, and requirement stays visible so you can understand the risk instead of guessing.",
  },
  {
    title: "Commit with confidence",
    text: "Review your plan, identify what is still uncertain, and move forward with a clearer signal for the next enrollment cycle.",
  },
];

export default function Home() {
  return (
    <main className="landing onepager grid-bg">
      <nav className="landing-nav onepager-nav">
        <div className="brand">
          <span className="brand-mark">
            <Route size={18} />
          </span>
          Pathwise
        </div>

        <div className="onepager-links">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#evidence">Evidence</a>
        </div>

        <a className="btn btn-quiet" href="/onboarding">
          Start onboarding
        </a>
      </nav>

      <section className="hero onepager-hero">
        <div>
          <p className="eyebrow">Academic decisions, with the evidence attached</p>
          <h1>Turn uncertainty into a practical semester plan.</h1>
          <p className="hero-copy">
            Pathwise helps computing students compare career paths, map prerequisites,
            and keep each next decision grounded in real evidence instead of vague advice.
          </p>

          <LandingActions />

          <div className="onepager-proof">
            <span className="proof-pill">
              <Target size={14} />
              Multi-path planning
            </span>
            <span className="proof-pill">
              <ShieldCheck size={14} />
              Evidence-first rules
            </span>
            <span className="proof-pill">
              <GraduationCap size={14} />
              Semester-ready guidance
            </span>
          </div>
        </div>

        <div className="hero-card onepager-card">
          <span className="badge orange">
            <Compass size={13} />
            Two paths in view
          </span>
          <h2>One plan. More than one future.</h2>
          <p className="subtitle">
            A combined roadmap keeps shared courses from being counted twice while still
            making each direction visible.
          </p>

          <div className="mini-roadmap">
            <div className="mini-row">
              <span className="dot" />
              <div>
                <strong>Database Systems</strong>
                <div className="fine">Software · Data · Product</div>
              </div>
              <CheckCircle2 size={18} style={{ marginLeft: "auto", color: "var(--success)" }} />
            </div>
            <div className="mini-row">
              <span className="dot" />
              <div>
                <strong>Machine Learning</strong>
                <div className="fine">AI/ML · Research</div>
              </div>
              <BookOpenCheck size={18} style={{ marginLeft: "auto", color: "var(--accent-strong)" }} />
            </div>
          </div>

          <div className="notice" style={{ marginTop: 18 }}>
            <strong>Known, unknown, and why.</strong>
            <br />
            <span className="fine">
              Every prerequisite result keeps its evidence and uncertainty visible.
            </span>
          </div>
        </div>
      </section>

      <section id="features" className="onepager-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Why students use it</p>
            <h2>Everything you need to choose a direction without losing momentum.</h2>
          </div>
        </div>

        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className="feature-card">
              <div className="feature-icon">
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="onepager-section alt-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">How it works</p>
            <h2>From vague goals to a concrete, reviewable plan.</h2>
          </div>
        </div>

        <div className="workflow-grid">
          {steps.map(({ title, text }, index) => (
            <div key={title} className="step-card">
              <span className="step-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="evidence" className="onepager-section evidence-layout">
        <div className="evidence-copy">
          <p className="eyebrow">Built for real decisions</p>
          <h2>It shows what is known, what is pending, and what still needs a decision.</h2>
          <ul className="check-list">
            <li>
              <span className="list-badge">
                <CheckCircle2 size={14} />
              </span>
              Keep prerequisite outcomes, deadlines, and credits in one clear view.
            </li>
            <li>
              <span className="list-badge">
                <CheckCircle2 size={14} />
              </span>
              Separate official constraints from exploratory ideas and future possibilities.
            </li>
            <li>
              <span className="list-badge">
                <CheckCircle2 size={14} />
              </span>
              Review each semester before commit so you can adapt without surprise.
            </li>
          </ul>
        </div>

        <div className="evidence-panel">
          <div className="mini-stat">
            <BriefcaseBusiness size={18} />
            <div>
              <strong>Career tabs</strong>
              <span>Compare paths independently</span>
            </div>
          </div>
          <div className="mini-stat">
            <Route size={18} />
            <div>
              <strong>One combined plan</strong>
              <span>Shared courses only counted once</span>
            </div>
          </div>
          <div className="mini-stat">
            <Sparkles size={18} />
            <div>
              <strong>Learning support</strong>
              <span>Daily explanations and practice</span>
            </div>
          </div>
        </div>
      </section>

      <section className="onepager-cta">
        <div>
          <p className="eyebrow">Ready to try it?</p>
          <h2>Start with a clear plan instead of a crowded guess.</h2>
        </div>
        <a className="btn btn-primary" href="/onboarding">
          Build my plan
          <ArrowRight size={17} />
        </a>
      </section>
    </main>
  );
}
