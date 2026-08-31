import type { ContactMessageInput, ContactMessageResult } from "./types";

/**
 * Contact-intake boundary. Same controlled pattern as request-intake (see
 * src/lib/request-intake/adapter.ts and
 * docs/architecture/request-intake-boundary.md), but the general contact
 * form is allowed to use ordinary server-side email: by design it collects
 * only what a business conversation needs and must not contain detailed
 * passenger transportation information (people who need a ride are pointed at
 * /request-transportation or the phone number).
 *
 * The email provider (Resend) is isolated inside EmailContactIntakeAdapter.
 * Swapping providers, or moving to a CRM / Platform inbox, means writing one
 * new class here — no page, form, or Server Action changes.
 */
export interface ContactIntakeAdapter {
  submit(input: ContactMessageInput): Promise<ContactMessageResult>;
}

const TOPIC_LABELS: Record<ContactMessageInput["topic"], string> = {
  general: "General question",
  provider: "Healthcare provider",
  support: "Support for an existing request",
};

function newReference(): string {
  return `ZW-MSG-${Date.now().toString(36).toUpperCase()}`;
}

function buildEnquiryText(input: ContactMessageInput, referenceId: string): string {
  const lines = [
    "New Zenward Website Enquiry",
    "",
    `Reference:    ${referenceId}`,
    `Topic:        ${TOPIC_LABELS[input.topic] ?? input.topic}`,
    `Name:         ${input.name}`,
    `Email:        ${input.email}`,
  ];
  if (input.phone) lines.push(`Phone:        ${input.phone}`);
  if (input.organization) lines.push(`Organization: ${input.organization}`);
  lines.push("", "Message:", input.message, "");
  return lines.join("\n");
}

/**
 * Safe default. Acknowledges the message, delivers nothing, stores nothing,
 * logs no message content, touches no credential. Used until
 * CONTACT_INTAKE_MODE=email is configured with real values.
 */
class StubContactIntakeAdapter implements ContactIntakeAdapter {
  async submit(): Promise<ContactMessageResult> {
    const referenceId = newReference();
    if (process.env.NODE_ENV === "production") {
      console.warn("[contact-intake] running in STUB mode: an enquiry was acknowledged but NOT delivered.");
    } else {
      console.info(`[contact-intake:stub] acknowledged ${referenceId} — nothing delivered.`);
    }
    return { ok: true, referenceId };
  }
}

/**
 * Delivers the enquiry as a plain-text internal email via Resend's REST API
 * (https://resend.com/docs/api-reference/emails/send-email). No SDK: one
 * `fetch`, so the provider surface stays tiny and swappable. All three
 * values are server-only env vars — none are `NEXT_PUBLIC_`, none reach the
 * browser.
 */
class EmailContactIntakeAdapter implements ContactIntakeAdapter {
  private readonly to = process.env.CONTACT_INTAKE_EMAIL;
  private readonly from = process.env.CONTACT_EMAIL_FROM;
  private readonly apiKey = process.env.CONTACT_EMAIL_API_KEY;

  async submit(input: ContactMessageInput): Promise<ContactMessageResult> {
    if (!this.to || !this.from || !this.apiKey) {
      console.error(
        "[contact-intake] mode=email but CONTACT_INTAKE_EMAIL / CONTACT_EMAIL_FROM / CONTACT_EMAIL_API_KEY are not all set.",
      );
      return { ok: false, error: "We couldn't send your message just now. Please try again, or call us." };
    }

    const referenceId = newReference();

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: [this.to],
          reply_to: input.email,
          subject: `New Zenward Website Enquiry — ${TOPIC_LABELS[input.topic] ?? input.topic}`,
          text: buildEnquiryText(input, referenceId),
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        console.error(`[contact-intake] email provider responded ${res.status}.`);
        return { ok: false, error: "We couldn't send your message just now. Please try again, or call us." };
      }

      return { ok: true, referenceId };
    } catch (err) {
      console.error("[contact-intake] email send failed.", err instanceof Error ? err.name : "unknown");
      return { ok: false, error: "We couldn't send your message just now. Please try again, or call us." };
    }
  }
}

let cachedAdapter: ContactIntakeAdapter | undefined;

export function getContactIntakeAdapter(): ContactIntakeAdapter {
  if (cachedAdapter) return cachedAdapter;

  const mode = (process.env.CONTACT_INTAKE_MODE ?? "stub").toLowerCase();
  cachedAdapter = mode === "email" ? new EmailContactIntakeAdapter() : new StubContactIntakeAdapter();
  return cachedAdapter;
}
