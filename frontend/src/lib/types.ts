export type Stage = "idea" | "mvp" | "early_revenue" | "scaling";

export interface FounderProfile {
  name: string;
  startupName: string;
  oneLiner: string;
  stage: Stage;
  industry: string;
  teamSize: number;
  hoursPerWeek: number;
  goal90Days: string;
  constraints: string[];
}

export type TaskStatus = "todo" | "doing" | "done" | "blocked";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  createdAt: string; // ISO date
}

export interface Resource {
  label: string;
  url?: string;
  type: "tool" | "template" | "article" | "video" | "community";
}

export interface Contact {
  role: string;        // e.g. "CA for GST registration", "Incubator mentor"
  why: string;
  howToReach?: string; // e.g. "Your incubator's office hours"
}

export interface NextAction {
  taskId: string;
  title: string;                                                       // WHAT
  whyNow: string;                                                      // WHY (builds trust)
  when: { slot: string; estimatedMinutes: number; deadline?: string }; // WHEN
  where: string;                                                       // WHERE
  steps: string[];                                                     // HOW
  resources: Resource[];                                               // WHAT TO USE
  contacts: Contact[];                                                 // WHOM TO ASK
}

export interface QueueItem { taskId: string; title: string; priority: 1 | 2 | 3 | 4 | 5; reason: string; }

export interface PlanRequest { profile: FounderProfile; tasks: Task[]; skippedTaskIds?: string[]; }
export interface PlanResponse { nextAction: NextAction; queue: QueueItem[]; }

export interface BlockerRequest { profile: FounderProfile; taskId: string; description: string; }
export interface BlockerResponse { suggestions: string[]; contacts: Contact[]; alternativeAction?: NextAction; }

export interface ChatMessage { role: "user" | "assistant"; content: string; }
export interface ChatRequest { profile: FounderProfile; currentAction?: NextAction; messages: ChatMessage[]; }

export interface HistoryEntry {
  id: string;
  taskId: string;
  title: string;
  outcome: "done" | "skipped";
  completedAt: string;  // ISO date
  action: NextAction;   // snapshot of the advice they followed
  note?: string;
}