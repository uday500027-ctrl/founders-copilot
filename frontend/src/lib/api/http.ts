import type { ApiClient } from "./client";
import type {
  StartRequest,
  NextRequest,
  CompleteRequest,
  HealthResponse,
  AgentResponse,
  Stage,
  Material,
} from "../types";
import type {
  Session as BackendSession,
  AgentResponse as BackendAgentResponse,
  HealthResponse as BackendHealthResponse,
  ApiErrorBody as BackendApiErrorBody,
} from "@/lib/client/types";

const SESSION_STORAGE_KEY = "praxism.backendSession";
const TIMEOUT_MS = 65000;

const getApiUrl = (): string => {
  return (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/$/, "");
};

function getStoredSession(): BackendSession | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BackendSession;
  } catch {
    return null;
  }
}

function saveSession(session: BackendSession): void {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }
}

function mapStage(rawStage?: string): Stage {
  if (!rawStage) return "idea";
  const lower = rawStage.toLowerCase();
  if (lower.includes("valid")) return "validation";
  if (lower.includes("plan")) return "planning";
  if (lower.includes("build")) return "building";
  if (lower.includes("launch")) return "launching";
  if (lower.includes("grow")) return "growing";
  return "idea";
}

const VALID_MATERIAL_KINDS = new Set<Material["kind"]>([
  "interview_questions",
  "outreach_message",
  "checklist",
  "template",
  "research_summary",
  "feedback_analysis",
]);

function mapMaterialKind(rawKind: string): Material["kind"] {
  if (VALID_MATERIAL_KINDS.has(rawKind as Material["kind"])) {
    return rawKind as Material["kind"];
  }
  return "template";
}

function transformBackendResponse(backendRes: BackendAgentResponse): AgentResponse {
  const { sessionId, session, type } = backendRes;
  const historyLen = session.history ? session.history.length : 0;
  const actionId = `${session.id}-${historyLen}`;

  if (type === "clarification") {
    return {
      sessionId,
      status: "needs_clarification",
      stage: "idea",
      blocker: "",
      questions: backendRes.data.questions.map((q) => ({
        id: q.id,
        question: q.question,
      })),
    };
  }

  if (type === "action") {
    const data = backendRes.data;
    const stage = mapStage(data.stage);
    const learning = data.learning?.trim();
    const message = learning ? `What we learned: ${learning}` : undefined;

    return {
      sessionId,
      status: "action_ready",
      stage,
      blocker: data.blocker || "",
      ...(message ? { message } : {}),
      action: {
        id: actionId,
        title: data.action.title,
        reasoning: `${data.action.summary}\n\n${data.action.reasoning}`,
        steps: (data.action.steps || []).map((s, i) => ({
          id: `${actionId}-s${i}`,
          text: `${s.title}: ${s.detail}`,
        })),
        estimatedTime: data.action.estimatedTime,
        estimatedCost: data.action.estimatedCost,
        successCriteria: data.action.successCriteria || [],
        materials: [],
      },
    };
  }

  if (type === "materials") {
    const data = backendRes.data;
    const cur = session.currentAction;
    const stage = cur ? mapStage(cur.stage) : "idea";
    const blocker = cur ? cur.blocker || "" : "";
    const message = data.note || data.title;

    const materials: Material[] = (data.materials || []).map((m, i) => ({
      id: `${actionId}-m${i}`,
      kind: mapMaterialKind(m.kind),
      title: m.title,
      content: m.content,
    }));

    const action = cur
      ? {
          id: actionId,
          title: cur.action.title,
          reasoning: `${cur.action.summary}\n\n${cur.action.reasoning}`,
          steps: (cur.action.steps || []).map((s, i) => ({
            id: `${actionId}-s${i}`,
            text: `${s.title}: ${s.detail}`,
          })),
          estimatedTime: cur.action.estimatedTime,
          estimatedCost: cur.action.estimatedCost,
          successCriteria: cur.action.successCriteria || [],
          materials,
        }
      : {
          id: actionId,
          title: data.title,
          reasoning: "",
          steps: [],
          estimatedTime: "",
          estimatedCost: "",
          successCriteria: [],
          materials,
        };

    return {
      sessionId,
      status: "action_ready",
      stage,
      blocker,
      ...(message ? { message } : {}),
      action,
    };
  }

  throw new Error(`Unknown response type: ${(backendRes as { type: string }).type}`);
}

async function sendAgentRequest(
  endpoint: string,
  body: Record<string, unknown>
): Promise<AgentResponse> {
  const url = `${getApiUrl()}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let message = `Request failed with status ${res.status}`;
      try {
        const errorBody = (await res.json()) as BackendApiErrorBody;
        if (errorBody?.error?.message) {
          message = errorBody.error.message;
        }
      } catch {
        // ignore JSON parse error
      }
      throw new Error(message);
    }

    const data = (await res.json()) as BackendAgentResponse | BackendApiErrorBody;
    if (!data.ok) {
      throw new Error(data.error?.message || "An unexpected error occurred.");
    }

    saveSession(data.session);
    return transformBackendResponse(data);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out after 65 seconds.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const http: ApiClient = {
  async health(): Promise<HealthResponse> {
    const url = `${getApiUrl()}/health`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      const data = (await res.json().catch(() => null)) as BackendHealthResponse | null;

      return {
        ok: Boolean(data?.ok),
        model: data?.config?.model,
      };
    } catch {
      return { ok: false };
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async start(req: StartRequest): Promise<AgentResponse> {
    return sendAgentRequest("/agent/start", { idea: req.idea });
  },

  async next(req: NextRequest): Promise<AgentResponse> {
    const session = getStoredSession();
    if (!session) {
      throw new Error("Your session expired. Start again from your idea.");
    }

    const validAnswers = (req.answers || [])
      .filter((a) => a.answer && a.answer.trim().length > 0)
      .map((a) => ({
        questionId: a.questionId,
        answer: a.answer.trim(),
      }));

    let body: Record<string, unknown>;
    if (validAnswers.length > 0) {
      body = {
        session,
        answers: validAnswers,
      };
    } else {
      const trimmedMessage = req.message?.trim();
      body = {
        session,
        intent: "generate_materials",
        ...(trimmedMessage ? { message: trimmedMessage } : {}),
      };
    }

    return sendAgentRequest("/agent/next", body);
  },

  async complete(req: CompleteRequest): Promise<AgentResponse> {
    const session = getStoredSession();
    if (!session) {
      throw new Error("Your session expired. Start again from your idea.");
    }

    const trimmedNotes = req.notes?.trim();
    const result = trimmedNotes || "No details given.";

    return sendAgentRequest("/agent/complete", {
      session,
      outcome: req.outcome,
      result,
    });
  },
};
