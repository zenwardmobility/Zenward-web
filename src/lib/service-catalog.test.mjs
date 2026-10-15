// ZW-WEB-04C1: the public service catalogue (registration, routes, sitemap,
// metadata title, related services). Pure data; loaded directly by node.
//
//   npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const { SERVICE_CATALOG, SERVICE_ORDER, SERVICE_PATHS, serviceTitle } = await import("./service-catalog.ts");

test("Airport Transportation is registered as service 08 with its public label", () => {
  assert.equal(SERVICE_ORDER.length, 8);
  assert.equal(SERVICE_ORDER[7], "airport-transportation");
  const airport = SERVICE_CATALOG["airport-transportation"];
  assert.equal(airport.label, "Airport Transportation");
  assert.equal(airport.path, "/services/airport-transportation");
});

test("the seven medical services keep their canonical labels and order", () => {
  assert.deepEqual(
    SERVICE_ORDER.slice(0, 7).map((slug) => SERVICE_CATALOG[slug].label),
    [
      "Medical Appointment Transportation",
      "Dialysis Transportation",
      "Rehabilitation Transportation",
      "Hospital Discharge Transportation",
      "Recurring Care Transportation",
      "Senior Medical Transportation",
      "Wheelchair-Accessible Transportation",
    ],
  );
});

test("every catalogue service has a route file", () => {
  for (const slug of SERVICE_ORDER) {
    assert.ok(existsSync(path.join(root, "src/app/services", slug, "page.tsx")), slug);
  }
});

test("the sitemap lists every catalogue service, including airport", () => {
  assert.ok(SERVICE_PATHS.includes("/services/airport-transportation"));
  assert.equal(SERVICE_PATHS.length, 8);
  const sitemap = readFileSync(path.join(root, "src/app/sitemap.ts"), "utf8");
  assert.match(sitemap, /import \{ SERVICE_PATHS \} from "@\/lib\/service-catalog"/);
  assert.match(sitemap, /\.\.\.SERVICE_PATHS/);
});

test("service page title stem uses the label and the configured market", () => {
  const serviceArea = readFileSync(path.join(root, "src/lib/service-area.ts"), "utf8");
  const market = serviceArea.match(/slug: "metro-atlanta", name: "([^"]+)"/)?.[1];
  assert.equal(market, "Metro Atlanta");
  assert.equal(serviceTitle("airport-transportation", market), "Airport Transportation in Metro Atlanta");
  const pages = readFileSync(path.join(root, "src/lib/service-pages.ts"), "utf8");
  assert.match(pages, /title: `\$\{service\.label\} in \$\{market\.name\}`/);
});

test("related services: intentional, valid and limited", () => {
  assert.deepEqual(SERVICE_CATALOG["airport-transportation"].related, [
    "senior-medical-transportation",
    "wheelchair-transportation",
    "medical-appointments",
  ]);
  assert.ok(SERVICE_CATALOG["senior-medical-transportation"].related.includes("airport-transportation"));
  assert.ok(SERVICE_CATALOG["wheelchair-transportation"].related.includes("airport-transportation"));
  for (const slug of SERVICE_ORDER) {
    const related = SERVICE_CATALOG[slug].related;
    assert.ok(related.length >= 2 && related.length <= 3, slug);
    assert.equal(new Set(related).size, related.length, slug);
    assert.ok(!related.includes(slug), slug);
    for (const r of related) assert.ok(SERVICE_CATALOG[r], `${slug} -> ${r}`);
  }
});
