/**
 * Types for the Zenward Transportation Assistant (ZW-WEB-04H, internal name
 * "On-Duty Transportation Assistant"). V1 is a website concierge: guidance and
 * routing only. It never reads or writes requests, never checks availability
 * and never sends what a visitor types anywhere.
 */
import type { ServiceSlug } from "../service-catalog.ts";
import type { AssistanceLevel } from "../assistance-level.ts";

export type { ServiceSlug, AssistanceLevel };

/** Buttons offered under a reply. Their ids are handled by `respond`. */
export type QuickReplyId =
  | "start"
  | "request"
  | "find_service"
  | "find_more"
  | "wheelchair"
  | "recurring"
  | "airport"
  | "talk"
  | "process"
  | "trust"
  | "not_emergency"
  | "assistance"
  | `service:${ServiceSlug}`
  | `assistance:${AssistanceLevel}`;

export type AssistantAction =
  /** An in-site link: a service page, the quote form (`?service=` only), contact, providers. */
  | { kind: "link"; label: string; href: string; primary?: boolean; quote?: boolean }
  /** A phone link: Zenward's number, or 911 for emergencies. */
  | { kind: "tel"; label: string; href: string; primary?: boolean }
  /** A follow-up handled by the assistant itself. */
  | { kind: "reply"; label: string; id: QuickReplyId };

/** What kind of answer this is. Stable ids, used by tests and the panel. */
export type ReplyKind =
  | "welcome"
  | "emergency"
  | "service"
  | "find_service"
  | "process"
  | "pricing"
  | "coverage"
  | "status"
  | "manage"
  | "hours"
  | "trust"
  | "response_time"
  | "availability"
  | "area"
  | "provider"
  | "contact"
  | "medical"
  | "sensitive"
  | "resource"
  | "assistance"
  | "greeting"
  | "thanks"
  | "unknown";

export interface AssistantReply {
  kind: ReplyKind;
  /** 1–3 short paragraphs. Never contains anything the visitor typed. */
  paragraphs: string[];
  /** Optional short ordered list (the request process). */
  steps?: string[];
  actions: AssistantAction[];
  /** The service(s) this reply recommends, if any. Not sent anywhere. */
  services?: ServiceSlug[];
}

export type AssistantInput = { kind: "text"; text: string } | { kind: "quick"; id: QuickReplyId };

/**
 * Canonical facts that live in modules node tests can't load (they use the
 * `@/` alias). The panel builds this from src/lib/services.ts and
 * src/lib/service-area.ts; tests inject an equivalent.
 */
export interface AssistantContext {
  marketName: string;
  summaries: Record<ServiceSlug, string>;
}
