/**
 * Safety rules for the Transportation Assistant (ZW-WEB-04H).
 *
 * 1. Emergencies: any sign of a medical emergency stops service qualification
 *    and points to 911.
 * 2. Sensitive details: names, phone numbers, emails, addresses, dates,
 *    times and medical details belong in the protected quote form, not the
 *    chat. Detection only triggers a privacy note; nothing is stored or sent.
 * 3. Output validation: every reply, from this deterministic engine or any
 *    future provider, must pass `validateReply`. Links are restricted to
 *    canonical routes (including Resource pages), the quote handoff may carry ONLY `?service=`, phone
 *    links only Zenward or 911, and the text must stay within approved
 *    claims.
 */
import { SERVICE_CATALOG } from "../service-catalog.ts";
import { PUBLIC_SERVICE_PARAMS } from "../request-intake/service-types.ts";
import { RESOURCE_SLUGS, resourcePath } from "../resources/slugs.ts";
import { PATHS, PHONE } from "./knowledge.ts";
import type { AssistantReply } from "./types.ts";

const EMERGENCY = [
  /\b911\b/,
  /\bambulance\b/,
  /(?<!non )\bemergenc(y|ies)\b/,
  /\b(chest pain|can't breathe|cannot breathe|can not breathe|not breathing|trouble breathing|unconscious|unresponsive|passed out|collapsed|overdos\w*|severe bleeding|bleeding (heavily|badly|a lot))\b/,
  /\bhaving a (stroke|heart attack|seizure)\b/,
  /\b(suicid\w*|kill (my|him|her)self)\b/,
];

/** True when the normalised text suggests a medical emergency. */
export function isEmergency(normalized: string): boolean {
  return EMERGENCY.some((re) => re.test(normalized));
}

const SENSITIVE = [
  /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/, // phone
  /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/, // email
  /\b\d{1,6}\s+[a-z0-9'\s]{2,40}\b(street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd|lane|ln|way|court|ct|place|pl|parkway|pkwy|highway|hwy|circle|cir|trail|trl)\b/, // street address
  /\b(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])(\/\d{2,4})?\b/, // numeric date (not "24/7")
  /\b(jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.? \d{1,2}(st|nd|rd|th)?\b/, // month + day
  /\b\d{1,2}(:\d{2})?\s?(am|pm)\b/, // time
  /\b(my|his|her|their) name is\b/,
  /\b(diagnos\w*|cancer|diabet\w*|dementia|alzheimer\w*|surgery|chemo\w*|medications?|prescriptions?|dob|date of birth)\b/,
];

/** True when a message contains details that belong in the protected form. Matches the raw text too (emails). */
export function hasSensitiveDetails(normalized: string, raw = ""): boolean {
  const lower = raw.toLowerCase();
  return SENSITIVE.some((re) => re.test(normalized) || (lower && re.test(lower)));
}

/** Claims and wording the assistant must never produce (04F/04G discipline + 04H brief). */
export const BANNED_OUTPUT: RegExp[] = [
  /\bguarantee/i,
  /\b100\s?%/,
  /\balways on time\b/i,
  /\b24\s*\/\s*7\b|\b24 hours a day\b|\baround the clock\b/i,
  /\bCPR\b|\bADA\b|\bcertified\b|\bcertification\b|\bdrug[- ]test/i,
  /\b(available|open) (slots?|times?)\b|\blive availability\b|\breal[- ]time\b/i,
  /\b(your )?(ride|booking|trip) (is|has been) (confirmed|booked|scheduled)\b|\binstant(ly)? (booking|confirmation|quote)\b|\bbook now\b|\bautomatic dispatch\b/i,
  /\bflight tracking\b|\bmeet[- ]and[- ]greet\b|\bbaggage\b|\bterminal escort\b/i,
  /\b(lift|ramp) (spec|capacity)|\bweight limit\b|\bsecurement\b|\btie[- ]?downs?\b|\blifting\b|\btransfers?\b|\boxygen\b/i,
  /\bwe (accept|take|bill) (medicaid|medicare|insurance)\b/i,
  /\b(AI|artificial intelligence|chatbot|bot|agent will|an agent|live agent|human agent|dispatcher)\b/,
  /\bI('m| am) (alice|sarah|david|a person|human)\b/i,
  /\$\s?\d/,
];

const SERVICE_PATHS = new Set(Object.values(SERVICE_CATALOG).map((e) => e.path));
// Canonical Resource pages (ZW-WEB-04K) are allowed link targets too; never anchors or query strings.
const STATIC_PATHS = new Set<string>([PATHS.quote, PATHS.contact, PATHS.providers, PATHS.services, ...RESOURCE_SLUGS.map(resourcePath)]);
const SERVICE_PARAMS = new Set<string>(Object.keys(PUBLIC_SERVICE_PARAMS));

/** True when `href` is a canonical in-site route the assistant may link to. The quote link may carry ONLY `service`. */
export function isAllowedHref(href: string): boolean {
  const [path, query, ...rest] = href.split("?");
  if (rest.length > 0 || href.includes("#")) return false;
  if (query === undefined) return STATIC_PATHS.has(path) || SERVICE_PATHS.has(path);
  if (path !== PATHS.quote) return false;
  const params = new URLSearchParams(query);
  const keys = [...params.keys()];
  return keys.length === 1 && keys[0] === "service" && SERVICE_PARAMS.has(params.get("service") ?? "");
}

export const ALLOWED_TEL = new Set([PHONE.href, "tel:911"]);

/** Problems with a reply, or [] when it is safe to show. */
export function validateReply(reply: AssistantReply): string[] {
  const problems: string[] = [];
  const text = [...reply.paragraphs, ...(reply.steps ?? []), ...reply.actions.map((a) => a.label)].join("\n");
  for (const re of BANNED_OUTPUT) if (re.test(text)) problems.push(`banned wording ${re}`);
  if (reply.paragraphs.length === 0 || reply.paragraphs.length > 3) problems.push("paragraph count");
  for (const action of reply.actions) {
    if (action.kind === "link" && !isAllowedHref(action.href)) problems.push(`link ${action.href}`);
    if (action.kind === "tel" && !ALLOWED_TEL.has(action.href)) problems.push(`tel ${action.href}`);
  }
  return problems;
}
