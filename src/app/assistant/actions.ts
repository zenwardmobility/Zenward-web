"use server";

import { getContactIntakeAdapter } from "../../lib/contact-intake/adapter.ts";
import { checkSubmissionGuard } from "../../lib/forms/guard.ts";
import { validatePhone } from "../../lib/assistant/zenny.ts";

/**
 * Zenny follow-up number (ZW-WEB-04H2). The ONLY data the Transportation
 * Assistant ever sends to a server: a phone number the visitor chose to give,
 * delivered to Zenward's monitored contact inbox through the existing trusted
 * contact-intake path (server-only credentials). Not Nemryn, not a
 * transportation request, not analytics.
 *
 * Accepts exactly `{ phone }`; anything else (chat text, service, URL, trip
 * details) is rejected, not trimmed. The number is re-validated here and never
 * logged. `delivered: true` only on genuine delivery; otherwise the assistant
 * shows an honest "couldn't save your number" note and stays usable.
 */
export async function submitAssistantCallback(
  input: unknown,
  guard?: { startedAt?: number },
): Promise<{ delivered: boolean }> {
  try {
    if (!checkSubmissionGuard(guard).ok) return { delivered: false };
    if (!input || typeof input !== "object" || Array.isArray(input)) return { delivered: false };
    const keys = Object.keys(input);
    if (keys.length !== 1 || keys[0] !== "phone") return { delivered: false };
    const phone = validatePhone(String((input as { phone: unknown }).phone ?? "").slice(0, 32));
    if (!phone.ok) return { delivered: false };
    return await getContactIntakeAdapter().submitCallback({ phone: phone.value });
  } catch {
    console.error("[assistant-callback] delivery failed.");
    return { delivered: false };
  }
}
