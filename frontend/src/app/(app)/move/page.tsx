"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { usePraxism, useIsHydrated } from "@/store/usePraxism";
import type { CompletedMove, Outcome, Material } from "@/lib/types";
import { NextMoveCard } from "@/components/NextMoveCard";
import MarkdownView from "@/components/MarkdownView";
import FadeContent from "@/components/FadeContent";
import TextType from "@/components/TextType";
import GradualBlur from "@/components/GradualBlur";

function MaterialItem({ material }: { material: Material }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(material.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-slate border border-rule rounded-lg overflow-hidden transition-colors">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-slate/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-3.5 h-3.5 text-ash transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 3L11 8L6 13" />
          </svg>
          <span className="font-medium text-sm text-bone">{material.title}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="px-2.5 py-1 text-xs rounded border border-rule bg-graphite text-ash hover:text-bone hover:border-ash transition-colors select-none"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-rule bg-slate">
          <MarkdownView content={material.content} />
        </div>
      )}
    </div>
  );
}

export default function MovePage() {
  const hasHydrated = useIsHydrated();
  const {
    sessionId,
    context,
    checkedSteps,
    toggleStep,
    addCompletedMove,
    setCurrentAction,
    setLatestResponse,
    latestResponse,
  } = usePraxism();

  const currentAction = context.currentAction;

  const [cardRevision, setCardRevision] = useState(0);

  // Help State
  const [helpInput, setHelpInput] = useState("");
  const [isAskingHelp, setIsAskingHelp] = useState(false);
  const [isHelping, setIsHelping] = useState(false);
  const [helpResponse, setHelpResponse] = useState<string | null>(null);
  const [helpError, setHelpError] = useState<string | null>(null);

  // Outcome Dialog State
  const [isOutcomeDialogOpen, setIsOutcomeDialogOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false);
  const [outcomeError, setOutcomeError] = useState<string | null>(null);
  const [outcomeMessage, setOutcomeMessage] = useState<string | null>(() => {
    if (latestResponse?.message && latestResponse.message.startsWith("What we learned")) {
      return latestResponse.message;
    }
    return null;
  });

  useEffect(() => {
    document.title = "Your next move — Praxism";
  }, []);

  // Handle "Help me do it" button
  const handleHelpMeDoIt = async () => {
    if (isHelping || isAskingHelp) return;

    setHelpError(null);
    setIsHelping(true);

    try {
      const currentSessionId = sessionId || "session_default";
      const res = await api.next({
        sessionId: currentSessionId,
        context,
        message: "Help me do this",
      });

      setLatestResponse(res);

      if (res.action) {
        const newMaterials = res.action.materials || [];
        const existing = currentAction?.materials || [];
        const existingIds = new Set(newMaterials.map((m) => m.id));
        const merged = [
          ...existing.filter((m) => !existingIds.has(m.id)),
          ...newMaterials,
        ];
        setCurrentAction({
          ...res.action,
          materials: merged.length > 0 ? merged : newMaterials,
        });
        setCardRevision((prev) => prev + 1);
      }
      if (res.message) {
        setHelpResponse(res.message);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not retrieve help materials. Please try again.";
      setHelpError(message);
    } finally {
      setIsHelping(false);
    }
  };

  // Handle Help Request
  const handleAskHelp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = helpInput.trim();
    if (!query || isAskingHelp || isHelping) return;

    setHelpError(null);
    setIsAskingHelp(true);

    try {
      const currentSessionId = sessionId || "session_default";
      const res = await api.next({
        sessionId: currentSessionId,
        context,
        message: query,
      });

      setLatestResponse(res);
      setHelpResponse(res.message || "Advice updated.");
      setHelpInput("");

      if (res.action) {
        setCurrentAction(res.action);
        setCardRevision((prev) => prev + 1);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not retrieve help. Please try again.";
      setHelpError(message);
    } finally {
      setIsAskingHelp(false);
    }
  };

  // Handle Report Outcome
  const handleSubmitOutcome = async () => {
    if (!selectedOutcome || !outcomeNotes.trim() || !currentAction) return;

    setOutcomeError(null);
    setIsSubmittingOutcome(true);

    try {
      const currentSessionId = sessionId || "session_default";
      const res = await api.complete({
        sessionId: currentSessionId,
        context,
        actionId: currentAction.id,
        outcome: selectedOutcome,
        notes: outcomeNotes.trim(),
      });

      const finishedMove: CompletedMove = {
        action: currentAction,
        outcome: selectedOutcome,
        notes: outcomeNotes.trim(),
        completedAt: new Date().toISOString(),
      };

      addCompletedMove(finishedMove);
      if (res.action) {
        setCurrentAction(res.action);
      }
      setLatestResponse(res);
      setOutcomeMessage(res.message || null);

      setSelectedOutcome(null);
      setOutcomeNotes("");
      setIsOutcomeDialogOpen(false);
      setHelpResponse(null);
      setCardRevision((prev) => prev + 1);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not submit outcome. Please try again.";
      setOutcomeError(message);
    } finally {
      setIsSubmittingOutcome(false);
    }
  };

  // SSR hydration guard
  if (!hasHydrated) {
    return (
      <div className="py-12 space-y-4">
        <div className="h-48 rounded-xl bg-slate border border-rule animate-pulse" />
      </div>
    );
  }

  // Empty state if no action in store
  if (!currentAction) {
    return (
      <div className="space-y-6 py-12 text-left">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-bone font-heading">
            No active move
          </h1>
          <p className="text-ash text-base leading-relaxed">
            You don&apos;t have an active next move right now. Start with your idea
            and we&apos;ll determine the highest-leverage first step.
          </p>
        </header>
        <div className="pt-2">
          <Link
            href="/start"
            className="px-5 py-2.5 bg-bone text-graphite rounded font-medium text-sm transition-opacity hover:opacity-90 inline-block select-none"
          >
            Start with your idea
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Learned Message from Outcome */}
      {outcomeMessage && (
        <section className="p-5 rounded-lg bg-slate border border-rule space-y-2">
          <h2 className="text-base font-bold text-bone font-heading">
            What we learned
          </h2>
          <p className="text-ash text-sm leading-relaxed">
            {outcomeMessage}
          </p>
        </section>
      )}

      {/* 1. Next Move Card: The only bone-colored block on the page */}
      <FadeContent
        trigger="mount"
        duration={0.4}
        key={`card-${currentAction.id}-${cardRevision}`}
      >
        <NextMoveCard action={currentAction} />
      </FadeContent>

      {/* 2. Execution Workspace Below Card */}
      <div className="space-y-10">
        {/* Steps Checklist */}
        {currentAction.steps && currentAction.steps.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-bone font-heading">
              Steps to execute
            </h2>
            <div className="p-5 rounded-lg bg-slate border border-rule divide-y divide-rule/60">
              {currentAction.steps.map((step) => {
                const isChecked = Boolean(checkedSteps[step.id]);
                return (
                  <div
                    key={step.id}
                    onClick={() => toggleStep(step.id)}
                    className="flex items-start gap-3.5 py-3 first:pt-0 last:pb-0 cursor-pointer select-none group"
                  >
                    <div
                      className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? "bg-bone border-bone text-graphite"
                          : "border-ash/50 bg-graphite group-hover:border-bone"
                      }`}
                    >
                      {isChecked && (
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm leading-relaxed transition-opacity ${
                        isChecked ? "line-through text-ash" : "text-bone"
                      }`}
                    >
                      {step.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Materials as Collapsible Sections */}
        {currentAction.materials && currentAction.materials.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-bone font-heading">
              Execution materials
            </h2>
            <div className="space-y-3">
              {currentAction.materials.map((mat) => (
                <MaterialItem key={mat.id} material={mat} />
              ))}
            </div>
          </section>
        )}

        {/* Ask Praxism for Help */}
        <section className="p-5 rounded-lg bg-slate border border-rule space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-bone font-heading">
              Ask Praxism for help
            </h2>
            <p className="text-ash text-xs">
              Get advice, clarify an obstacle, or request alternative steps for this move.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={handleHelpMeDoIt}
              disabled={isHelping || isAskingHelp}
              className="px-4 py-2 bg-bone text-graphite rounded font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed select-none"
            >
              Help me do it
            </button>
          </div>

          <form onSubmit={handleAskHelp} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask a question about this move..."
              value={helpInput}
              onChange={(e) => setHelpInput(e.target.value)}
              disabled={isAskingHelp || isHelping}
              className="flex-1 bg-graphite border border-rule rounded px-3.5 py-2 text-sm text-bone placeholder:text-ash focus:outline-none focus:border-ash transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!helpInput.trim() || isAskingHelp || isHelping}
              className="px-4 py-2 bg-bone text-graphite rounded font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 select-none"
            >
              Ask
            </button>
          </form>

          {isHelping && (
            <div className="p-4 rounded bg-graphite border border-rule flex items-center justify-center">
              <TextType
                text={[
                  "Drafting execution materials",
                  "Creating templates and guides",
                ]}
                typingSpeed={40}
                pauseDuration={1500}
                deletingSpeed={25}
                loop={true}
                showCursor={true}
                cursorCharacter="|"
                className="text-bone text-sm font-medium"
                cursorClassName="text-bone"
              />
            </div>
          )}

          {isAskingHelp && (
            <div className="p-4 rounded bg-graphite border border-rule flex items-center justify-center">
              <TextType
                text={[
                  "Thinking through your question",
                  "Finding the best guidance",
                ]}
                typingSpeed={40}
                pauseDuration={1500}
                deletingSpeed={25}
                loop={true}
                showCursor={true}
                cursorCharacter="|"
                className="text-bone text-sm font-medium"
                cursorClassName="text-bone"
              />
            </div>
          )}

          {helpResponse && !isAskingHelp && !isHelping && (
            <div className="p-4 rounded bg-graphite border border-rule space-y-1">
              <p className="text-bone text-sm leading-relaxed">{helpResponse}</p>
            </div>
          )}

          {helpError && !isAskingHelp && !isHelping && (
            <div className="p-4 rounded bg-graphite border border-rule space-y-2">
              <p className="text-bone text-sm">{helpError}</p>
              <button
                type="button"
                onClick={() => {
                  setHelpError(null);
                }}
                className="px-3 py-1 bg-bone text-graphite rounded text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Dismiss
              </button>
            </div>
          )}
        </section>

        {/* 3. Report Outcome Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsOutcomeDialogOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-bone text-graphite rounded font-medium text-sm transition-opacity hover:opacity-90 select-none text-center"
          >
            Report outcome
          </button>
        </div>
      </div>

      {/* Outcome Modal Dialog */}
      {isOutcomeDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
        >
          <div className="bg-slate border border-rule rounded-xl p-6 w-full max-w-lg space-y-6 text-left">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-bone font-heading">
                Report outcome
              </h2>
              <p className="text-ash text-sm leading-relaxed">
                Record what happened so your next move adapts to reality.
              </p>
            </div>

            {/* Three choices: Done, Partly done, I got stuck */}
            <div className="space-y-2">
              <label className="block text-bone text-sm font-medium">
                How did it go?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Done", value: "done" as const },
                  { label: "Partly done", value: "partial" as const },
                  { label: "I got stuck", value: "blocked" as const },
                ].map((choice) => {
                  const isSelected = selectedOutcome === choice.value;
                  return (
                    <button
                      key={choice.value}
                      type="button"
                      onClick={() => setSelectedOutcome(choice.value)}
                      className={`py-2 px-3 rounded text-sm transition-colors border text-center select-none ${
                        isSelected
                          ? "bg-bone text-graphite border-bone font-medium"
                          : "bg-graphite border-rule text-ash hover:text-bone hover:border-ash"
                      }`}
                    >
                      {choice.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* "What happened?" notes field */}
            <div className="space-y-2">
              <label className="block text-bone text-sm font-medium">
                What happened?
              </label>
              <textarea
                rows={4}
                placeholder="Describe what occurred, any customer feedback, or what blocked you..."
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                disabled={isSubmittingOutcome}
                className="w-full bg-graphite border border-rule rounded p-3 text-bone placeholder:text-ash text-sm focus:outline-none focus:border-ash transition-colors resize-none disabled:opacity-60"
              />
            </div>

            {outcomeError && !isSubmittingOutcome && (
              <div className="p-3 rounded bg-graphite border border-rule space-y-2">
                <p className="text-bone text-sm">{outcomeError}</p>
                <button
                  type="button"
                  onClick={handleSubmitOutcome}
                  className="px-3 py-1 bg-bone text-graphite rounded text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  Try again
                </button>
              </div>
            )}

            {isSubmittingOutcome ? (
              <div className="p-6 rounded bg-graphite border border-rule flex flex-col items-center justify-center space-y-3 text-center">
                <TextType
                  text={[
                    "Evaluating your outcome",
                    "Deciding your next move",
                  ]}
                  typingSpeed={40}
                  pauseDuration={1500}
                  deletingSpeed={25}
                  loop={true}
                  showCursor={true}
                  cursorCharacter="|"
                  className="text-bone text-sm font-medium"
                  cursorClassName="text-bone"
                />
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOutcomeDialogOpen(false);
                    setOutcomeError(null);
                  }}
                  className="px-4 py-2 border border-rule bg-graphite text-ash hover:text-bone rounded text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitOutcome}
                  disabled={!selectedOutcome || !outcomeNotes.trim()}
                  className="px-5 py-2 bg-bone text-graphite rounded font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed select-none"
                >
                  Submit outcome
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. GradualBlur along the bottom edge of the viewport for scrolling workspace */}
      <GradualBlur
        position="bottom"
        target="page"
        height="5rem"
        strength={2}
        zIndex={40}
      />
    </div>
  );
}
