import type {
  PlanRequest,
  PlanResponse,
  BlockerRequest,
  BlockerResponse,
  ChatRequest,
  HistoryEntry,
} from "../types";

export interface ApiClient {
  getPlan(req: PlanRequest): Promise<PlanResponse>;
  reportBlocker(req: BlockerRequest): Promise<BlockerResponse>;
  streamChat(req: ChatRequest): AsyncIterable<string>;
  getHistory(): Promise<HistoryEntry[]>;
  addHistory(entry: HistoryEntry): Promise<void>;
}
