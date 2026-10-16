/**
 * Pickup & assistance level (ZW-WEB-04G3): the ONE canonical source for the
 * four values, their public labels and descriptions, and the temporary
 * intake-compatibility encoding. The form, Review step, explainer, Resources
 * and Zenny all read from here.
 *
 * NOT A SERVICE. A transportation service says WHAT the trip is (dialysis,
 * wheelchair-accessible, airport, ...). The assistance level says HOW MUCH
 * driver escort is requested around pickup and drop-off. They are orthogonal:
 * no assistance value is ever a `serviceType`, a service page or a Nemryn
 * Services & Intake setting.
 *
 * WORDING RULE: door-through-door is additional ESCORT beyond the building
 * entrance, when arranged with Zenward. Nothing here promises lifting,
 * carrying, physical transfers, stair carries, clinical assistance,
 * monitoring, oxygen handling, stretcher transport or access inside a private
 * residence. Specific assistance is reviewed and confirmed before the trip.
 *
 * Pure data and functions, no imports (node-testable).
 */

export const ASSISTANCE_LEVEL_VALUES = ["curb_to_curb", "door_to_door", "door_through_door", "unsure"] as const;

export type AssistanceLevel = (typeof ASSISTANCE_LEVEL_VALUES)[number];

export interface AssistanceLevelDefinition {
  value: AssistanceLevel;
  /** Public label (cards, Review, explainer, Zenny). */
  label: string;
  /** Owner-approved public description. */
  description: string;
  /** Compact wording for tight contexts (checklist hints, compact explainer). */
  short: string;
  /** Label used in the intake-compatibility line ("Assistance level: <wireLabel>"). Stable: never reword casually. */
  wireLabel: string;
}

export const ASSISTANCE_LEVELS: readonly AssistanceLevelDefinition[] = [
  {
    value: "curb_to_curb",
    label: "Curb-to-curb",
    description:
      "Pickup and drop-off at the curb. Best when the passenger can get between the building and vehicle without driver escort.",
    short: "Pickup and drop-off at the curb.",
    wireLabel: "Curb-to-curb",
  },
  {
    value: "door_to_door",
    label: "Door-to-door",
    description: "The driver meets the passenger at the building entrance and assists between the entrance and vehicle.",
    short: "The driver meets the passenger at the building entrance.",
    wireLabel: "Door-to-door",
  },
  {
    value: "door_through_door",
    label: "Door-through-door",
    description: "Additional escort beyond the building entrance when arranged with Zenward.",
    short: "Additional escort beyond the building entrance, when arranged with Zenward.",
    wireLabel: "Door-through-door",
  },
  {
    value: "unsure",
    label: "Not sure",
    description: "Tell us what help is needed and Zenward will review the request with you.",
    short: "Tell us what help is needed and Zenward will review it with you.",
    wireLabel: "Not sure",
  },
];

/** Field name shown to the public. */
export const ASSISTANCE_LEVEL_LABEL = "Pickup & assistance level";

/** Restrained clarification shown with the options. */
export const ASSISTANCE_REVIEW_NOTE = "Specific assistance is reviewed and confirmed before the trip.";

/** Validation copy (owner-approved). */
export const ASSISTANCE_LEVEL_REQUIRED = "Choose the assistance level that best fits the trip, or select Not sure.";

/** Guidance when a visitor doesn't know which option fits (form, Zenny). */
export const ASSISTANCE_UNSURE_GUIDANCE =
  "You can select Not sure on the request form and describe what help is needed. Zenward will review the request with you.";

export function isAssistanceLevel(value: unknown): value is AssistanceLevel {
  return typeof value === "string" && (ASSISTANCE_LEVEL_VALUES as readonly string[]).includes(value);
}

export function assistanceLevel(value: AssistanceLevel): AssistanceLevelDefinition {
  return ASSISTANCE_LEVELS.find((level) => level.value === value)!;
}

// ---------------------------------------------------------------- intake compatibility

/**
 * TEMPORARY INTAKE COMPATIBILITY (until Nemryn's Website Intake contract has a
 * structured `assistanceLevel` field). The level travels inside the existing
 * `assistanceNotes` wire field in a stable format:
 *
 *   Assistance level: Door-to-door
 *
 *   Additional assistance:
 *   Passenger uses a walker and may need extra time at pickup.
 *
 * Applied ONLY by the server-side Nemryn mapping, right before the wire body
 * is built. The form state, Review step and Server Action keep the level as a
 * structured value; nobody reads this combined string on the website.
 */
export const ASSISTANCE_LINE_PREFIX = "Assistance level: ";
export const ADDITIONAL_ASSISTANCE_HEADER = "Additional assistance:";

/** The longest text the encoding can add, so free text is capped to keep the whole field within the intake limit. */
export const ASSISTANCE_ENCODING_OVERHEAD = Math.max(
  ...ASSISTANCE_LEVELS.map((level) => `${ASSISTANCE_LINE_PREFIX}${level.wireLabel}\n\n${ADDITIONAL_ASSISTANCE_HEADER}\n`.length),
);

/** The intake's assistanceNotes limit (Server Action FIELD_LIMITS.longText). */
export const ASSISTANCE_NOTES_WIRE_LIMIT = 2_000;

/** Max free-text length the visitor can type, so the encoded field never exceeds the wire limit and nothing typed is cut off. */
export const ASSISTANCE_NOTES_MAX_LENGTH = ASSISTANCE_NOTES_WIRE_LIMIT - ASSISTANCE_ENCODING_OVERHEAD;

const ENCODED_HEAD = /^Assistance level: [^\n]*(?:\n+Additional assistance:\n?)?\n*/;

/** Removes a leading compatibility block, so re-encoding never duplicates the prefix. */
export function stripAssistanceEncoding(notes: string): string {
  let text = notes.trimStart();
  while (ENCODED_HEAD.test(text)) text = text.replace(ENCODED_HEAD, "").trimStart();
  return text;
}

/**
 * Encodes the level and the visitor's free text into one `assistanceNotes`
 * value. Deterministic (a retry produces the same string), never discards
 * the visitor's text, never duplicates the prefix.
 */
export function encodeAssistanceNotes(level: AssistanceLevel, freeText?: string): string {
  const line = `${ASSISTANCE_LINE_PREFIX}${assistanceLevel(level).wireLabel}`;
  const text = stripAssistanceEncoding(freeText ?? "").trim();
  return text ? `${line}\n\n${ADDITIONAL_ASSISTANCE_HEADER}\n${text}` : line;
}
