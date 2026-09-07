export type ContactTopic = "general" | "provider" | "support";

export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  topic: ContactTopic;
  message: string;
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
