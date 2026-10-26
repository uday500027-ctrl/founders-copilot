/**
 * Plain TypeScript types for the Praxism API (no dependencies).
 * A frontend in a SEPARATE repo can copy just this file + praxism-client.ts.
 */

export type Outcome = "done" | "partial" | "blocked" | "skipped";

export interface Step {
  title: string;
  detail: string;
}

export interface Action {
  title: string;
  summary: string;
  reasoning: string;
  steps: Step[];
  estimatedTime: string;
  estimatedCost: string;
  successCriteria: string[];
}

/** The "Your next move" payload. */
export interface ActiveAction {
  stage: string;
  blocker: string;
  /** Present after the user has reported an outcome: what that result tells us. */
  learning?: string | null;
  action: Action;
}

export interface Question {
  id: string;
  question: string;
  why?: string | null;
}

export interface MaterialItem {
  /** e.g. interview_questions, outreach_message, checklist, template, research_summary, feedback_analysis */
  kind: string;
  title: string;
  content: string;
}

export interface Materials {
  title: string;
  note?: string | null;
  materials: MaterialItem[];
}

export interface HistoryItem {
  actionTitle: string;
  outcome: Outcome;
  result: string;
  completedAt: string;
}

/**
 * The full conversation state. Treat it as an opaque blob: store the latest
 * one you receive and send it back unchanged on the next call.
 */
export interface Session {
  id: string;
  idea: string;
  context: { question: string; answer: string }[];
  pendingQuestions: Question[];
  clarificationRounds: number;
  currentAction: ActiveAction | null;
  history: HistoryItem[];
  turn: number;
  createdAt: string;
  updatedAt: string;
}

export type SessionStatus = "awaiting_clarification" | "awaiting_task_completion";

export type AgentResponse =
  | { ok: true; type: "clarification"; status: "awaiting_clarification"; sessionId: string; session: Session; data: { questions: Question[] } }
  | { ok: true; type: "action"; status: "awaiting_task_completion"; sessionId: string; session: Session; data: ActiveAction }
  | { ok: true; type: "materials"; status: "awaiting_task_completion"; sessionId: string; session: Session; data: Materials };

export interface ApiErrorBody {
  ok: false;
  error: { code: string; message: string; details?: unknown };
}

export interface HealthResponse {
  ok: boolean;
  service: string;
  time: string;
  config: { hasApiKey: boolean; model: string; ollamaBaseUrl: string };
  problem?: string;
  ollama?: { reachable: boolean; latencyMs?: number; error?: string };
}

export interface StartInput {
  idea: string;
  details?: string;
}

export interface NextInput {
  intent?: "answer" | "generate_materials" | "refine";
  answers?: { questionId: string; answer: string }[];
  message?: string;
}

export interface CompleteInput {
  outcome: Outcome;
  result?: string;
}
