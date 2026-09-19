/**
 * Transportation service types for the request form and the Nemryn public
 * intake contract (docs/architecture/nemryn-trusted-request-intake-contract.md).
 *
 * Two deliberately separate sets:
 *
 * - `SERVICE_TYPES` is the INTERNAL / WIRE model. It mirrors Nemryn's frozen
 *   `serviceType` enum value-for-value, so the mapping layer can represent
 *   everything Nemryn accepts.
 * - `PUBLIC_SERVICE_TYPES` is what Zenward Mobility currently OFFERS through
 *   the public form. Nemryn accepting a value does not mean Zenward presents
 *   that service publicly; that is a Zenward-Web decision governed by
 *   docs/product/marketing-scope.md. `wheelchair_transportation` is held out
 *   of the public set in this release and is added back deliberately by the
 *   ZW-WEB-03B2 release.
 *
 * Pure data + pure functions: no React, no server-only imports, safe in the
 * browser bundle.
 */
export const SERVICE_TYPES = [
  "medical_appointment",
  "dialysis",
  "rehabilitation",
  "hospital_discharge",
  "recurring_care",
  "senior_medical",
  "wheelchair_transportation",
  "other",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

/** Types the public form offers and the Server Action accepts from a visitor. */
export const PUBLIC_SERVICE_TYPES = [
  "medical_appointment",
  "dialysis",
  "rehabilitation",
  "hospital_discharge",
  "recurring_care",
  "senior_medical",
  "other",
] as const satisfies readonly ServiceType[];

export type PublicServiceType = (typeof PUBLIC_SERVICE_TYPES)[number];

/** Form labels, in the order they appear in the "Service needed" select. */
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  medical_appointment: "Medical appointment",
  dialysis: "Dialysis transportation",
  rehabilitation: "Rehabilitation transportation",
  hospital_discharge: "Hospital discharge transportation",
  recurring_care: "Recurring care transportation",
  senior_medical: "Senior medical transportation",
  wheelchair_transportation: "Wheelchair transportation",
  other: "Other",
};

/** Options for the public "Service needed" select: public types only. */
export const SERVICE_TYPE_OPTIONS = PUBLIC_SERVICE_TYPES.map((value) => ({
  value,
  label: SERVICE_TYPE_LABELS[value],
}));

/** True when `value` is exactly one of the service types Nemryn's contract accepts. */
export function isServiceType(value: unknown): value is ServiceType {
  return typeof value === "string" && (SERVICE_TYPES as readonly string[]).includes(value);
}

/** True when `value` is exactly one of the service types Zenward currently offers publicly. */
export function isPublicServiceType(value: unknown): value is PublicServiceType {
  return typeof value === "string" && (PUBLIC_SERVICE_TYPES as readonly string[]).includes(value);
}

/**
 * Public `?service=` query values → internal service types.
 *
 * A deliberate, explicit map (not "any enum value is accepted"): the URL is
 * public, user-editable and shareable, so the set of values it can express is
 * decided here. Only the six approved service routes can be preselected;
 * `other` and any type not publicly offered cannot. The URL carries a
 * service label and NOTHING else — never a name, phone, email, address,
 * appointment detail, mobility note, schedule, or tenant identifier.
 */
export const PUBLIC_SERVICE_PARAMS = {
  medical_appointment: "medical_appointment",
  dialysis: "dialysis",
  rehabilitation: "rehabilitation",
  hospital_discharge: "hospital_discharge",
  recurring_care: "recurring_care",
  senior_medical: "senior_medical",
} as const satisfies Partial<Record<PublicServiceType, PublicServiceType>>;

export type PublicServiceParam = keyof typeof PUBLIC_SERVICE_PARAMS;

/** The `?service=` value for a preselectable service type. */
export function serviceParamFor(type: Exclude<PublicServiceType, "other">): PublicServiceParam {
  return type;
}

/** The request-form URL for a service — a query string with only the service label. */
export function requestHrefFor(type: Exclude<PublicServiceType, "other">): string {
  return `/request-transportation?service=${serviceParamFor(type)}`;
}

/**
 * Resolves a raw `?service=` value (string, repeated-param array, or
 * undefined) to a service type, or `undefined` when it is missing or not on
 * the allow-list. NEVER throws and never echoes the input: unknown, empty,
 * oversized, prototype-key (`__proto__`, `constructor`) or otherwise arbitrary
 * values are simply ignored.
 */
export function resolveServiceParam(raw: unknown): PublicServiceType | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string" || value.length === 0 || value.length > 64) return undefined;
  return Object.prototype.hasOwnProperty.call(PUBLIC_SERVICE_PARAMS, value)
    ? PUBLIC_SERVICE_PARAMS[value as PublicServiceParam]
    : undefined;
}

export type TripFrequency = "one_time" | "recurring";

/** The trip-frequency the form defaults to when arriving with a preselected service. */
export function defaultFrequencyFor(type: ServiceType | undefined): TripFrequency {
  return type === "recurring_care" ? "recurring" : "one_time";
}
