import type { ApiClient } from "./client";
import type {
  PlanRequest,
  PlanResponse,
  BlockerRequest,
  BlockerResponse,
  ChatRequest,
  HistoryEntry,
} from "../types";

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
};

export const http: ApiClient = {
  async getPlan(req: PlanRequest): Promise<PlanResponse> {
    const res = await fetch(`${getBaseUrl()}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Failed to get plan (HTTP ${res.status})`);
    }

    return res.json();
  },

  async reportBlocker(req: BlockerRequest): Promise<BlockerResponse> {
    const res = await fetch(`${getBaseUrl()}/blocker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Failed to report blocker (HTTP ${res.status})`);
    }

    return res.json();
  },

  async *streamChat(req: ChatRequest): AsyncIterable<string> {
    const res = await fetch(`${getBaseUrl()}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Chat streaming failed (HTTP ${res.status})`);
    }

    if (!res.body) {
      throw new Error("Chat response body is not readable.");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          yield decoder.decode(value, { stream: true });
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  async getHistory(): Promise<HistoryEntry[]> {
    const res = await fetch(`${getBaseUrl()}/history`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Failed to fetch history (HTTP ${res.status})`);
    }

    return res.json();
  },

  async addHistory(entry: HistoryEntry): Promise<void> {
    const res = await fetch(`${getBaseUrl()}/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Failed to add history (HTTP ${res.status})`);
    }
  },
};
