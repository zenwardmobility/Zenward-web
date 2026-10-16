/**
 * Provider boundary for the Transportation Assistant (ZW-WEB-04H).
 *
 * V1 runs ONLY the deterministic provider below: it works with no API key,
 * no network and no model, entirely in the browser.
 *
 * FUTURE (not activated; needs owner + legal decisions and credentials that
 * don't exist): a natural-language provider would
 *   - run SERVER-SIDE only (a Server Action or route handler), never with a
 *     key in the browser;
 *   - receive only the visitor's current message and the canonical
 *     knowledge (src/lib/assistant/knowledge.ts), never request or passenger
 *     records, and never Nemryn;
 *   - return an `AssistantReply` that MUST pass `validateReply` (canonical
 *     links only, `?service=` only, approved claims only), falling back to
 *     the deterministic reply when it doesn't;
 *   - keep emergency handling deterministic (checked before any provider);
 *   - not store or log transcripts.
 * Business logic stays here and in responses.ts, not in a vendor SDK, so
 * providers remain replaceable.
 */
import { respond } from "./responses.ts";
import { validateReply } from "./safety.ts";
import type { AssistantContext, AssistantInput, AssistantReply } from "./types.ts";

export interface AssistantProvider {
  readonly id: string;
  respond(input: AssistantInput, ctx: AssistantContext): AssistantReply | Promise<AssistantReply>;
}

export const deterministicProvider: AssistantProvider = {
  id: "deterministic",
  respond,
};

/**
 * Runs a provider and guarantees a safe reply: any reply that fails
 * validation (or throws) is replaced by the deterministic one.
 */
export async function safeRespond(
  provider: AssistantProvider,
  input: AssistantInput,
  ctx: AssistantContext,
): Promise<AssistantReply> {
  const fallback = respond(input, ctx);
  if (provider === deterministicProvider || fallback.kind === "emergency") return fallback;
  try {
    const candidate = await provider.respond(input, ctx);
    return validateReply(candidate).length === 0 ? candidate : fallback;
  } catch {
    return fallback;
  }
}
