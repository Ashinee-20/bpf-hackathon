"use client";

import { FormEvent, useState } from "react";
import {
  ArrowUp,
  BookOpenCheck,
  Check,
  Clock3,
  ExternalLink,
  Sparkles,
  Target,
} from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { MessageResponse } from "@/components/ai-elements/message";
import { LEARNING_RESOURCES } from "@/lib/catalog";
import { useApp } from "@/components/app-provider";
import { LoadingPage } from "@/components/loading-page";

const MODES = {
  explain: {
    label: "Understand",
    placeholder: "What concept should we make clear?",
    helper: "Build a mental model with an example.",
  },
  prepare: {
    label: "Prepare",
    placeholder: "What topic, interview, or assessment are you preparing for?",
    helper: "Create a focused practice route.",
  },
  explore: {
    label: "Try a role",
    placeholder: "Which career task do you want to simulate?",
    helper: "Sample the work before committing to the label.",
  },
} as const;

export default function LearnPage() {
  const { state, loading, mutate, refresh } = useApp();
  const [mode, setMode] = useState<keyof typeof MODES>("explain");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  const [liveAnswer, setLiveAnswer] = useState("");
  if (loading || !state) return <LoadingPage />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    setBusy(true);
    setLocalError("");
    setLiveAnswer("");
    const response = await fetch("/api/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, question }),
    });
    if (!response.ok) {
      const data = await response.json();
      setBusy(false);
      setLocalError(data.message);
      return;
    }
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (reader)
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setLiveAnswer((old) => old + decoder.decode(value, { stream: true }));
      }
    setBusy(false);
    setQuestion("");
    setLiveAnswer("");
    await refresh();
  }

  const due =
    !state.lastCheckin ||
    Date.now() - new Date(state.lastCheckin).getTime() >= 7 * 86400000;
  return (
    <div className="page learning-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Learning studio</span>
          <h1>Turn a question into evidence and action</h1>
          <p className="subtitle">
            Understand coursework, prepare deliberately, or test what a career
            actually feels like—then record what you learned.
          </p>
        </div>
        {due && (
          <span className="badge orange">
            <Clock3 size={13} /> Weekly reflection due
          </span>
        )}
      </div>
      <div className="learning-intent" aria-label="Learning mode">
        {(
          Object.entries(MODES) as Array<
            [keyof typeof MODES, (typeof MODES)[keyof typeof MODES]]
          >
        ).map(([key, item]) => (
          <button
            type="button"
            className={`intent-card ${mode === key ? "active" : ""}`}
            onClick={() => setMode(key)}
            key={key}
          >
            <strong>{item.label}</strong>
            <span>{item.helper}</span>
          </button>
        ))}
      </div>
      <div className="learn-layout">
        <section className="card conversation-card">
          <Conversation className="messages">
            <ConversationContent className="conversation-content">
              {state.interactions.length === 0 && !liveAnswer && (
                <ConversationEmptyState
                  icon={<Sparkles size={26} />}
                  title="Start a purposeful learning session"
                  description="Ask for a concept explanation, a practice route, or a small role-shaped task. Your feedback—not the question alone—updates your guidance."
                />
              )}
              {state.interactions.slice(-8).map((item) => (
                <div className="exchange" key={item.id}>
                  <div className="message user">{item.question}</div>
                  <div className="message ai">
                    <MessageResponse>{item.answer}</MessageResponse>
                  </div>
                  {!item.feedback && (
                    <div className="feedback" aria-label="Activity feedback">
                      <span className="fine">What did this tell you?</span>
                      <button
                        onClick={() =>
                          mutate("feedback", {
                            id: item.id,
                            interest: "high",
                            feedback: {
                              interest: "interesting",
                              difficulty: "manageable",
                              continue: "yes",
                            },
                          })
                        }
                      >
                        Worth continuing
                      </button>
                      <button
                        onClick={() =>
                          mutate("feedback", {
                            id: item.id,
                            interest: "low",
                            feedback: {
                              interest: "not for me yet",
                              difficulty: "hard",
                              continue: "maybe",
                            },
                          })
                        }
                      >
                        Not for me yet
                      </button>
                      <button
                        onClick={() =>
                          mutate("feedback", {
                            id: item.id,
                            feedback: { difficulty: "hard" },
                          })
                        }
                      >
                        Too difficult
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {liveAnswer && (
                <div className="message ai" aria-live="polite">
                  <MessageResponse isAnimating>{liveAnswer}</MessageResponse>
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton aria-label="Scroll to latest response" />
          </Conversation>
          {localError && (
            <div className="notice" role="alert">
              <strong>Live AI did not answer.</strong>
              <br />
              {localError}
              <br />
              <span className="fine">
                Your existing learning history is unchanged.
              </span>
            </div>
          )}
          <form className="composer" onSubmit={submit}>
            <div className="composer-context">
              <Target size={14} />
              <span>
                <strong>{MODES[mode].label}:</strong> {MODES[mode].helper}
              </span>
            </div>
            <textarea
              aria-label="Learning question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={MODES[mode].placeholder}
            />
            <div className="composer-bottom">
              <span className="fine">
                The response is saved to this learning history.
              </span>
              <button
                className="btn btn-primary"
                disabled={busy || question.trim().length < 3}
                aria-label="Send question"
              >
                {busy ? (
                  "Thinking…"
                ) : (
                  <>
                    <span>Start session</span>
                    <ArrowUp size={17} />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
        <aside className="stack">
          <section className="card">
            <span className="label">Reflection signals</span>
            <h2>What Pathwise may learn</h2>
            {state.observations.length === 0 ? (
              <p className="subtitle">
                Only your explicit feedback can suggest a preference update.
                Asking an exam question does not become a career signal.
              </p>
            ) : (
              state.observations.map((observation, index) => (
                <div
                  className="plan-item"
                  key={`${observation.reason}-${index}`}
                >
                  <span>
                    <strong>{observation.value}</strong>
                    <br />
                    <span className="fine">{observation.reason}</span>
                  </span>
                  {observation.status === "proposed" ? (
                    <button
                      className="btn"
                      onClick={() => mutate("confirm_observation", { index })}
                    >
                      <Check size={14} /> Confirm
                    </button>
                  ) : (
                    <span className="badge success">Confirmed</span>
                  )}
                </div>
              ))
            )}
          </section>
          <section className="card">
            <span className="label">Verified follow-up</span>
            <h2>Continue with a trusted source</h2>
            {LEARNING_RESOURCES.map((resource) => (
              <a
                className="plan-item"
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                key={resource.url}
              >
                <span>
                  <strong>{resource.title}</strong>
                  <br />
                  <span className="fine">{resource.provider}</span>
                </span>
                <ExternalLink size={14} />
              </a>
            ))}
          </section>
          <section className="notice">
            <BookOpenCheck size={17} /> <strong>Assessment boundary</strong>
            <br />
            <span className="fine">
              A correct practice answer is evidence for that item, not broad
              mastery. Exam questions do not automatically become
              career-interest signals.
            </span>
          </section>
        </aside>
      </div>
    </div>
  );
}
