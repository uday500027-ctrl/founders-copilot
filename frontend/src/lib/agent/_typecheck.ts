/**
 * Compile-time guard: the hand-written client types must stay compatible with
 * the zod schemas. If you change a schema and `npm run typecheck` fails here,
 * update lib/client/types.ts to match.
 */
import type { AgentResponse as ClientResponse, Session as ClientSession } from "../client/types";
import type { AgentResult, Session } from "./schemas";

export const sessionToClient = (s: Session): ClientSession => s;
export const sessionFromClient = (s: ClientSession): Session => s;
export const resultToClient = (r: AgentResult): ClientResponse => ({ ok: true, ...r });
