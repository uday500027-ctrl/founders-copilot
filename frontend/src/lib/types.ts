// Praxism data contract. Frontend and backend must both follow this file exactly.

export type Stage =
  | "idea" | "validation" | "planning" | "building" | "launching" | "growing";

export type SessionStatus = "needs_clarification" | "action_ready" | "error";

export interface ClarificationQuestion {
  id: string;
  question: string;
  options?: string[]; // if present, show as choices; otherwise free text
}

export interface ExecutionStep {
  id: string;
  text: string;
}

export interface Material {
  id: string;
  kind:
  | "interview_questions" | "outreach_message" | "checklist"
  | "template" | "research_summary" | "feedback_analysis";
  title: string;
  content: string; // markdown
}

export interface NextAction {
  id: string;
  title: string;            // e.g. "Talk to five potential customers"
  reasoning: string;        // why this matters now
  steps: ExecutionStep[];
  estimatedTime?: string;   // e.g. "2–3 hours"
  estimatedCost?: string;   // e.g. "₹0"
  successCriteria: string[];
  materials: Material[];
}

export interface AgentResponse {
  sessionId: string;
  status: SessionStatus;
  stage: Stage;
  blocker: string;                     // the main uncertainty right now
  questions?: ClarificationQuestion[]; // when status = "needs_clarification"
  action?: NextAction;                 // when status = "action_ready"
  message?: string;                    // short reply, e.g. to a help request
}

export interface Answer {
  questionId: string;
  question: string;
  answer: string;
}

export type Outcome = "done" | "partial" | "blocked";

export interface CompletedMove {
  action: NextAction;
  outcome: Outcome;
  notes: string;       // what happened, in the user's words
  completedAt: string; // ISO date
}

// Sent with every request so the backend can stay stateless on Vercel.
export interface SessionContext {
  idea: string;
  answers: Answer[];
  history: CompletedMove[];
  currentAction?: NextAction;
}

export interface StartRequest { idea: string; }
export interface NextRequest { sessionId: string; context: SessionContext; answers?: Answer[]; message?: string; }
export interface CompleteRequest { sessionId: string; context: SessionContext; actionId: string; outcome: Outcome; notes: string; }
export interface HealthResponse { ok: boolean; model?: string; }
export interface ApiError { error: string; }