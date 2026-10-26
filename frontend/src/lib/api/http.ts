import type { ApiClient } from "./client";
import type {
  StartRequest,
  NextRequest,
  CompleteRequest,
  HealthResponse,
  AgentResponse,
} from "../types";

const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || "/api";
};

async function fetchWithTimeout<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getApiUrl()}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const data = await res
        .json()
        .catch(() => ({ error: `Request failed with status ${res.status}` }));
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return (await res.json()) as T;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out after 60 seconds.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const http: ApiClient = {
  async health(): Promise<HealthResponse> {
    return fetchWithTimeout<HealthResponse>("/health", {
      method: "GET",
    });
  },

  async start(req: StartRequest): Promise<AgentResponse> {
    return fetchWithTimeout<AgentResponse>("/agent/start", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  async next(req: NextRequest): Promise<AgentResponse> {
    return fetchWithTimeout<AgentResponse>("/agent/next", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  async complete(req: CompleteRequest): Promise<AgentResponse> {
    return fetchWithTimeout<AgentResponse>("/agent/complete", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },
};
