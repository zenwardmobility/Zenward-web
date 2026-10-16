export type ContactTopic = "general" | "provider" | "support";

export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  topic: ContactTopic;
  message: string;
}

/**
 * A follow-up number volunteered in the Zenny Transportation Assistant
 * (ZW-WEB-04H2). Deliberately ONLY the phone number: no name, chat
 * transcript, questions, service, page URL, trip details or analytics.
 */
export interface AssistantCallbackInput {
  /** 10-digit US number, digits only (validated server-side). */
  phone: string;
}

export interface AssistantCallbackResult {
  /** True only when the number genuinely reached the Zenward inbox (provider 2xx). */
  delivered: boolean;
}

export interface ContactMessageResult {
  ok: boolean;
  referenceId?: string;
  error?: string;
  /**
   * True only when the enquiry actually reached a Zenward inbox (a 2xx from
   * the email provider). The stub adapter, and every failure path, return
   * `false` so the UI never implies a message was received when it was not.
   * Mirrors `TransportationRequestResult.delivered`.
   */
  delivered: boolean;
}
