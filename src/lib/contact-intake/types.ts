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
}
