"use server";

import { getContactIntakeAdapter } from "@/lib/contact-intake/adapter";
import type { ContactMessageInput, ContactMessageResult, ContactTopic } from "@/lib/contact-intake/types";
import {
  checkSubmissionGuard,
  cleanString,
  FIELD_LIMITS,
  isAllowed,
  isPayloadWithinLimit,
  looksLikeEmail,
  type SubmissionGuard,
} from "@/lib/forms/guard";

const TOPICS: readonly ContactTopic[] = ["general", "provider", "support"];

const GENERIC_ERROR = "We couldn't send your message. Please check the form and try again, or call us.";

/**
 * The only entry point the browser calls for the contact form. Runs
 * server-side. Rebuilds the payload from a fixed whitelist, normalises and
 * length-caps every field, validates the topic against its allowed values,
 * then hands off to the configured contact adapter. Message content is never
 * logged and never sent to analytics.
 */
export async function submitContactMessage(
  input: unknown,
  guard?: SubmissionGuard,
): Promise<ContactMessageResult> {
  const gate = checkSubmissionGuard(guard);
  if (!gate.ok) return { ok: false, error: gate.reason };

  if (!input || typeof input !== "object" || !isPayloadWithinLimit(input)) {
    return { ok: false, error: GENERIC_ERROR };
  }

  const src = input as Record<string, unknown>;

  const clean: ContactMessageInput = {
    name: cleanString(src.name, FIELD_LIMITS.name) ?? "",
    email: cleanString(src.email, FIELD_LIMITS.email) ?? "",
    phone: cleanString(src.phone, FIELD_LIMITS.phone),
    organization: cleanString(src.organization, FIELD_LIMITS.organization),
    topic: (isAllowed(src.topic, TOPICS) ? src.topic : "general") as ContactTopic,
    message: cleanString(src.message, FIELD_LIMITS.longText) ?? "",
  };

  if (!clean.name || !looksLikeEmail(clean.email) || !clean.message) {
    return { ok: false, error: "Please fill in your name, a valid email, and a message." };
  }

  try {
    return await getContactIntakeAdapter().submit(clean);
  } catch (err) {
    console.error("[contact-intake] submit failed.", err instanceof Error ? err.name : "unknown");
    return { ok: false, error: GENERIC_ERROR };
  }
}
