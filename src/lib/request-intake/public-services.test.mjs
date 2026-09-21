// Guards the PUBLIC service offering: Zenward-Web keeps a public set
// (`PUBLIC_SERVICE_TYPES`) separate from the Nemryn wire enum (`SERVICE_TYPES`).
// Today they are equal -- wheelchair transportation is an owner-confirmed approved
// service (ZW-WEB-03B2). If Nemryn ever accepts a type Zenward does not offer, it
// belongs in SERVICE_TYPES only, and these assertions should be extended.
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

test("wheelchair_transportation is an approved public service type", () => {
  assert.ok(PUBLIC_SERVICE_TYPES.includes("wheelchair_transportation"));
  assert.ok(isPublicServiceType("wheelchair_transportation"));
});

test("the public form options are the eight approved services, wheelchair included", () => {
  assert.deepEqual(
    SERVICE_TYPE_OPTIONS.map((o) => o.value),
    ["medical_appointment", "dialysis", "rehabilitation", "hospital_discharge", "recurring_care", "senior_medical", "wheelchair_transportation", "other"],
  );
  assert.ok(SERVICE_TYPE_OPTIONS.some((o) => o.value === "wheelchair_transportation" && o.label === "Wheelchair transportation"));
});

test("every public type is a valid Nemryn type", () => {
  for (const type of PUBLIC_SERVICE_TYPES) assert.ok(isServiceType(type), type);
});

test("isPublicServiceType rejects unknown, empty and non-string values", () => {
  for (const v of [undefined, null, "", "ambulance", "stretcher", "__proto__", 1, {}, ["dialysis"]]) {
    assert.equal(isPublicServiceType(v), false, String(v));
  }
});

test("?service= preselects approved services (wheelchair included) and ignores everything else", () => {
  assert.equal(resolveServiceParam("wheelchair_transportation"), "wheelchair_transportation");
  assert.equal(resolveServiceParam("dialysis"), "dialysis");
  for (const v of ["other", "ambulance", "stretcher", "__proto__", "constructor", "", undefined, ["nope"], "x".repeat(200)]) {
    assert.equal(resolveServiceParam(v), undefined, String(v));
  }
});

test("the mapping layer sends wheelchair_transportation directly as the structured serviceType", () => {
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
