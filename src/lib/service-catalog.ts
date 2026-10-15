/**
 * The public service catalogue (ZW-WEB-04C1): slugs, routes, canonical labels,
 * intake state, quote links and related services. It is pure data with
 * relative imports only, so node tests can load it (see
 * src/lib/service-catalog.test.mjs). Page content lives in
 * src/lib/services.ts, which reads this.
 *
 * Intake state:
 *   live     the service maps 1:1 to a Nemryn-accepted `serviceType`. The
 *            Request a Quote link preselects it (`?service=`).
 *   pending  the service is public, but the Nemryn contract can't carry it
 *            yet (CONTRACT_PENDING_SERVICE_LABELS). Its quote link goes to
 *            the plain request form (no preselection), and the value never
 *            reaches the form, the Server Action or the wire.
 */
import {
  CONTRACT_PENDING_SERVICE_LABELS,
  SERVICE_TYPE_LABELS,
  requestHrefFor,
  type ContractPendingService,
  type PublicServiceType,
} from "./request-intake/service-types.ts";

export type ServiceSlug =
  | "medical-appointments"
  | "dialysis-transportation"
  | "rehabilitation-transportation"
  | "hospital-discharge-transportation"
  | "recurring-care-transportation"
  | "senior-medical-transportation"
  | "wheelchair-transportation"
  | "airport-transportation";

export type ServiceIntake =
  | { kind: "live"; serviceType: Exclude<PublicServiceType, "other"> }
  | { kind: "pending"; pendingValue: ContractPendingService };

export interface CatalogEntry {
  slug: ServiceSlug;
  path: string;
  label: string;
  intake: ServiceIntake;
  /** Where this service's Request a Quote CTAs go. */
  requestHref: string;
  /** Two or three intentional related services. */
  related: ServiceSlug[];
}

const live = (
  slug: ServiceSlug,
  serviceType: Exclude<PublicServiceType, "other">,
  related: ServiceSlug[],
): CatalogEntry => ({
  slug,
  path: `/services/${slug}`,
  label: SERVICE_TYPE_LABELS[serviceType],
  intake: { kind: "live", serviceType },
  requestHref: requestHrefFor(serviceType),
  related,
});

const pending = (slug: ServiceSlug, pendingValue: ContractPendingService, related: ServiceSlug[]): CatalogEntry => ({
  slug,
  path: `/services/${slug}`,
  label: CONTRACT_PENDING_SERVICE_LABELS[pendingValue],
  intake: { kind: "pending", pendingValue },
  // Plain form: no `?service=` for a value the intake can't accept.
  requestHref: "/request-transportation",
  related,
});

export const SERVICE_CATALOG: Record<ServiceSlug, CatalogEntry> = {
  "medical-appointments": live("medical-appointments", "medical_appointment", [
    "senior-medical-transportation",
    "recurring-care-transportation",
    "wheelchair-transportation",
  ]),
  "dialysis-transportation": live("dialysis-transportation", "dialysis", [
    "recurring-care-transportation",
    "wheelchair-transportation",
  ]),
  "rehabilitation-transportation": live("rehabilitation-transportation", "rehabilitation", [
    "recurring-care-transportation",
    "medical-appointments",
    "wheelchair-transportation",
  ]),
  "hospital-discharge-transportation": live("hospital-discharge-transportation", "hospital_discharge", [
    "senior-medical-transportation",
    "wheelchair-transportation",
  ]),
  "recurring-care-transportation": live("recurring-care-transportation", "recurring_care", [
    "dialysis-transportation",
    "rehabilitation-transportation",
    "wheelchair-transportation",
  ]),
  "senior-medical-transportation": live("senior-medical-transportation", "senior_medical", [
    "medical-appointments",
    "wheelchair-transportation",
    "airport-transportation",
  ]),
  "wheelchair-transportation": live("wheelchair-transportation", "wheelchair_transportation", [
    "medical-appointments",
    "dialysis-transportation",
    "airport-transportation",
  ]),
  "airport-transportation": pending("airport-transportation", "airport_transportation", [
    "senior-medical-transportation",
    "wheelchair-transportation",
    "medical-appointments",
  ]),
};

/** Stable display order (/services, homepage). Airport is 08, after the medical services. */
export const SERVICE_ORDER: ServiceSlug[] = [
  "medical-appointments",
  "dialysis-transportation",
  "rehabilitation-transportation",
  "hospital-discharge-transportation",
  "recurring-care-transportation",
  "senior-medical-transportation",
  "wheelchair-transportation",
  "airport-transportation",
];

export const SERVICE_PATHS = SERVICE_ORDER.map((slug) => SERVICE_CATALOG[slug].path);

/** Page title stem for a service page, e.g. "Airport Transportation in Metro Atlanta". */
export function serviceTitle(slug: ServiceSlug, marketName: string): string {
  return `${SERVICE_CATALOG[slug].label} in ${marketName}`;
}
