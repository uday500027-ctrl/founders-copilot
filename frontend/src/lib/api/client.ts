import type {
  StartRequest,
  NextRequest,
  CompleteRequest,
  HealthResponse,
  AgentResponse,
} from "../types";

export interface ApiClient {
  health(): Promise<HealthResponse>;
  start(req: StartRequest): Promise<AgentResponse>;
  next(req: NextRequest): Promise<AgentResponse>;
  complete(req: CompleteRequest): Promise<AgentResponse>;
}
