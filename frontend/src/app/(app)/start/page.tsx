"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { usePraxism } from "@/store/usePraxism";
import type {
  ClarificationQuestion,
  Answer,
  SessionContext,
} from "@/lib/types";
import TextType from "@/components/TextType";
import FadeContent from "@/components/FadeContent";

type Phase = "idea" | "questions";

export default function StartPage() {
  const router = useRouter();
  const {
    context: storedContext,
    setSessionId,
    setContext,
    setLatestResponse,
    setCurrentAction,
    setIdea: setStoreIdea,
  } = usePraxism();

  const [phase, setPhase] = useState<Phase>("idea");
  const [idea, setIdea] = useState(storedContext?.idea || "");
  const [questions, setQuestions] = useState<ClarificationQuestion[]>([]);

  // Selected chip per question id: { [questionId]: optionString }
  const [selectedChips, setSelectedChips] = useState<Record<string, string>>({});
  // Other text input per question id: { [questionId]: string }
  const [otherInputs, setOtherInputs] = useState<Record<string, string>>({});
  // Free text input per question id without options: { [questionId]: string }
  const [freeTextInputs, setFreeTextInputs] = useState<Record<string, string>>({});

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryFn, setRetryFn] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    document.title = "Start with your idea — Praxism";
  }, []);

  // Phase 1: Submit idea
  const handleStart = async (ideaText?: string) => {
    const textToSubmit = (ideaText ?? idea).trim();
    if (!textToSubmit) return;

    setError(null);
    setIsLoading(true);
    setRetryFn(() => () => handleStart(textToSubmit));

    try {
      const res = await api.start({ idea: textToSubmit });

      setStoreIdea(textToSubmit);
      setSessionId(res.sessionId);
      setLatestResponse(res);

      if (
        res.status === "needs_clarification" &&
        res.questions &&
        res.questions.length > 0
      ) {
        setQuestions(res.questions);
        setSelectedChips({});
        setOtherInputs({});
        setFreeTextInputs({});
        setPhase("questions");
      } else if (res.status === "action_ready") {
        if (res.action) {
          setCurrentAction(res.action);
        }
        router.push("/move");
      } else if (res.status === "error") {
        throw new Error(
          res.message || res.blocker || "Unable to determine next move."
        );
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something failed while processing your idea. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Phase 2: Option selection
  const handleSelectChip = (questionId: string, option: string) => {
    setSelectedChips((prev) => ({
      ...prev,
      [questionId]: prev[questionId] === option ? "" : option,
    }));
    setOtherInputs((prev) => ({
      ...prev,
      [questionId]: "",
    }));
  };

  const handleOtherInputChange = (questionId: string, value: string) => {
    setOtherInputs((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    if (value.trim()) {
      setSelectedChips((prev) => ({
        ...prev,
        [questionId]: "",
      }));
    }
  };

  const handleFreeTextInputChange = (questionId: string, value: string) => {
    setFreeTextInputs((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Phase 2: Submit clarification answers
  const handleContinue = async () => {
    setError(null);
    setIsLoading(true);
    setRetryFn(() => () => handleContinue());

    try {
      const currentSessionId =
        usePraxism.getState().sessionId || "session_default";
      const currentStoreContext = usePraxism.getState().context;

      const currentAnswers: Answer[] = questions.map((q) => {
        const hasOptions = Array.isArray(q.options) && q.options.length > 0;
        let ans = "";
        if (hasOptions) {
          ans = otherInputs[q.id]?.trim() || selectedChips[q.id] || "";
        } else {
          ans = freeTextInputs[q.id]?.trim() || "";
        }
        return {
          questionId: q.id,
          question: q.question,
          answer: ans,
        };
      });

      const existingAnswers = currentStoreContext.answers.filter(
        (prev) =>
          !currentAnswers.some((curr) => curr.questionId === prev.questionId)
      );
      const combinedAnswers = [...existingAnswers, ...currentAnswers];

      const fullContext: SessionContext = {
        ...currentStoreContext,
        idea: idea || currentStoreContext.idea,
        answers: combinedAnswers,
      };

      setContext(fullContext);

      const res = await api.next({
        sessionId: currentSessionId,
        context: fullContext,
        answers: currentAnswers,
      });

      setSessionId(res.sessionId);
      setLatestResponse(res);

      if (
        res.status === "needs_clarification" &&
        res.questions &&
        res.questions.length > 0
      ) {
        setQuestions(res.questions);
        setSelectedChips({});
        setOtherInputs({});
        setFreeTextInputs({});
      } else if (res.status === "action_ready") {
        if (res.action) {
          setCurrentAction(res.action);
        }
        router.push("/move");
      } else if (res.status === "error") {
        throw new Error(
          res.message || res.blocker || "Unable to determine next move."
        );
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something failed while communicating with the agent. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isContinueDisabled =
    isLoading ||
    questions.length === 0 ||
    !questions.some((q) => {
      const hasOptions = Array.isArray(q.options) && q.options.length > 0;
      if (hasOptions) {
        return Boolean(selectedChips[q.id] || otherInputs[q.id]?.trim());
      }
      return Boolean(freeTextInputs[q.id]?.trim());
    });

  return (
    <div className="space-y-8">
      {phase === "idea" ? (
        <FadeContent trigger="mount" duration={0.4} key="phase-idea">
          <div className="space-y-6">
            <header className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-bone font-heading">
                What do you want to make happen?
              </h1>
            </header>

            <div className="space-y-4">
              <textarea
                rows={5}
                placeholder="I want to start a clothing brand, but I don't know where to begin."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                disabled={isLoading}
                className="w-full bg-slate border border-rule rounded-lg p-4 text-bone placeholder:text-ash text-base leading-relaxed resize-none focus:outline-none focus:border-ash transition-colors min-h-[160px] disabled:opacity-60"
              />

              {isLoading ? (
                <div className="p-8 rounded-lg bg-slate border border-rule flex flex-col items-center justify-center space-y-4 text-center min-h-[160px]">
                  <TextType
                    text={[
                      "Reading your idea",
                      "Working out what matters first",
                      "Choosing one move",
                    ]}
                    typingSpeed={40}
                    pauseDuration={1500}
                    deletingSpeed={25}
                    loop={true}
                    showCursor={true}
                    cursorCharacter="|"
                    className="text-bone text-base sm:text-lg font-medium"
                    cursorClassName="text-bone"
                  />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleStart()}
                    disabled={!idea.trim() || isLoading}
                    className="px-5 py-2.5 bg-bone text-graphite rounded font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed select-none"
                  >
                    Find my next move
                  </button>
                </div>
              )}

              {error && !isLoading && (
                <div className="p-4 rounded-lg bg-slate border border-rule space-y-3">
                  <p className="text-bone text-sm">{error}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      retryFn?.();
                    }}
                    className="px-4 py-2 bg-bone text-graphite rounded text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          </div>
        </FadeContent>
      ) : (
        <FadeContent trigger="mount" duration={0.4} key="phase-questions">
          <div className="space-y-8">
            <header className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-bone font-heading">
                Clarifying your idea
              </h1>
              <p className="text-ash text-base leading-relaxed">
                Answer a few quick questions to help determine the highest-leverage first step.
              </p>
            </header>

            <div className="space-y-6">
              {questions.map((q) => {
                const hasOptions =
                  Array.isArray(q.options) && q.options.length > 0;
                return (
                  <div
                    key={q.id}
                    className="space-y-3 p-5 rounded-lg bg-slate border border-rule"
                  >
                    <label className="block text-bone font-medium text-base leading-snug">
                      {q.question}
                    </label>

                    {hasOptions ? (
                      <div className="space-y-3 pt-1">
                        <div className="flex flex-wrap gap-2">
                          {q.options!.map((option) => {
                            const isSelected = selectedChips[q.id] === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => handleSelectChip(q.id, option)}
                                disabled={isLoading}
                                className={`px-3.5 py-1.5 rounded-full border text-sm transition-colors cursor-pointer select-none ${
                                  isSelected
                                    ? "bg-bone text-graphite border-bone font-medium"
                                    : "bg-graphite border-rule text-ash hover:text-bone hover:border-ash"
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>

                        <div className="pt-1">
                          <input
                            type="text"
                            placeholder="Other (specify)..."
                            value={otherInputs[q.id] || ""}
                            onChange={(e) =>
                              handleOtherInputChange(q.id, e.target.value)
                            }
                            disabled={isLoading}
                            className="w-full bg-graphite border border-rule rounded px-3 py-2 text-bone placeholder:text-ash text-sm focus:outline-none focus:border-ash transition-colors"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1">
                        <textarea
                          rows={3}
                          placeholder="Type your answer here..."
                          value={freeTextInputs[q.id] || ""}
                          onChange={(e) =>
                            handleFreeTextInputChange(q.id, e.target.value)
                          }
                          disabled={isLoading}
                          className="w-full bg-graphite border border-rule rounded p-3 text-bone placeholder:text-ash text-sm focus:outline-none focus:border-ash transition-colors resize-none leading-relaxed"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading ? (
                <div className="p-8 rounded-lg bg-slate border border-rule flex flex-col items-center justify-center space-y-4 text-center min-h-[160px]">
                  <TextType
                    text={[
                      "Reading your idea",
                      "Working out what matters first",
                      "Choosing one move",
                    ]}
                    typingSpeed={40}
                    pauseDuration={1500}
                    deletingSpeed={25}
                    loop={true}
                    showCursor={true}
                    cursorCharacter="|"
                    className="text-bone text-base sm:text-lg font-medium"
                    cursorClassName="text-bone"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={isContinueDisabled}
                    className="px-5 py-2.5 bg-bone text-graphite rounded font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed select-none"
                  >
                    Continue
                  </button>
                </div>
              )}

              {error && !isLoading && (
                <div className="p-4 rounded-lg bg-slate border border-rule space-y-3">
                  <p className="text-bone text-sm">{error}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      retryFn?.();
                    }}
                    className="px-4 py-2 bg-bone text-graphite rounded text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          </div>
        </FadeContent>
      )}
    </div>
  );
}
