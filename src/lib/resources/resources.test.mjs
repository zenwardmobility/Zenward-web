// ZW-WEB-04K: Resources + organic acquisition foundation. Checks the typed
// catalogue, the article content discipline (no invented claims, no fake
// authors), SEO wiring (sitemap, metadata, schema), the interactive checklist
// (in memory only), service-page links and the Zenny Resource links.
//
//   npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "../..");
const root = path.resolve(src, "..");
const read = (rel) => readFileSync(path.join(src, rel), "utf8");
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

const { RESOURCES, RESOURCE_PATHS, RESOURCE_CATEGORIES, getResource, resourcesForService, requestCtaFor, categoriesOf } = await import("./catalog.ts");
const { RESOURCE_BODIES } = await import("./content.ts");
const { resourceArticleJsonLd } = await import("./schema.ts");
const { SERVICE_CATALOG } = await import("../service-catalog.ts");
const { respond } = await import("../assistant/responses.ts");
const { validateReply, isAllowedHref } = await import("../assistant/safety.ts");

const SLUGS = [
  "what-is-non-emergency-medical-transportation",
  "how-to-arrange-nemt-in-metro-atlanta",
  "dialysis-transportation-guide",
  "wheelchair-accessible-transportation-guide",
  "hospital-discharge-transportation-checklist",
  "medical-transportation-trip-checklist",
];

/** All public text of one Resource: metadata + body. */
function resourceText(resource) {
  const body = RESOURCE_BODIES[resource.slug];
  const parts = [resource.title, resource.description, resource.seoTitle, resource.seoDescription, body.intro, body.bridge.heading, body.bridge.text];
  for (const block of body.blocks) {
    if ("text" in block) parts.push(block.text);
    if (block.type === "list") parts.push(...block.items);
    if (block.type === "checklist") for (const item of block.items) parts.push(item.label, item.hint ?? "");
    if (block.type === "faq") for (const item of block.items) parts.push(item.question, item.answer);
    if (block.type === "definitions") for (const item of block.items) parts.push(item.term, item.description);
    if (block.type === "p" && block.link) parts.push(block.link.label);
  }
  for (const item of body.tool ?? []) parts.push(item.label, item.hint ?? "");
  return parts.join("\n");
}

const ctx = {
  marketName: "Metro Atlanta",
  summaries: Object.fromEntries(Object.keys(SERVICE_CATALOG).map((slug) => [slug, "Summary."])),
};

// ---------------------------------------------------------------- catalogue

test("exactly the six launch Resources, with unique slugs, paths, titles and descriptions", async () => {
  assert.deepEqual([...RESOURCES.map((r) => r.slug)].sort(), [...SLUGS].sort());
  for (const key of ["slug", "path", "title", "description", "seoTitle", "seoDescription"]) {
    const values = RESOURCES.map((r) => r[key]);
    assert.equal(new Set(values).size, values.length, `duplicate ${key}`);
  }
  for (const r of RESOURCES) {
    assert.equal(r.path, `/resources/${r.slug}`);
    assert.match(r.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.ok(r.seoDescription.length >= 70 && r.seoDescription.length <= 160, `${r.slug} description length ${r.seoDescription.length}`);
    assert.ok(!/zenward mobility/i.test(r.seoTitle), "the layout template appends the brand");
    assert.ok(`${r.seoTitle} | Zenward Mobility`.length <= 70, `${r.slug} title too long`);
    assert.ok(RESOURCE_CATEGORIES[r.category]);
    assert.ok(RESOURCE_BODIES[r.slug], `${r.slug} has content`);
  }
  assert.deepEqual(RESOURCE_PATHS, RESOURCES.map((r) => r.path));
  const { RESOURCE_SLUGS, resourcePath } = await import("./slugs.ts");
  assert.deepEqual([...RESOURCE_SLUGS].sort(), [...SLUGS].sort());
  for (const r of RESOURCES) assert.equal(resourcePath(r.slug), r.path);
});

test("the featured guide is how to arrange NEMT, and each hub section has Resources", () => {
  const featured = RESOURCES.filter((r) => r.featured);
  assert.deepEqual(featured.map((r) => r.slug), ["how-to-arrange-nemt-in-metro-atlanta"]);
  for (const category of Object.keys(RESOURCE_CATEGORIES)) {
    assert.ok(RESOURCES.some((r) => r.category === category && !r.featured), `${category} is empty`);
  }
  assert.equal(getResource("medical-transportation-trip-checklist").category, "tools");
  assert.equal(getResource("nope"), undefined);
});

test("dates are valid ISO dates, not in the future, and updated >= published", () => {
  for (const r of RESOURCES) {
    for (const date of [r.publishedDate, r.updatedDate]) {
      assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(!Number.isNaN(Date.parse(date)));
    }
    assert.ok(r.updatedDate >= r.publishedDate);
  }
});

test("related services and related Resources resolve; 2–3 related Resources each", () => {
  for (const r of RESOURCES) {
    assert.ok(r.relatedServices.length >= 1);
    for (const slug of r.relatedServices) assert.ok(SERVICE_CATALOG[slug], `${r.slug} -> ${slug}`);
    assert.ok(r.relatedResources.length >= 2 && r.relatedResources.length <= 3, `${r.slug} related count`);
    for (const slug of r.relatedResources) {
      assert.ok(getResource(slug), `${r.slug} -> ${slug}`);
      assert.notEqual(slug, r.slug);
    }
  }
});

test("Resource CTAs: service guides preselect their service; R1, R2 and the tool use the generic quote form", () => {
  const expected = {
    "dialysis-transportation-guide": "/request-transportation?service=dialysis",
    "wheelchair-accessible-transportation-guide": "/request-transportation?service=wheelchair_transportation",
    "hospital-discharge-transportation-checklist": "/request-transportation?service=hospital_discharge",
    // Owner decision: no Medical Appointment preselection on the general guides.
    "what-is-non-emergency-medical-transportation": "/request-transportation",
    "how-to-arrange-nemt-in-metro-atlanta": "/request-transportation",
    "medical-transportation-trip-checklist": "/request-transportation",
  };
  for (const [slug, href] of Object.entries(expected)) assert.equal(requestCtaFor(getResource(slug)).href, href, slug);
  for (const slug of ["what-is-non-emergency-medical-transportation", "how-to-arrange-nemt-in-metro-atlanta"]) {
    const cta = requestCtaFor(getResource(slug));
    assert.equal(cta.label, "Request a Quote");
    assert.ok(!/medical_appointment|Medical Appointment/.test(JSON.stringify(cta)), slug);
  }
  for (const r of RESOURCES) assert.ok(isAllowedHref(requestCtaFor(r).href));
  const page = stripComments(read("components/public/resources/ResourcePage.tsx"));
  assert.match(page, /requestHref=\{cta\.href\}/);
  assert.match(page, /<TrackedLinkButton href=\{cta\.href\}/);
  assert.ok(!/primaryServiceFor|service\.requestHref/.test(page), "the page must use requestCtaFor");
  assert.match(page, /source: "resource_page"/);
});

// ---------------------------------------------------------------- content discipline

test("every Resource has an intro, a bridge and body content; guides have headings", () => {
  for (const r of RESOURCES) {
    const body = RESOURCE_BODIES[r.slug];
    assert.ok(body.intro.length > 40);
    assert.ok(body.bridge.heading && body.bridge.text);
    assert.ok(body.blocks.length >= (r.kind === "tool" ? 1 : 3), `${r.slug} block count`);
    if (r.kind !== "tool") assert.ok(body.blocks.some((b) => b.type === "h2"));
    const ids = body.blocks.filter((b) => b.type === "h2").map((b) => b.id);
    assert.equal(new Set(ids).size, ids.length, `${r.slug} duplicate heading ids`);
  }
  assert.equal(RESOURCE_BODIES["dialysis-transportation-guide"].bridge.heading, "Need recurring transportation for dialysis?");
});

test("no invented claims in Resource content", () => {
  const banned = [
    /\bguarantee/i,
    /\b100\s?%/,
    /\b24\s*\/\s*7\b|\baround the clock\b|\b24 hours a day\b/i,
    /\bsame[- ]day (service|rides?|transportation) (is )?(available|guaranteed)\b/i,
    /\bwe (accept|take|bill) (medicaid|medicare|insurance)\b/i,
    /\bcovered by (medicaid|medicare|insurance)\b/i,
    /\bCPR\b|\bADA[- ](compliant|certified)\b|\bcertified\b|\bdrug[- ]test/i,
    /\b\d+\+? (years|vehicles|vans|drivers|trips|rides|clients|patients)\b/i,
    /\b(5|five)[- ]star\b|\b(customer|client|google|online) reviews?\b|\btestimonial|\brated \d/i,
    /\$\s?\d/,
    /\b(open|available) (from )?\d{1,2}(:\d{2})?\s?(am|pm)\b/i,
    /\b(lift|ramp) capacity\b|\bweight limit\b|\b\d+\s?(lb|lbs|pounds)\b/i,
    /\bfree\b/i,
    /\b(dr|nurse|rn|md)\.? [A-Z][a-z]+/,
    /\bmedically reviewed\b|\breviewed by\b|\bwritten by\b/i,
  ];
  for (const r of RESOURCES) {
    const text = resourceText(r);
    for (const re of banned) assert.ok(!re.test(text), `${r.slug} matches ${re}`);
  }
});

test("no medical advice wording, and the emergency boundary is stated", () => {
  const text = RESOURCES.map(resourceText).join("\n");
  assert.ok(!/\byou should (take|stop|start) (your )?medication/i.test(text));
  assert.ok(!/\bdosage\b|\bdiagnos(e|es|ed|is)\b/i.test(text));
  assert.match(text, /call 911/i);
});

test("attribution: published by Zenward Mobility with dates; no fake authors or reviewers", () => {
  const page = stripComments(read("components/public/resources/ResourcePage.tsx"));
  assert.match(page, /Published by \{siteName\}/);
  assert.match(page, /<time dateTime=\{resource\.publishedDate\}>/);
  assert.match(page, /<time dateTime=\{resource\.updatedDate\}>/);
  for (const file of ["components/public/resources/ResourcePage.tsx", "lib/resources/catalog.ts", "lib/resources/content.ts"]) {
    const code = stripComments(read(file));
    assert.ok(!/\bauthor\b|\breviewedBy\b|\bmedicallyReviewed\b/i.test(code), `${file} names an author/reviewer`);
  }
  // The schema's only author is the Organization (see the Article schema test); never a Person or reviewer.
  const schema = stripComments(read("lib/resources/schema.ts"));
  assert.ok(!/"Person"|reviewedBy|medicallyReviewed/.test(schema));
});

// ---------------------------------------------------------------- SEO

test("Article schema for guides is truthful; the tool gets breadcrumbs only", () => {
  for (const r of RESOURCES.filter((x) => x.kind !== "tool")) {
    const ld = resourceArticleJsonLd(r);
    assert.equal(ld["@type"], "Article");
    assert.equal(ld.headline, r.title);
    assert.equal(ld.datePublished, r.publishedDate);
    assert.equal(ld.dateModified, r.updatedDate);
    assert.equal(ld.publisher.name, "Zenward Mobility");
    // Owner decision: a truthful Organization author, never an invented individual.
    assert.deepEqual(ld.author, { "@type": "Organization", name: "Zenward Mobility", url: ld.publisher.url });
    assert.ok(!("aggregateRating" in ld) && !("review" in ld) && !("reviewedBy" in ld));
    assert.match(ld.mainEntityOfPage["@id"] ?? ld.mainEntityOfPage, /\/resources\//);
  }
  const page = stripComments(read("components/public/resources/ResourcePage.tsx"));
  assert.match(page, /resource\.kind === "tool" \? \[breadcrumbJsonLd\(crumbs\)\]/);
});

test("hub and Resource pages are indexable and self-canonical; in the sitemap; campaigns stay out", () => {
  const detail = stripComments(read("app/resources/[slug]/page.tsx"));
  assert.match(detail, /dynamicParams = false/);
  assert.match(detail, /path: resource\.path/);
  assert.ok(!/robots|noindex/.test(detail));
  const hub = stripComments(read("app/resources/page.tsx"));
  assert.match(hub, /path: "\/resources"/);
  assert.ok(!/robots|noindex/.test(hub));
  assert.match(hub, /Practical guidance for planning medical transportation/);
  assert.match(hub, /title: "Medical Transportation Resources & Guides"/);
  for (const heading of ["Featured guide", "riders-families", "providers", "tools"]) assert.ok(hub.includes(heading));

  const sitemap = stripComments(read("app/sitemap.ts"));
  assert.match(sitemap, /"\/resources",\s*\.\.\.RESOURCE_PATHS/);
  assert.ok(!/campaign|metro-atlanta\//.test(sitemap), "campaign pages must not be listed");
});

test("Resources is in the header and footer navigation, labelled Resources (not Blog)", () => {
  for (const file of ["components/public/PublicHeader.tsx", "components/public/PublicFooter.tsx"]) {
    const code = read(file);
    assert.match(code, /\{ label: "Resources", href: "\/resources" \}/);
    assert.ok(!/label: "Blog"/.test(code));
  }
});

test("no city pages, CMS, MDX, database or AI dependencies for Resources", () => {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
  for (const dep of deps) assert.ok(!/mdx|contentful|sanity|strapi|prismic|contentlayer|openai|anthropic|langchain|algolia|fuse\.js|lunr/i.test(dep), dep);
  assert.ok(!existsSync(path.join(src, "app/resources/[slug]/[city]")));
  for (const r of RESOURCES) assert.ok(!/(marietta|decatur|sandy-springs|roswell|alpharetta|county)/.test(r.slug));
});

// ---------------------------------------------------------------- checklist tool

test("trip checklist is in memory only: no storage, no network, prints via the browser", () => {
  const code = stripComments(read("components/public/resources/TripChecklist.tsx"));
  assert.match(code, /^"use client";/);
  assert.match(code, /useState/);
  assert.match(code, /window\.print\(\)/);
  assert.ok(!/localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon|navigator\.|use server|track\(/.test(code));
  const tool = RESOURCE_BODIES["medical-transportation-trip-checklist"].tool;
  assert.ok(tool.length >= 8);
  assert.equal(RESOURCE_BODIES["medical-transportation-trip-checklist"].bridge.heading, "Ready to request transportation?");
});

test("print stylesheet hides site chrome, Zenny and CTAs; keeps attribution", () => {
  const css = read("app/globals.css");
  assert.match(css, /@media print\s*\{[\s\S]*\[data-print-hide\][\s\S]*display: none !important/);
  const layout = read("components/layout/PublicLayout.tsx");
  assert.equal((layout.match(/data-print-hide/g) ?? []).length, 3);
  assert.match(layout, /<div data-print-hide className="contents">\s*<PublicFooter \/>[\s\S]*<AssistantLauncher/);
  const page = read("components/public/resources/ResourcePage.tsx");
  assert.match(page, /<div className="print:hidden">\s*<ClosingCta/);
  assert.match(page, /aria-labelledby="bridge-heading" className="[^"]*print:hidden/);
  assert.match(page, /hidden text-text-secondary print:block/);
});

// ---------------------------------------------------------------- service pages

test("service pages link Helpful resources from the catalogue", () => {
  assert.deepEqual(resourcesForService("dialysis-transportation").map((r) => r.slug), ["dialysis-transportation-guide"]);
  assert.equal(resourcesForService("wheelchair-transportation")[0].slug, "wheelchair-accessible-transportation-guide");
  assert.ok(resourcesForService("hospital-discharge-transportation").some((r) => r.slug === "hospital-discharge-transportation-checklist"));
  assert.ok(resourcesForService("medical-appointments").length >= 2);
  assert.equal(resourcesForService("airport-transportation").length, 0);
  const page = read("components/public/ServicePage.tsx");
  assert.match(page, /Helpful resources/);
  assert.match(page, /resourcesForService\(service\.slug\)/);
});

// ---------------------------------------------------------------- Zenny

const ask = (text) => respond({ kind: "text", text }, ctx);
const hrefs = (reply) => reply.actions.filter((a) => a.kind === "link").map((a) => a.href);

test("Zenny: dialysis question links the dialysis guide and Request Dialysis", () => {
  const r = ask("How does dialysis transportation work?");
  assert.deepEqual(validateReply(r), []);
  assert.ok(hrefs(r).includes("/resources/dialysis-transportation-guide"));
  assert.ok(hrefs(r).includes("/request-transportation?service=dialysis"));
});

test("Zenny: preparing for a ride links the trip checklist", () => {
  const r = ask("What should I prepare for a medical ride?");
  assert.deepEqual(validateReply(r), []);
  assert.equal(r.kind, "resource");
  assert.equal(r.actions[0].href, "/resources/medical-transportation-trip-checklist");
});

test("Zenny: a discharge links the discharge checklist and Request Hospital Discharge", () => {
  for (const q of ["My mother is being discharged", "checklist for hospital discharge"]) {
    const r = ask(q);
    assert.deepEqual(validateReply(r), []);
    assert.ok(hrefs(r).includes("/resources/hospital-discharge-transportation-checklist"), q);
    assert.ok(hrefs(r).includes("/request-transportation?service=hospital_discharge"), q);
  }
});

test("Zenny: what is NEMT links the explainer; Resource links are canonical", () => {
  const r = ask("What is non-emergency medical transportation?");
  assert.deepEqual(validateReply(r), []);
  assert.ok(hrefs(r).includes("/resources/what-is-non-emergency-medical-transportation"));
  for (const p of RESOURCE_PATHS) assert.ok(isAllowedHref(p));
  assert.ok(!isAllowedHref("/resources/not-a-resource"));
  assert.ok(!isAllowedHref("/resources/dialysis-transportation-guide?utm=x"));
  assert.ok(!isAllowedHref("/resources/dialysis-transportation-guide#checklist"));
});

test("Zenny bundle never imports article content", () => {
  for (const file of ["lib/assistant/responses.ts", "lib/assistant/safety.ts", "lib/assistant/knowledge.ts", "lib/assistant/intents.ts"]) {
    assert.ok(!/resources\/content/.test(read(file)), file);
  }
  const catalog = stripComments(read("lib/resources/catalog.ts"));
  assert.ok(!/from "\.\/content/.test(catalog));
  // The assistant links by slug only: never the catalogue (titles/descriptions) or the content.
  for (const file of ["lib/assistant/responses.ts", "lib/assistant/safety.ts"]) {
    assert.ok(!/resources\/catalog/.test(read(file)), file);
  }
});

// ---------------------------------------------------------------- owner content refinement (04K final)

const body = (slug) => resourceText(getResource(slug));

test("R1: owner definition, driver wording and simplified ambulance boundary", () => {
  const r1 = RESOURCE_BODIES["what-is-non-emergency-medical-transportation"];
  assert.equal(
    r1.intro,
    "Non-emergency medical transportation, often called NEMT, is pre-arranged transportation to or from medical care for people who do not need emergency medical transport.",
  );
  const text = body("what-is-non-emergency-medical-transportation");
  assert.ok(text.includes("People who cannot drive themselves or need another transportation option for a medical appointment"));
  assert.ok(!/shouldn't drive/.test(text));
  assert.ok(text.includes("NEMT is not emergency medical transportation. If someone needs emergency medical care, call 911. Zenward does not provide ambulance or stretcher transportation."));
  assert.ok(!/medical care during the journey|well enough to travel/.test(text), "ambulance use cases are no longer defined");
});

test("R2: six steps kept, plus Common questions answered from confirmed facts", async () => {
  const { CONFIRMED, factAnswer } = await import("../operating-facts.ts");
  const r2 = RESOURCE_BODIES["how-to-arrange-nemt-in-metro-atlanta"];
  const steps = r2.blocks.filter((b) => b.type === "h2" && /^\d\. /.test(b.text));
  assert.equal(steps.length, 6);
  assert.ok(r2.blocks.some((b) => b.type === "h2" && b.text === "Common questions"));
  const faq = r2.blocks.find((b) => b.type === "faq");
  assert.deepEqual(faq.items.map((i) => i.question), [
    "How far ahead should I request transportation?",
    "Can I arrange transportation for a family member?",
    "What if I don't know the return time yet?",
  ]);
  assert.equal(faq.items[0].answer, factAnswer("advanceNotice"));
  assert.equal(faq.items[2].answer, CONFIRMED.returnTrip);
  assert.ok(!/\b\d+ (hours?|days?) (in advance|ahead)\b/i.test(faq.items.map((i) => i.answer).join(" ")), "no invented notice period");
  const page = read("components/public/resources/ResourcePage.tsx");
  assert.match(page, /case "faq":[\s\S]*<dl/);
});

test("R3: dialysis wording is transportation-focused, not a universal treatment schedule", () => {
  const r3 = RESOURCE_BODIES["dialysis-transportation-guide"];
  assert.equal(
    r3.intro,
    "For many riders, dialysis transportation follows a repeating weekly schedule. Planning those trips together can make transportation easier to coordinate for the rider and family.",
  );
  const text = body("dialysis-transportation-guide");
  assert.ok(text.includes("Return pickup times may vary, so the return arrangement should be confirmed rather than assumed."));
  assert.ok(!/Session lengths|usually means travelling/.test(text));
  assert.equal(r3.bridge.heading, "Need recurring transportation for dialysis?");
});

test("R4: no wording implying physical transfer assistance; all four canonical assistance levels (04G3)", async () => {
  const { ASSISTANCE_LEVELS, ASSISTANCE_REVIEW_NOTE } = await import("../assistance-level.ts");
  const text = body("wheelchair-accessible-transportation-guide");
  assert.ok(!/stand or take a few steps|\btransfers?\b|\blifting\b|\blift(s)? (the |a )?(passenger|rider|person)\b|\bcarry|\bcarrying\b|\bstairs? carr|\boxygen\b|\bstretcher\b/i.test(text));
  assert.ok(!/help beyond getting into the vehicle/.test(text));
  const r4 = RESOURCE_BODIES["wheelchair-accessible-transportation-guide"];
  assert.ok(r4.blocks.some((b) => b.type === "h2" && b.id === "assistance-level" && b.text === "Choose the assistance level that fits the trip"));
  const defs = r4.blocks.find((b) => b.type === "definitions");
  // Exactly the canonical labels and descriptions, in order: never a second copy of the wording.
  assert.deepEqual(defs.items, ASSISTANCE_LEVELS.map((l) => ({ term: l.label, description: l.description })));
  assert.ok(text.includes(ASSISTANCE_REVIEW_NOTE));
});

test("R5: one URL listed under both Riders & Families and Healthcare Providers; simplified timing; boundary kept", () => {
  const r5 = getResource("hospital-discharge-transportation-checklist");
  assert.deepEqual(categoriesOf(r5), ["providers", "riders-families"]);
  assert.equal(RESOURCES.filter((r) => r.slug === r5.slug).length, 1, "never duplicated");
  assert.equal(new Set(RESOURCE_PATHS).size, RESOURCE_PATHS.length);
  const text = body("hospital-discharge-transportation-checklist");
  assert.ok(text.includes("Hospital discharge times can change during the day. Share the best estimate available and update the transportation provider if the expected time changes."));
  assert.ok(!/final checks and paperwork/.test(text));
  assert.match(text, /ambulance or stretcher transport, arrange that separately/);
  const hub = read("app/resources/page.tsx");
  assert.match(hub, /categoriesOf\(resource\)\.includes\(category\)/);
  assert.match(hub, /<ResourceCard resource=\{resource\} category=\{category\} \/>/);
});

test("R6: arrival-time wording; Pickup & assistance level and Transportation type items (04G3)", () => {
  const tool = RESOURCE_BODIES["medical-transportation-trip-checklist"].tool;
  assert.ok(tool.some((i) => i.label === "Appointment or required arrival time"));
  assert.ok(!tool.some((i) => /event time/i.test(i.label)));
  const level = tool.find((i) => i.label === "Pickup & assistance level");
  assert.equal(level.hint, "Curb-to-curb, door-to-door, door-through-door, or not sure");
  const type = tool.find((i) => i.label === "Transportation type");
  assert.ok(type && type.hint.length <= 80, "a concise hint, not all eight service labels");
  assert.equal(new Set(tool.map((i) => i.label)).size, tool.length);
});

test("R2 step 4 links to the assistance-level definitions; no assistance-level Resource or URL", () => {
  const r2 = RESOURCE_BODIES["how-to-arrange-nemt-in-metro-atlanta"];
  const i = r2.blocks.findIndex((b) => b.type === "h2" && b.id === "mobility");
  const step4 = r2.blocks.slice(i + 1, r2.blocks.findIndex((b, j) => j > i && b.type === "h2"));
  const linked = step4.find((b) => b.type === "p" && b.link);
  assert.equal(linked.link.href, "/resources/wheelchair-accessible-transportation-guide#assistance-level");
  assert.match(linked.text, /pickup & assistance level/);
  assert.equal(RESOURCES.length, 6, "no new Resource for assistance level");
  for (const path of RESOURCE_PATHS) assert.ok(!/curb|door|assistance/.test(path));
});

test("Zenny teaser is suppressed on Resource pages below md; the launcher stays", () => {
  const code = stripComments(read("components/public/assistant/AssistantLauncher.tsx"));
  assert.match(code, /const isResourcePage = \(path: string\) => path === "\/resources" \|\| path\.startsWith\("\/resources\/"\)/);
  assert.match(code, /resourcePage && "max-md:hidden"/);
  assert.match(code, /if \(resourcePage && !window\.matchMedia\(TEASER_MIN_WIDTH_ON_RESOURCES\)\.matches\) return;/);
  // The launcher's own classes don't depend on the Resource flag.
  const launcher = code.slice(code.indexOf("ref={launcherRef}"));
  assert.ok(!/resourcePage/.test(launcher.slice(0, launcher.indexOf("</button>"))));
});
