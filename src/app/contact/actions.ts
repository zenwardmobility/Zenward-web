"use server";

import { getContactIntakeAdapter } from "@/lib/contact-intake/adapter";
import type { ContactMessageInput, ContactMessageResult } from "@/lib/contact-intake/types";

export async function submitContactMessage(input: ContactMessageInput): Promise<ContactMessageResult> {
  if (!input.name?.trim() || !input.email?.trim() || !input.message?.trim()) {
    return { ok: false, error: "Please fill in your name, email, and message." };
  }
  const adapter = getContactIntakeAdapter();
  return adapter.submit(input);
}
