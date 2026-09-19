/**
 * Tenancy-identifier guard (see docs/architecture/nemryn-trusted-request-intake-contract.md).
 *
 * Zenward-Web must NEVER send — and a public visitor must never be able to
 * supply — a tenant / organisation / workspace / operator / company
 * identifier. Nemryn derives the Zenward Mobility organisation exclusively
 * from the opaque `integrationExternalId` server-side, and rejects any body
 * containing a field outside its closed set.
 *
 * This module is the Zenward-Web side of that rule: it lets the Server Action
 * refuse a tampered submission and lets the adapter refuse to transmit a body
 * that contains one (defence in depth — the whitelist rebuild in the Server
 * Action already means a legitimate body cannot). It reports key NAMES only,
 * never values, so it is safe to log.
 */

/** Normalised (lower-case, letters/digits only) forbidden key names. */
const FORBIDDEN = new Set([
  "tenantid",
  "organizationid",
  "organisationid",
  "orgid",
  "workspaceid",
  "operatorid",
  "companyid",
]);

/** Contract-level list, for documentation and tests. */
export const FORBIDDEN_TENANCY_KEYS = [
  "tenant_id",
  "organization_id",
  "workspace_id",
  "operator_id",
  "company_id",
] as const;

function normalise(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Returns the (normalised) forbidden key names found anywhere in `value`,
 * at any nesting depth, in objects or arrays. Empty array = clean. Depth- and
 * size-bounded so a hostile payload cannot make it expensive.
 */
export function findTenancyKeys(value: unknown, depth = 0, budget = { nodes: 0 }): string[] {
  if (depth > 8 || budget.nodes > 2_000 || value === null || typeof value !== "object") return [];
  budget.nodes += 1;
  const found: string[] = [];
  if (Array.isArray(value)) {
    for (const item of value) found.push(...findTenancyKeys(item, depth + 1, budget));
    return found;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN.has(normalise(key))) found.push(normalise(key));
    found.push(...findTenancyKeys(child, depth + 1, budget));
  }
  return found;
}

/** True when `value` contains no caller-supplied tenancy identifier at any depth. */
export function hasNoTenancyKeys(value: unknown): boolean {
  return findTenancyKeys(value).length === 0;
}
