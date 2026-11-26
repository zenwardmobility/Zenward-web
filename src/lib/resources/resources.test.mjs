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
const { sitemapEntries } = await import("../sitemap-entries.ts");
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
  // ZW-SEO-KW-01 Guide 1 (owner-approved REV 2).
  "no-ride-home-from-the-hospital",
];

/** All public text of one Resource: metadata + body. */
function resourceText(resource) {
  const body = RESOURCE_BODIES[resource.slug];
  const parts = [resource.title, resource.description, resource.seoTitle, resource.seoDescription, body.intro, body.bridge?.heading ?? "", body.bridge?.text ?? ""];
  for (const block of body.blocks) {
    if ("text" in block) parts.push(block.text);
    if (block.type === "list") parts.push(...block.items);
    if (block.type === "checklist") for (const item of block.items) parts.push(item.label, item.hint ?? "");
    if (block.type === "faq") for (const item of block.items) parts.push(item.question, item.answer);
    if (block.type === "definitions") for (const item of block.items) parts.push(item.term, item.description);
    if (block.type === "p" && block.link) parts.push(block.link.label);
    if (block.type === "figure") parts.push(block.caption);
    if (block.type === "actions") parts.push(block.requestLabel, block.callLabel);
  }
  for (const item of body.tool ?? []) parts.push(item.label, item.hint ?? "");
  return parts.join("\n");
}

const ctx = {
  marketName: "Metro Atlanta",
  summaries: Object.fromEntries(Object.keys(SERVICE_CATALOG).map((slug) => [slug, "Summary."])),
};

// ---------------------------------------------------------------- catalogue

test("exactly the approved Resources (six launch + KW-01 Guide 1), with unique slugs, paths, titles and descriptions", async () => {
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

test("every Resource has an intro, a bridge (or its own request section) and body content; guides have headings", () => {
  for (const r of RESOURCES) {
    const body = RESOURCE_BODIES[r.slug];
    assert.ok(body.intro.length > 40);
    if (body.bridge) assert.ok(body.bridge.heading && body.bridge.text);
    else assert.ok(body.blocks.some((b) => b.type === "actions"), `${r.slug} needs a bridge or an in-body request section`);
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

  // ZW-SEO-01: the sitemap list lives in lib/sitemap-entries.ts; check the real entries.
  const urls = sitemapEntries("").map((e) => e.url);
  for (const p of ["/resources", ...RESOURCE_PATHS]) assert.ok(urls.includes(p), p);
  assert.ok(!urls.some((u) => /^\/metro-atlanta\//.test(u)), "campaign pages must not be listed");
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

test("R1: owner-approved article (ZENWARD-WEB-SEO-ARTICLE-01): H1, SEO, headings, photo, links and CTA", () => {
  const meta = getResource("what-is-non-emergency-medical-transportation");
  assert.equal(meta.title, "What Is Non-Emergency Medical Transportation? A Guide for Patients and Families");
  assert.equal(`${meta.seoTitle} | Zenward Mobility`, "What Is Non-Emergency Medical Transportation? | Zenward Mobility");
  assert.equal(
    meta.seoDescription,
    "Learn how non-emergency medical transportation works, who needs it, and how Zenward Mobility helps patients and families arrange rides in Metro Atlanta.",
  );
  assert.equal(meta.publishedDate, "2026-10-16", "original publication date preserved");

  const r1 = RESOURCE_BODIES["what-is-non-emergency-medical-transportation"];
  assert.ok(r1.intro.startsWith("Getting to a medical appointment should be straightforward."));
  assert.equal(r1.bridge, undefined, "the approved body ends with its own request section");
  assert.deepEqual(r1.blocks.filter((b) => b.type === "h2").map((b) => b.text), [
    "What Is Non-Emergency Medical Transportation?",
    "Who Can Benefit From NEMT?",
    "What Types of Medical Trips Can Be Arranged?",
    "What Should You Look for in an NEMT Provider?",
    "How Does NEMT Work in the United States?",
    "Non-Emergency Medical Transportation in Metro Atlanta, Georgia",
    "Getting to Care Shouldn't Be Another Worry",
    "Need Medical Transportation in Metro Atlanta?",
  ]);

  // The photo sits after the opening paragraphs, immediately before the first H2.
  const figureAt = r1.blocks.findIndex((b) => b.type === "figure");
  assert.equal(r1.blocks[figureAt + 1].type, "h2");
  assert.ok(r1.blocks.slice(0, figureAt).every((b) => b.type === "p"));
  const figure = r1.blocks[figureAt];
  assert.equal(figure.image, "officialVehicle");
  assert.equal(figure.caption, "Zenward Mobility's branded non-emergency medical transportation vehicle serving Metro Atlanta, Georgia.");
  assert.ok(existsSync(path.join(root, "public/images/zenward-official-nemt-vehicle.webp")));
  const images = read("lib/images.ts");
  assert.match(images, /from "\.\.\/\.\.\/public\/images\/zenward-official-nemt-vehicle\.webp"/);
  assert.match(images, /alt: "White Zenward Mobility non-emergency medical transportation vehicle with company branding"/);

  // In-site links only, to existing routes.
  const text = body("what-is-non-emergency-medical-transportation");
  const links = [...text.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
  assert.deepEqual(links, ["/services", "/locations/metro-atlanta"]);
  assert.ok(existsSync(path.join(src, "app/services/page.tsx")) && existsSync(path.join(src, "app/locations/[market]/page.tsx")));
  assert.ok(!/https?:\/\//.test(text), "no absolute URLs in article copy");

  // Final request section: Request Transportation (the generic quote form) and the business line.
  const actions = r1.blocks.find((b) => b.type === "actions");
  assert.equal(actions.requestLabel, "Request Transportation");
  assert.equal(actions.callLabel, "Call: 678-935-5489");
  assert.equal(requestCtaFor(meta).href, "/request-transportation");
  assert.match(text, /If you're experiencing a medical emergency, call 911\./);
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
  // ZW-SEO-KW-01-DIALYSIS-UPGRADE: approved intro keeps the "for many riders" hedge (not a universal schedule).
  assert.ok(r3.intro.startsWith("For many riders, dialysis means traveling to the same treatment center on a repeating weekly schedule."));
  const text = body("dialysis-transportation-guide");
  assert.ok(text.includes("Treatment end times can vary, so Zenward talks through return-trip timing with you rather than assuming a fixed pickup."));
  assert.ok(!/Session lengths|usually means travel/.test(text));
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
  // ZW-SEO-KW-01: Guide 1 (no-ride-home-from-the-hospital) is the 7th, owner-approved Resource; still no assistance-level Resource.
  assert.equal(RESOURCES.length, 7, "no new Resource for assistance level");
  for (const path of RESOURCE_PATHS) assert.ok(!/curb|door|assistance/.test(path));
});

test("Zenny teaser is suppressed on Resource pages below md; the launcher stays", () => {
  const code = stripComments(read("components/public/assistant/AssistantLauncher.tsx"));
  assert.match(code, /const isResourcePage = \(path: string\) => path === "\/resources" \|\| path\.startsWith\("\/resources\/"\)/);
  assert.match(code, /resourcePage \? "max-md:hidden" : "max-sm:hidden"/);
  // ZW-SEO-GROWTH-03: below sm the teaser is hidden on every page (it covered first-viewport CTAs).
  assert.match(code, /const TEASER_MIN_WIDTH = "\(min-width: 40rem\)";/);
  assert.match(code, /if \(resourcePage && !window\.matchMedia\(TEASER_MIN_WIDTH_ON_RESOURCES\)\.matches\) return;/);
  // The launcher's own classes don't depend on the Resource flag.
  const launcher = code.slice(code.indexOf("ref={launcherRef}"));
  assert.ok(!/resourcePage/.test(launcher.slice(0, launcher.indexOf("</button>"))));
});

// ---------------------------------------------------------------- ZW-SEO-KW-01 Guide 1

test("KW-01 Guide 1: approved metadata, discharge CTA, private-pay position, no unsupported claims, protected pages untouched", async () => {
  const g = getResource("no-ride-home-from-the-hospital");
  assert.equal(g.path, "/resources/no-ride-home-from-the-hospital");
  assert.equal(g.title, "No Ride Home From the Hospital? How to Arrange a Planned Trip Home");
  assert.equal(g.seoTitle, "No Ride Home From the Hospital? What to Do");
  assert.equal(g.seoDescription, "No one to drive you home after a hospital stay? Your options, what to have ready and how to arrange non-emergency transportation in Metro Atlanta.");
  assert.ok(g.seoDescription.length <= 160);
  assert.equal(g.kind, "guide");
  assert.equal(g.relatedServices[0], "hospital-discharge-transportation");
  assert.equal(requestCtaFor(g).href, "/request-transportation?service=hospital_discharge");
  // Owner decision: listed under Helpful resources on the hospital discharge page ONLY.
  assert.deepEqual(g.serviceListing, ["hospital-discharge-transportation"]);
  const { resourcesForService } = await import("./catalog.ts");
  assert.deepEqual(resourcesForService("hospital-discharge-transportation").slice(0, 3).map((r) => r.slug), ["hospital-discharge-transportation-checklist", "no-ride-home-from-the-hospital"]);
  for (const s of ["wheelchair-transportation", "senior-medical-transportation", "medical-appointments", "dialysis-transportation"]) {
    assert.ok(!resourcesForService(s).some((r) => r.slug === g.slug), s);
  }
  const body = RESOURCE_BODIES[g.slug];
  const text = JSON.stringify(body);
  assert.match(text, /Zenward is a private-pay service\. It doesn't bill Medicaid, Medicare or insurance\./);
  assert.match(text, /Pricing is confirmed after Zenward reviews the transportation request and trip details\./);
  assert.match(text, /Availability is confirmed trip by trip/);
  // Release decision: post-procedure policy is unconfirmed. The guide only points to the facility's discharge
  // requirements; it never says such trips are accepted or assessed, nor that drivers act as escorts/responsible adults.
  assert.match(text, /Check these with the care team before you arrange transportation\./);
  assert.match(text, /Check the facility's discharge requirements with the care team before you arrange transportation\. Include any travel restrictions in your request\./);
  assert.ok(!/assessed individually|post-procedure restrictions are|sedation[^"]*(accepted|available|we can|Zenward can)/i.test(text), "no post-procedure policy published");
  assert.equal(g.publishedDate, "2026-11-26");
  assert.equal(g.updatedDate, g.publishedDate);
  assert.match(text, /This is a separate state program: Zenward is a private-pay service and doesn't provide Medicaid-covered rides\./);
  assert.ok(body.blocks.some((b) => b.type === "actions"), "in-article quote CTA");
  // Conversion callout: first block (renders after the intro, before "On this page"); Guide 1 only.
  assert.deepEqual(body.blocks[0], {
    type: "callout",
    heading: "Need help arranging a ride home?",
    text: "Request planned hospital discharge transportation in Metro Atlanta. Availability and pricing are confirmed after we review your trip.",
    requestLabel: "Request a Quote",
    callLabel: "Call 678-935-5489",
  });
  // Callouts only where the owner approved them: Guide 1 and the KW-01 dialysis upgrade.
  const CALLOUT_APPROVED = new Set([g.slug, "dialysis-transportation-guide"]);
  for (const r of RESOURCES) if (!CALLOUT_APPROVED.has(r.slug)) assert.ok(!RESOURCE_BODIES[r.slug].blocks.some((b) => b.type === "callout"), `${r.slug} has no callout`);
  // American English in the new guide.
  assert.ok(!/programme|travell|colour|organis|centre/i.test(text), "American English");
  assert.ok(body.blocks.some((b) => b.type === "definitions"), "canonical assistance-level definitions");
  // No unsupported claims: cities, prices, payment methods, deposits, escort/companion services, chemo, guarantees.
  for (const re of [/\b(Marietta|Roswell|Decatur|Sandy Springs|Alpharetta|Smyrna|Brookhaven|College Park|Fayetteville|East Point|Dunwoody|Peachtree City)\b/,
    /\$\s?\d|per mile|flat rate|deposit/i, /\b(cash|credit card|debit card|zelle|paypal)\b/i, /responsible adult|companion|medical escort/i, /chemo|radiation/i, /guarantee|\bsafe\b/i]) {
    assert.ok(!re.test(text), String(re));
  }
  // GROWTH-02 protected pages are not linked to it, and it does not link to the hub or NEMT guide.
  assert.ok(!/\/locations\/metro-atlanta|how-to-arrange-nemt-in-metro-atlanta/.test(text));
  for (const rel of ["app/page.tsx", "app/locations/[market]/page.tsx"]) assert.ok(!read(rel).includes("no-ride-home-from-the-hospital"), rel);
  assert.ok(!JSON.stringify(RESOURCE_BODIES["how-to-arrange-nemt-in-metro-atlanta"]).includes("no-ride-home-from-the-hospital"));
});

// ---------------------------------------------------------------- ZW-SEO-KW-01-DIALYSIS-UPGRADE

test("Dialysis upgrade: same URL, approved metadata, dialysis CTAs, recurring instructions, claim boundaries", () => {
  const g = getResource("dialysis-transportation-guide");
  assert.equal(g.path, "/resources/dialysis-transportation-guide");
  assert.equal(g.seoTitle, "How to Get Transportation to Dialysis");
  assert.equal(g.seoDescription, "Need a ride to dialysis? How to arrange recurring transportation in Metro Atlanta: options, return trips, schedule changes and how requests are reviewed.");
  assert.equal(g.title, "Need a Ride to Dialysis? How to Arrange Recurring Transportation");
  assert.equal(g.description, "How to arrange recurring rides to dialysis when family can't always drive: transportation options, schedules, return trips and what to include in your request.");
  assert.ok(`${g.seoTitle} | Zenward Mobility`.length <= 70 && g.seoDescription.length <= 160);
  assert.equal(g.publishedDate, "2026-10-16", "original publication date preserved");
  assert.equal(g.kind, "guide");
  assert.equal(requestCtaFor(g).href, "/request-transportation?service=dialysis");
  // Inbound links preserved: listed on the dialysis and recurring-care service pages.
  assert.ok(resourcesForService("dialysis-transportation").some((r) => r.slug === g.slug));
  assert.ok(resourcesForService("recurring-care-transportation").some((r) => r.slug === g.slug));
  const b = RESOURCE_BODIES[g.slug];
  assert.deepEqual(b.blocks[0], {
    type: "callout",
    heading: "Need regular rides to dialysis?",
    text: "Request recurring, private-pay dialysis transportation in Metro Atlanta. Availability and pricing are confirmed after we review your schedule.",
    requestLabel: "Request a Quote",
    callLabel: "Call 678-935-5489",
  });
  assert.ok(b.blocks.some((x) => x.type === "actions") && b.blocks.some((x) => x.type === "definitions"));
  assert.equal(b.bridge.heading, "Need recurring transportation for dialysis?");
  assert.equal(b.bridge.about.href, "/services/dialysis-transportation");
  // GROWTH-02 in-body contextual link to the dialysis service page is preserved.
  assert.ok(b.blocks.some((x) => x.link?.href === "/services/dialysis-transportation" && x.link.label === "Dialysis transportation in Metro Atlanta"));
  const text = JSON.stringify(b);
  assert.match(text, /select Recurring under How often\?/);
  assert.match(text, /A shared driving schedule can work/);
  assert.ok(!/rota/i.test(text));
  assert.match(text, /Zenward is a private-pay service\. It doesn't bill Medicaid, Medicare or insurance\./);
  assert.match(text, /This is a separate state program: Zenward is a private-pay service and doesn't provide Medicaid-covered rides\./);
  // Safeguards: none of the unconfirmed operating claims, no medical monitoring, American English.
  for (const re of [/early[- ]morning|weekend|sunday|\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i, /guarantee|reserved|standing (slot|reservation)/i, /same[- ]day/i, /same driver|same vehicle/i,
    /wait(ing)? (time|fee|included)/i, /cancellation (fee|charge)|no[- ]show (fee|charge)/i, /\b(cash|credit card|debit card|zelle|paypal|weekly billing|per trip)\b/i,
    /\$\s?\d|per mile|flat rate|deposit/i, /\bfree\b|covered by|we accept/i, /power (wheel)?chair|weight limit/i, /programme|travelling|centre\b|colour|organis/i,
    /\b(Marietta|Roswell|Decatur|Sandy Springs|Alpharetta|Smyrna|Brookhaven|College Park|Fayetteville|East Point|Dunwoody|Peachtree City)\b/]) {
    assert.ok(!re.test(text), String(re));
  }
  assert.match(text, /does not provide medical monitoring or care/);
  // Not linked from/to GROWTH-02 protected pages beyond the pre-existing related-resource card.
  assert.ok(!/\/locations\/metro-atlanta/.test(text));
});
