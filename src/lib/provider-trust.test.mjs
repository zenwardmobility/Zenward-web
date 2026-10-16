// ZW-WEB-04L: provider conversion, trust proof, local SEO and policy
// alignment. Provider CTAs and the request-vs-enquiry split, canonical trust
// facts, truthful Organization schema, Metro Atlanta positioning without
// doorway pages, metadata, indexing, Privacy/Terms against current behaviour,
// no Google tracking, no fake social proof, and Zenny provider/trust answers.
//
//   npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "..");
const root = path.resolve(src, "..");
const read = (rel) => readFileSync(path.join(src, rel), "utf8");
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

const P = await import("./providers.ts");
const { OPERATING_STANDARDS, PROVIDER_TRUST_ORDER, QUOTE_RESPONSE_LINE } = await import("./trust.ts");
const { organizationJsonLd, organizationRef, ORGANIZATION_ID } = await import("./organization.ts");
const { ASSISTANCE_LEVEL_LABEL } = await import("./assistance-level.ts");
const { getActiveMarkets } = await import("./service-area.ts");
const { business } = await import("./business.ts");
const { respond } = await import("./assistant/responses.ts");
const { validateReply } = await import("./assistant/safety.ts");
const { SERVICE_CATALOG } = await import("./service-catalog.ts");
const { RESOURCES } = await import("./resources/catalog.ts");

const PROVIDER_PAGE = "app/healthcare-providers/page.tsx";

/** Every public-copy source file (pages, public components, copy modules). */
function publicFiles() {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(tsx|ts)$/.test(name) && !/\.test\./.test(name)) out.push(full);
    }
  };
  walk(path.join(src, "app"));
  walk(path.join(src, "components/public"));
  for (const rel of ["lib/trust.ts", "lib/services.ts", "lib/providers.ts", "lib/operating-facts.ts", "lib/campaigns.ts", "lib/resources/content.ts", "lib/assistance-level.ts", "lib/quote-form/success.ts", "lib/organization.ts"]) {
    out.push(path.join(src, rel));
  }
  return out.map((f) => ({ file: path.relative(src, f), text: stripComments(readFileSync(f, "utf8")) }));
}

// ================================================================ provider page

test("provider page: Request Transportation (primary) and Call Zenward, top and bottom; enquiry -> /contact", () => {
  const page = stripComments(read(PROVIDER_PAGE));
  assert.equal(P.PROVIDER_REQUEST_HREF, "/request-transportation");
  assert.equal(P.PROVIDER_ENQUIRY_HREF, "/contact");
  // Hero + bottom CTA: the request form, never ?service= with patient data.
  assert.equal((page.match(/href=\{PROVIDER_REQUEST_HREF\}/g) ?? []).length, 2);
  assert.equal((page.match(/event=\{\{ name: "request_transportation_clicked", source: "provider_page" \}\}/g) ?? []).length, 2);
  assert.equal((page.match(/<CallButton surface="provider_page" onDark/g) ?? []).length, 2);
  assert.match(page, /label=\{`Call Zenward \$\{business\.phoneDisplay\}`\}/);
  // General enquiries go to /contact, once, as a secondary text link.
  assert.equal((page.match(/href=\{PROVIDER_ENQUIRY_HREF\}/g) ?? []).length, 1);
  assert.ok(!/href="\/contact"/.test(page));
  assert.ok(!/<form|ContactForm|RequestTransportationForm/.test(page), "no second intake form");
  assert.match(page, /\{QUOTE_RESPONSE_LINE\}/);
});

test("provider page answers who / what trips / what to have ready / how it works / response / how to talk", () => {
  const page = stripComments(read(PROVIDER_PAGE));
  for (const heading of ["Who this is for", "Trips Zenward can help coordinate", "What to have ready", "How requests work", "How Zenward operates", "Questions from care teams", "Arranging transportation for a patient?"]) {
    assert.ok(page.includes(heading), heading);
  }
  assert.equal(P.PROVIDER_HEADLINE("Metro Atlanta"), "Healthcare transportation coordination for Metro Atlanta");
  assert.deepEqual([...P.PROVIDER_AUDIENCES], ["Care coordinators", "Discharge planners", "Clinics", "Dialysis and treatment centers", "Rehabilitation teams", "Senior-care teams"]);
  // Medical services central; airport secondary.
  assert.match(page, /SERVICE_ORDER\.filter\(\(slug\) => slug !== "airport-transportation"\)/);
  assert.match(page, /Also available:/);
  // Recurring + discharge scenarios, with the discharge checklist.
  assert.match(page, /PROVIDER_SCENARIOS\.recurring/);
  assert.match(page, /PROVIDER_SCENARIOS\.discharge/);
  assert.equal(P.DISCHARGE_CHECKLIST_HREF, "/resources/hospital-discharge-transportation-checklist");
  assert.ok(RESOURCES.some((r) => r.path === P.DISCHARGE_CHECKLIST_HREF));
  assert.match(page, /href=\{DISCHARGE_CHECKLIST_HREF\}/);
  for (const slug of ["recurring-care-transportation", "hospital-discharge-transportation"]) {
    assert.match(page, new RegExp(`SERVICE_CATALOG\\["${slug}"\\]\\.path`));
  }
});

test("what to have ready: operational details only, including assistance level; no medical data", () => {
  const labels = P.PROVIDER_READY_ITEMS.map((i) => i.label);
  for (const label of ["Passenger name", "Requester and contact details", "Pickup and destination", "Trip date and timing", "Return trip", "Transportation type", ASSISTANCE_LEVEL_LABEL, "Mobility and access", "Recurring schedule"]) {
    assert.ok(labels.includes(label), label);
  }
  const text = JSON.stringify(P.PROVIDER_READY_ITEMS);
  assert.ok(!/diagnos|medical record|medication|insurance|member id|date of birth|DOB|condition/i.test(text));
  assert.match(P.PROVIDER_NO_MEDICAL_DETAILS, /aren't needed to arrange transportation/);
});

test("how requests work: the real workflow, canonical 2-hour line, not automated scheduling", () => {
  assert.deepEqual(P.PROVIDER_STEPS.map((s) => s.title), [
    "Send the transportation details", "Zenward reviews the request", "Zenward follows up", "Transportation is confirmed",
  ]);
  assert.equal(P.PROVIDER_STEPS[2].text, QUOTE_RESPONSE_LINE);
  assert.match(P.PROVIDER_STEPS[3].text, /only after Zenward confirms/);
  assert.match(P.PROVIDER_NOT_AUTOMATED, /not scheduled automatically/);
  assert.match(P.PROVIDER_ROUTES.enquiry, /not a specific trip/);
  assert.match(P.PROVIDER_ROUTES.enquiry, /don't include patient or trip details/);
});

test("trust facts come from the canonical source; wheelchair standard added; no unsupported wording", () => {
  assert.deepEqual(PROVIDER_TRUST_ORDER, ["licensed", "drivers", "punctuality", "wheelchair", "care", "communication"]);
  for (const key of PROVIDER_TRUST_ORDER) assert.ok(OPERATING_STANDARDS[key], key);
  assert.match(OPERATING_STANDARDS.drivers.description, /background checks/);
  assert.match(OPERATING_STANDARDS.punctuality.description, /operating standard/);
  assert.match(OPERATING_STANDARDS.wheelchair.description, /reviews the passenger's mobility needs before confirming/);
  const page = stripComments(read(PROVIDER_PAGE));
  assert.match(page, /PROVIDER_TRUST_ORDER\.map/);
  // Provider copy may not restate trust facts in its own words.
  const copy = JSON.stringify(P) + page;
  assert.ok(!/licen[cs]ed|background check|vetted|on[- ]time/i.test(stripComments(read("lib/providers.ts"))));
  assert.ok(!/always on time|guarantee|100\s?%|certified|top[- ]rated|industry[- ]leading|most trusted|premium|\bthe best\b|\bbest (nemt|provider|transportation|service|care)\b/i.test(copy));
});

test("no invented provider relationships: contracts, partnerships, integrations, logos, referrals, dedicated contacts", () => {
  const files = [PROVIDER_PAGE, "lib/providers.ts", "app/page.tsx", "app/about/page.tsx", "app/locations/[market]/page.tsx", "lib/assistant/responses.ts"];
  for (const file of files) {
    const text = stripComments(read(file));
    assert.ok(!/one point of contact|consistent (coordination )?contact|dedicated (contact|account|coordinator)|account manager/i.test(text), `${file}: dedicated contact`);
    assert.ok(!/\bpartner(s|ship|ed)?\b|\bcontract(s|ed)?\b|\bintegrat(ion|ed|es)\b|\bportal\b|\bEHR\b|referral agreement|trusted by|logo wall/i.test(text), `${file}: relationship claim`);
    assert.ok(!/\b(who|you|that) refer( them)?\b|patients you refer|providers who refer/i.test(text), `${file}: referral wording`);
    assert.ok(!/if anything changes|expanding service availability|transport isn't what delays/i.test(text), `${file}: unconfirmed commitment`);
  }
  assert.ok(!existsSync(path.join(root, "public/images/partners")) && !existsSync(path.join(root, "public/logos")));
});

// ================================================================ contact page

test("contact page separates a trip request from a general enquiry; contact form warns off trip details", () => {
  const page = stripComments(read("app/contact/page.tsx"));
  assert.match(page, /Arranging a specific trip\?/);
  assert.match(page, /href="\/request-transportation"[\s\S]*?source: "contact_page"/);
  assert.match(page, /A general question\?/);
  assert.match(page, /Please don&rsquo;t include passenger or trip details in a message\./);
  assert.match(page, /id="contact-form"/);
  const form = stripComments(read("components/public/ContactForm.tsx"));
  assert.match(form, /helpText="For general questions only\. Please don't include passenger names, addresses, trip details or medical information here\."/);
  assert.match(form, /Healthcare provider or facility enquiry/);
  // The contact form still has no trip fields.
  assert.ok(!/pickup|destination|passengerName|preferredDate|assistanceLevel/i.test(form.replace(/helpText="[^"]*"/g, "")));
});

// ================================================================ structured data + local SEO

test("Organization schema: one central source, truthful fields only", () => {
  const ld = organizationJsonLd();
  assert.equal(ld["@type"], "Organization", "not LocalBusiness (no address/hours)");
  assert.equal(ld.name, "Zenward Mobility");
  assert.equal(ld.slogan, "Care that gets you there.");
  assert.equal(ld.telephone, "+16789355489");
  assert.equal(ld.contactPoint.telephone, business.phoneHref.replace("tel:", ""));
  assert.deepEqual(ld.areaServed, { "@type": "Place", name: "Metro Atlanta", containedInPlace: { "@type": "State", name: "Georgia" } });
  assert.deepEqual(Object.keys(ld).sort(), ["@context", "@id", "@type", "areaServed", "contactPoint", "description", "logo", "name", "slogan", "telephone", "url"]);
  const json = JSON.stringify(ld);
  for (const banned of ["address", "geo", "openingHours", "aggregateRating", "review", "priceRange", "foundingDate", "numberOfEmployees", "sameAs", "award", "hasCredential"]) {
    assert.ok(!json.includes(`"${banned}`), banned);
  }
  assert.equal(organizationRef()["@id"], ORGANIZATION_ID);
  // Used by the homepage and referenced (not restated) by Service schema.
  assert.match(read("app/page.tsx"), /const homeJsonLd = organizationJsonLd\(\);/);
  assert.ok(!/"@type": "Organization"/.test(stripComments(read("app/page.tsx"))), "no inline Organization on the homepage");
  assert.match(read("lib/service-pages.ts"), /provider: organizationRef\(\)/);
  assert.match(read("app/locations/[market]/page.tsx"), /provider: organizationRef\(\)/);
});

test("no schema anywhere invents address, hours, ratings, reviews or prices", () => {
  for (const { file, text } of publicFiles()) {
    assert.ok(!/aggregateRating|ratingValue|reviewCount|"@type": "Review"|openingHours|priceRange|streetAddress|postalCode|"geo"|"@type": "LocalBusiness"|foundingDate|numberOfEmployees/.test(text), file);
  }
});

test("Metro Atlanta positioning without doorway pages", () => {
  assert.deepEqual(getActiveMarkets().map((m) => m.slug), ["metro-atlanta"]);
  const hub = stripComments(read("app/locations/[market]/page.tsx"));
  assert.match(hub, /export const dynamicParams = false;/);
  assert.match(hub, /getActiveMarkets\(\)\.map/);
  // The hub covers providers, assistance levels, resources and the request path.
  assert.match(hub, /href="\/request-transportation"[\s\S]*?source: "market_page"/);
  assert.match(hub, /ASSISTANCE_LEVELS\.map/);
  assert.match(hub, /href="\/resources"/);
  assert.match(read(PROVIDER_PAGE), /title: `Healthcare Provider Transportation in \$\{market\.name\}`/);
  // No city/county pages or route segments.
  const appDirs = [];
  const walk = (dir) => { for (const n of readdirSync(dir)) { const f = path.join(dir, n); if (statSync(f).isDirectory()) { appDirs.push(path.relative(path.join(src, "app"), f)); walk(f); } } };
  walk(path.join(src, "app"));
  for (const d of appDirs) assert.ok(!/marietta|decatur|roswell|alpharetta|sandy-springs|county|\[city\]|\[county\]/i.test(d), d);
  for (const { file, text } of publicFiles()) {
    assert.ok(!/\b(Marietta|Decatur|Roswell|Alpharetta|Sandy Springs|Fulton|DeKalb|Cobb|Gwinnett|Clayton) (County|GA)?\b|statewide|all of Georgia|\bmile radius\b/.test(text), file);
  }
});

test("metadata: static page titles are unique and the provider/about titles are descriptive", () => {
  const titles = [];
  for (const rel of ["app/about/page.tsx", "app/contact/page.tsx", "app/healthcare-providers/page.tsx", "app/privacy/page.tsx", "app/terms/page.tsx", "app/resources/page.tsx", "app/services/page.tsx", "app/request-transportation/page.tsx"]) {
    const m = read(rel).match(/title: (?:"([^"]+)"|`([^`]+)`)/);
    assert.ok(m, rel);
    titles.push(m[1] ?? m[2]);
  }
  assert.equal(new Set(titles).size, titles.length, JSON.stringify(titles));
  assert.ok(titles.includes("About Our Non-Emergency Medical Transportation"));
  assert.ok(!titles.includes("Healthcare Providers"));
  for (const t of titles) assert.ok(!/Zenward Mobility/.test(t), "the layout template appends the brand");
});

test("sitemap and indexing: organic pages and Resources in; campaigns out and noindex", () => {
  const sitemap = stripComments(read("app/sitemap.ts"));
  for (const route of ['"/"', '"/healthcare-providers"', '"/services"', '"/about"', '"/contact"', '"/resources"', "...RESOURCE_PATHS", "...SERVICE_PATHS", "/locations/${market.slug}"]) {
    assert.ok(sitemap.includes(route), route);
  }
  assert.ok(!/campaign|metro-atlanta\//i.test(sitemap));
  assert.match(read("lib/service-pages.ts"), /export function campaignMetadata[\s\S]*?robots: \{ index: false, follow: true \}/);
  for (const rel of [PROVIDER_PAGE, "app/about/page.tsx", "app/contact/page.tsx"]) assert.ok(!/robots|noindex/.test(stripComments(read(rel))), rel);
});

// ================================================================ policy pages

test("Privacy reflects current behaviour", () => {
  const p = stripComments(read("app/privacy/page.tsx"));
  assert.match(p, /pickup &amp; assistance\s+level/);
  assert.match(p, /sent directly from our web server to the scheduling and operations service provider/);
  assert.match(p, /What you type to Zenny stays on the open page\s+and is not sent to Zenward or anyone else/);
  assert.match(p, /does not use an external AI service/);
  assert.match(p, /that number \(and only the number\) is sent from our web server\s+through our contact-delivery service/);
  assert.match(p, /trip checklist in our Resources works only on the open\s+page\. What you tick is not saved or sent to Zenward/);
  assert.match(p, /does not load Google Analytics,\s+Google Tag Manager or Google Ads tags/);
  assert.ok(!/Nemryn/i.test(p), "the processor is not named publicly");
  assert.ok(!/HIPAA[- ]compliant|we are HIPAA|encrypted with|SOC ?2|ISO 27001|lawyer[- ]approved|legally compliant/i.test(p.replace(/no claim of HIPAA\s+certification or compliance/, "")));
});

test("Terms: request -> review -> confirmation; no guarantees, medical care, coverage or payment rules", () => {
  const t = stripComments(read("app/terms/page.tsx"));
  assert.match(t, /<strong>Request\.<\/strong>/);
  assert.match(t, /<strong>Review\.<\/strong>[\s\S]*\{QUOTE_RESPONSE_LINE\}/);
  assert.match(t, /<strong>Confirmation\.<\/strong> Transportation is arranged only after Zenward confirms the details\s+with you\./);
  assert.match(t, /A reply is not a confirmation\./);
  assert.match(t, /does not guarantee that transportation is\s+available/);
  assert.match(t, /Zenward provides transportation, not medical care\./);
  assert.match(t, /this website does not set those terms/);
  assert.ok(!/does not guarantee a specific response time/.test(t), "no contradiction of the 2-hour response line");
  assert.ok(!/guaranteed (pickup|arrival|on[- ]time|availability)|we accept (medicaid|medicare|insurance)|cancellation fee|no-show fee|lawyer[- ]approved|legally compliant/i.test(t));
});

test("internal legal-review, GBP and trust-proof documents exist and invent nothing", () => {
  const legal = readFileSync(path.join(root, "docs/product/public-policy-legal-review-needed.md"), "utf8");
  for (const item of ["Business hours", "Payment methods", "Insurance / Medicaid / Medicare", "Facility billing", "Cancellation / no-show", "Exact service area", "Public business address", "Data retention", "Health-data compliance", "governing law"]) {
    assert.ok(legal.includes(item), item);
  }
  const gbp = readFileSync(path.join(root, "docs/product/google-business-profile-launch-checklist.md"), "utf8");
  assert.match(gbp, /No profile is known to exist yet/);
  assert.match(gbp, /Do not invent one/);
  assert.match(gbp, /No automated review solicitation/);
  assert.match(gbp, /No review gating/);
  const proof = readFileSync(path.join(root, "docs/product/trust-proof-backlog.md"), "utf8");
  assert.match(proof, /Never fabricate social proof/);
});

// ================================================================ tracking + social proof

test("no Google Ads / GA4 / GTM or other advertising tags", () => {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
  assert.ok(!deps.some((d) => /gtag|google-analytics|react-ga|@next\/third-parties|tagmanager|facebook-pixel|segment/i.test(d)), deps.join(","));
  for (const { file, text } of publicFiles()) {
    assert.ok(!/googletagmanager\.com|google-analytics\.com|gtag\(|dataLayer\.push|\bGTM-[A-Z0-9]+|\bAW-\d+|\bG-[A-Z0-9]{8,}\b|<GoogleTagManager|<GoogleAnalytics/.test(text), file);
  }
  assert.ok(!/<Script\b/.test(read("app/layout.tsx")));
});

test("no fake social proof: ratings, stars, testimonials, logos, counts, years, awards, seals", () => {
  for (const { file, text } of publicFiles()) {
    assert.ok(!/\bStar\b|\bStarHalf\b|★|\b[1-5](\.\d)? ?(stars?|\/ ?5)\b|five[- ]star|testimonial|what our (customers|clients|patients) say|\bawards?\b|award-winning|\b\d[\d,]*\+? (rides|trips|patients|customers|clients|families)\b|\b(over|more than) \d+ years\b|years of (service|experience)|since (19|20)\d\d|certification seal|trusted by/i.test(text), file);
  }
});

// ================================================================ Zenny

const ctx = { marketName: "Metro Atlanta", summaries: Object.fromEntries(Object.keys(SERVICE_CATALOG).map((s) => [s, "Summary."])) };
const ask = (text) => respond({ kind: "text", text }, ctx);
const hrefs = (r) => r.actions.map((a) => a.href).filter(Boolean);

test("Zenny provider answer: request form, provider page, call, contact, discharge checklist; no implied relationship", () => {
  for (const q of ["I'm a discharge planner, how do we arrange rides for our patients?", "Do you work with care coordinators?", "We are discharge planners at a hospital"]) {
    const r = ask(q);
    assert.deepEqual(validateReply(r), [], q);
    assert.equal(r.kind, "provider", q);
    for (const href of ["/request-transportation", "/healthcare-providers", "/contact", "/resources/hospital-discharge-transportation-checklist", business.phoneHref]) {
      assert.ok(hrefs(r).includes(href), `${q} -> ${href}`);
    }
    const text = r.paragraphs.join(" ");
    assert.ok(text.includes(QUOTE_RESPONSE_LINE));
    assert.ok(!/works with|partner|contract|refer|one point of contact|dedicated/i.test(text), text);
  }
});

test("Zenny trust answers stay canonical: licensed, vetted drivers, background checks, punctuality, response, area", () => {
  const licensed = ask("Are you licensed and insured?");
  assert.match(licensed.paragraphs.join(" "), /licensed and insured transportation provider/);
  const drivers = ask("Do your drivers have background checks?");
  assert.match(drivers.paragraphs.join(" "), /background checks/);
  const late = ask("Are you always on time?");
  assert.match(late.paragraphs.join(" "), /Punctuality is our standard/);
  assert.ok(!/always on time|guarantee/i.test(late.paragraphs.join(" ")));
  const reply = ask("How fast will you reply?");
  assert.ok(reply.paragraphs.join(" ").includes(QUOTE_RESPONSE_LINE));
  const area = ask("Do you serve Marietta?");
  assert.match(area.paragraphs.join(" "), /Metro Atlanta/);
  assert.ok(!/yes, we serve marietta/i.test(area.paragraphs.join(" ")));
  for (const r of [licensed, drivers, late, reply, area]) assert.deepEqual(validateReply(r), []);
});

// ================================================================ 04G3 / 04K regression

test("04G3 and 04K remain intact", () => {
  assert.match(read("components/public/RequestTransportationForm.tsx"), /<AssistanceLevelField/);
  assert.match(read("lib/quote-form/model.ts"), /if \(isDeliveredConversion\(action\.result\)\) return \{ \.\.\.state, status: "success", delivered: true \};/);
  assert.match(read("components/public/ServicePage.tsx"), /"wheelchair-transportation": "full"/);
  assert.equal(RESOURCES.length, 6);
  assert.match(read("lib/resources/schema.ts"), /author: \{ "@type": "Organization", name: siteName, url: siteUrl \}/);
});
