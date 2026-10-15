// ZW-WEB-04C1 contract gate: Airport Transportation is a public service, but
// Nemryn's serviceType enum (frozen at c275ec5) does not accept
// `airport_transportation`. Until it does, the value must not be able to reach
// the form, ?service= preselection, the Server Action or the wire.
//
//   npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const {
  SERVICE_TYPES,
  PUBLIC_SERVICE_TYPES,
  SERVICE_TYPE_OPTIONS,
  PUBLIC_SERVICE_PARAMS,
  CONTRACT_PENDING_SERVICE_LABELS,
  isServiceType,
  isPublicServiceType,
  resolveServiceParam,
} = await import("./service-types.ts");
const { SERVICE_CATALOG, SERVICE_ORDER } = await import("../service-catalog.ts");

test("airport_transportation is contract-pending with its public label", () => {
  assert.equal(CONTRACT_PENDING_SERVICE_LABELS.airport_transportation, "Airport Transportation");
});

test("airport_transportation is not in the wire enum or the public intake set", () => {
  assert.equal(SERVICE_TYPES.includes("airport_transportation"), false);
  assert.equal(PUBLIC_SERVICE_TYPES.includes("airport_transportation"), false);
  assert.equal(isServiceType("airport_transportation"), false);
  assert.equal(isPublicServiceType("airport_transportation"), false);
});

test("the request form does not offer an airport option", () => {
  assert.equal(SERVICE_TYPE_OPTIONS.some((o) => o.value === "airport_transportation"), false);
  assert.equal(SERVICE_TYPE_OPTIONS.some((o) => /airport/i.test(o.label)), false);
});

test("?service=airport_transportation preselects nothing", () => {
  assert.equal(Object.prototype.hasOwnProperty.call(PUBLIC_SERVICE_PARAMS, "airport_transportation"), false);
  assert.equal(resolveServiceParam("airport_transportation"), undefined);
});

test("the Server Action gates serviceType with isPublicServiceType before the adapter", () => {
  const action = readFileSync(path.join(here, "../../app/request-transportation/actions.ts"), "utf8");
  const gate = action.indexOf("if (!isPublicServiceType(src.serviceType))");
  const submit = action.indexOf("getRequestIntakeAdapter().submit(");
  assert.ok(gate > 0 && submit > gate);
});

test("the airport catalogue entry is pending and its quote link carries no service value", () => {
  const airport = SERVICE_CATALOG["airport-transportation"];
  assert.deepEqual(airport.intake, { kind: "pending", pendingValue: "airport_transportation" });
  assert.equal(airport.requestHref, "/request-transportation");
});

test("every live catalogue service maps to a wire-enum value and preselects it", () => {
  for (const slug of SERVICE_ORDER) {
    const entry = SERVICE_CATALOG[slug];
    if (entry.intake.kind !== "live") continue;
    assert.ok(isPublicServiceType(entry.intake.serviceType), slug);
    assert.equal(entry.requestHref, `/request-transportation?service=${entry.intake.serviceType}`, slug);
  }
});
