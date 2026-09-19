// Guards the PUBLIC service offering for the Nemryn adapter release
// (P1-PILOT-S4B-R3, owner decision "Option B"): Nemryn's contract accepts
// `wheelchair_transportation`, but Zenward-Web does not offer it publicly in
// this release. The ZW-WEB-03B2 release adds it back deliberately -- when it
// does, update the assertions below in the same change.
//
//   npm test

import test from "node:test";
import assert from "node:assert/strict";

const {
  SERVICE_TYPES,
  PUBLIC_SERVICE_TYPES,
  SERVICE_TYPE_OPTIONS,
  isServiceType,
  isPublicServiceType,
  resolveServiceParam,
} = await import("./service-types.ts");
const { buildNemrynIntakeBody } = await import("./nemryn-mapping.ts");

test("the wire model still represents the whole Nemryn enum, including wheelchair_transportation", () => {
  assert.equal(SERVICE_TYPES.length, 8);
  assert.ok(isServiceType("wheelchair_transportation"));
});

test("wheelchair_transportation is not a public service type in this release", () => {
  assert.equal(PUBLIC_SERVICE_TYPES.includes("wheelchair_transportation"), false);
  assert.equal(isPublicServiceType("wheelchair_transportation"), false);
});

test("the public form options are exactly the already-public services", () => {
  assert.deepEqual(
    SERVICE_TYPE_OPTIONS.map((o) => o.value),
    ["medical_appointment", "dialysis", "rehabilitation", "hospital_discharge", "recurring_care", "senior_medical", "other"],
  );
  assert.equal(SERVICE_TYPE_OPTIONS.some((o) => /wheelchair/i.test(o.label)), false);
});

test("every public type is a valid Nemryn type", () => {
  for (const type of PUBLIC_SERVICE_TYPES) assert.ok(isServiceType(type), type);
});

test("isPublicServiceType rejects unknown, empty and non-string values", () => {
  for (const v of [undefined, null, "", "ambulance", "stretcher", "__proto__", 1, {}, ["dialysis"]]) {
    assert.equal(isPublicServiceType(v), false, String(v));
  }
});

test("?service=wheelchair_transportation is not preselectable", () => {
  assert.equal(resolveServiceParam("wheelchair_transportation"), undefined);
  assert.equal(resolveServiceParam("dialysis"), "dialysis");
});

test("the mapping layer itself is not narrowed: it would still pass wheelchair through", () => {
  const body = buildNemrynIntakeBody(
    {
      serviceType: "wheelchair_transportation",
      requesterName: "a",
      requesterRelationship: "self",
      requesterPhone: "1",
      passengerName: "a",
      pickupDescription: "p",
      destinationDescription: "d",
      returnTripNeeded: "no",
    },
    "int",
    "key",
  );
  assert.equal(body.serviceType, "wheelchair_transportation");
});
