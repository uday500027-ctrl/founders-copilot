import { mock } from "./mock";
import { http } from "./http";
import type { ApiClient } from "./client";

export const api: ApiClient =
  process.env.NEXT_PUBLIC_USE_MOCK === "true" ? mock : http;

export * from "./client";
export { mock, http };
