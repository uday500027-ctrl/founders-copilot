import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";
import type {
  AgentResponse,
  Answer,
  CompletedMove,
  NextAction,
  SessionContext,
} from "@/lib/types";

export interface PraxismState {
  sessionId: string | null;
  context: SessionContext;
  latestResponse: AgentResponse | null;
  _hasHydrated: boolean;

  setSessionId: (id: string | null) => void;
  setContext: (
    context: SessionContext | ((prev: SessionContext) => SessionContext)
  ) => void;
  setLatestResponse: (res: AgentResponse | null) => void;
  setIdea: (idea: string) => void;
  addAnswer: (answer: Answer) => void;
  setCurrentAction: (action?: NextAction) => void;
  addCompletedMove: (move: CompletedMove) => void;
  setHasHydrated: (hydrated: boolean) => void;
  startOver: () => void;
}

export const initialSessionContext: SessionContext = {
  idea: "",
  answers: [],
  history: [],
  currentAction: undefined,
};

export const usePraxism = create<PraxismState>()(
  persist(
    (set) => ({
      sessionId: null,
      context: initialSessionContext,
      latestResponse: null,
      _hasHydrated: false,

      setSessionId: (sessionId) => set({ sessionId }),
      setContext: (context) =>
        set((state) => ({
          context:
            typeof context === "function" ? context(state.context) : context,
        })),
      setLatestResponse: (latestResponse) => set({ latestResponse }),
      setIdea: (idea) =>
        set((state) => ({
          context: { ...state.context, idea },
        })),
      addAnswer: (answer) =>
        set((state) => {
          const filtered = state.context.answers.filter(
            (a) => a.questionId !== answer.questionId
          );
          return {
            context: {
              ...state.context,
              answers: [...filtered, answer],
            },
          };
        }),
      setCurrentAction: (currentAction) =>
        set((state) => ({
          context: { ...state.context, currentAction },
        })),
      addCompletedMove: (move) =>
        set((state) => ({
          context: {
            ...state.context,
            history: [...state.context.history, move],
            currentAction: undefined,
          },
        })),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
      startOver: () => {
        set({
          sessionId: null,
          context: initialSessionContext,
          latestResponse: null,
        });
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem("praxism_storage");
          } catch {
            // ignore
          }
        }
      },
    }),
    {
      name: "praxism_storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        sessionId: state.sessionId,
        context: state.context,
        latestResponse: state.latestResponse,
      }),
    }
  )
);

/**
 * Hydration-safe selector hook for Next.js App Router components.
 * Prevents SSR hydration mismatch warnings by returning fallback until mounted.
 */
export function usePraxismStore<T>(
  selector: (state: PraxismState) => T,
  fallback?: T
): T | undefined {
  const result = usePraxism(selector);
  const [data, setData] = useState<T | undefined>(fallback);

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
}

export function useIsHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
