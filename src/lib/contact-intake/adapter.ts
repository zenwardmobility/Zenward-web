import type { ContactMessageInput, ContactMessageResult } from "./types";

/**
 * Same controlled-boundary pattern as request-intake (see
 * src/lib/request-intake/adapter.ts and
 * docs/architecture/request-intake-boundary.md) applied to general contact
 * messages. Replace the stub with a real delivery destination (email
 * service, CRM, or a Zenward Platform inbox endpoint) behind this same
 * interface — never by having the contact page call a third-party service
 * directly from the client.
 */
export interface ContactIntakeAdapter {
  submit(input: ContactMessageInput): Promise<ContactMessageResult>;
}

class StubContactIntakeAdapter implements ContactIntakeAdapter {
  async submit(): Promise<ContactMessageResult> {
    const referenceId = `ZW-MSG-${Date.now().toString(36).toUpperCase()}`;
    if (process.env.NODE_ENV !== "production") {
      console.info(`[contact-intake:stub] received a message — reference ${referenceId}. No data was persisted.`);
    }
    return { ok: true, referenceId };
  }
}

let cachedAdapter: ContactIntakeAdapter | undefined;

export function getContactIntakeAdapter(): ContactIntakeAdapter {
  if (cachedAdapter) return cachedAdapter;
  cachedAdapter = new StubContactIntakeAdapter();
  return cachedAdapter;
}
