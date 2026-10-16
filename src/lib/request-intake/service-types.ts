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
 *   docs/product/marketing-scope.md. Today the two sets are equal: wheelchair
 *   transportation is an owner-confirmed approved service (ZW-WEB-03B2). A
 *   type Nemryn accepts but Zenward does not offer must stay out of this set.
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
  // Accepted by Nemryn since migration 20261015135000 / app a0a65aa (ZW-WEB-04C2).
  "airport_transportation",
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
  "wheelchair_transportation",
  "airport_transportation",
  "other",
] as const satisfies readonly ServiceType[];

export type PublicServiceType = (typeof PUBLIC_SERVICE_TYPES)[number];

/**
 * Canonical PUBLIC service labels (ZW-WEB-04C), the single source for the
 * request-form options and every service name on the site (src/lib/services.ts
 * reads these). Display text only: the keys are the unchanged internal/wire
 * values sent to Nemryn (e.g. "Wheelchair-Accessible Transportation" is still
 * `wheelchair_transportation` on the wire).
 */
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  medical_appointment: "Medical Appointment Transportation",
  dialysis: "Dialysis Transportation",
  rehabilitation: "Rehabilitation Transportation",
  hospital_discharge: "Hospital Discharge Transportation",
  recurring_care: "Recurring Care Transportation",
  senior_medical: "Senior Medical Transportation",
  wheelchair_transportation: "Wheelchair-Accessible Transportation",
  airport_transportation: "Airport Transportation",
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
 * decided here. Only the eight public services (the seven non-emergency
 * medical services plus Airport Transportation) can be preselected; `other`
 * and any type not publicly offered cannot. The URL carries a
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
  wheelchair_transportation: "wheelchair_transportation",
  airport_transportation: "airport_transportation",
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

/**
 * CONTRACT GATE (ZW-WEB-04C1). Public services Zenward offers that the Nemryn
 * intake contract cannot carry yet. They have public pages and catalogue
 * entries, but they are deliberately NOT in `SERVICE_TYPES`,
 * `PUBLIC_SERVICE_TYPES`, `SERVICE_TYPE_OPTIONS` or `PUBLIC_SERVICE_PARAMS`.
 * So they cannot be chosen on the form, preselected by `?service=`, accepted
 * by the Server Action or sent to Nemryn.
 *
 * Why: Nemryn's `serviceType` is a closed enum (contract frozen at Nemryn
 * c275ec5; docs/architecture/nemryn-trusted-request-intake-contract.md) and any
 * other value is rejected with the generic 400. Mapping a pending service to
 * another value (e.g. "other") would silently lose its structure.
 *
 * To activate one (after Nemryn's enum accepts it, verified end-to-end):
 * move it into SERVICE_TYPES, PUBLIC_SERVICE_TYPES, SERVICE_TYPE_LABELS and
 * PUBLIC_SERVICE_PARAMS, update the contract doc and the parity/gate tests,
 * and switch its catalogue intake to `live` in src/lib/service-catalog.ts.
 */
//
// History: Airport Transportation was gated here in ZW-WEB-04C1 and activated
// in ZW-WEB-04C2 once Nemryn accepted `airport_transportation` (Core migration
// 20261015135000, app release a0a65aa). No service is pending today.
export const CONTRACT_PENDING_SERVICE_LABELS = {} as const satisfies Record<string, string>;

export type ContractPendingService = keyof typeof CONTRACT_PENDING_SERVICE_LABELS;

export type TripFrequency = "one_time" | "recurring";

/** The trip-frequency the form defaults to when arriving with a preselected service. */
export function defaultFrequencyFor(type: ServiceType | undefined): TripFrequency {
  return type === "recurring_care" ? "recurring" : "one_time";
}
