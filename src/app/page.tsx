import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, ClipboardText, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { BrandImage } from "@/components/layout/BrandImage";
import { HomeHero } from "@/components/public/HomeHero";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { CallButton } from "@/components/public/CallButton";
import { TrackedPhoneLink } from "@/components/public/TrackedPhoneLink";
import { LinkButton } from "@/components/ui/LinkButton";
import { FaqAccordion } from "@/components/public/FaqAccordion";
import { typography } from "@/design/typography";
import { cn } from "@/lib/cn";
import { brandImages } from "@/lib/images";
import { business } from "@/lib/business";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";
import { SERVICES, SERVICE_ORDER } from "@/lib/services";
import { areaServedJsonLd, homeMetadataCopy, serviceAreaFaqAnswer, servingLine } from "@/lib/service-area";

/*
 * Homepage (ZW-WEB-04B). Conversion hierarchy, top to bottom:
 *   hero -> quick request/call band -> services -> how it works -> why Zenward
 *   -> patients & families -> healthcare providers -> FAQ -> final CTA
 * Claim discipline: docs/product/marketing-scope.md. Nothing here adds a
 * capability, metric, credential or geography that is not already confirmed.
 */

const homeCopy = homeMetadataCopy();

// Gives the homepage its own canonical + og:url (it previously had neither).
// The root layout's "%s | Zenward Mobility" template does not apply to the
// root page itself, so the full title is set as `absolute`.
export const metadata: Metadata = {
  ...pageMetadata({ title: homeCopy.title, description: homeCopy.description, path: "/" }),
  title: { absolute: `${homeCopy.title} | ${siteName}` },
};

const PROCESS_STEPS = [
  {
    title: "Send a request",
    description: "Online or by phone: the passenger, pickup, destination and timing, plus any mobility or assistance needs.",
  },
  {
    title: "Zenward reviews it",
    description: "A member of our team reviews the trip details before anything is confirmed.",
  },
  {
    title: "We confirm with you",
    description:
      "We contact the person who made the request to confirm availability and details. A request is not a booking until we confirm it.",
  },
  {
    title: "The trip takes place",
    description: "Transportation is arranged according to the confirmed trip details.",
  },
];

const WHY_POINTS = [
  {
    title: "Reviewed by a person",
    description:
      "Every request is reviewed by the Zenward team before transportation is confirmed. Mobility and assistance needs are part of that review.",
  },
  {
    title: "Planned around the appointment",
    description:
      "Requests are considered in the context of scheduled care, including the appointment time and whether a return trip is needed.",
  },
  {
    title: "Clear communication",
    description: "You get pickup information as it is confirmed, and a point of contact if plans change.",
  },
  {
    title: "Room for recurring care",
    description:
      "Repeated appointments, such as dialysis or rehabilitation, can be described once and discussed as a regular arrangement.",
    link: { href: SERVICES["recurring-care-transportation"].path, label: "Recurring care transportation" },
  },
  {
    title: "Non-emergency, and clear about it",
    description:
      "Zenward provides non-emergency medical transportation only. It does not provide ambulance, stretcher or emergency transportation. In an emergency, call 911.",
  },
];

const ARRANGERS = [
  { title: "For yourself", description: "Request your own ride to an appointment, treatment or therapy visit." },
  {
    title: "For a family member",
    description: "Arrange transportation for a parent, spouse or relative. Zenward follows up with you.",
  },
  {
    title: "As a caregiver",
    description: "Coordinate trips for someone in your care, including appointments that repeat.",
  },
];

const PROVIDER_POINTS = [
  { title: "Appointment-led scheduling", description: "Rides arranged around when the patient needs to arrive, for one visit or a recurring schedule." },
  { title: "Discharge coordination", description: "Share the discharge details and Zenward coordinates transportation to the patient's next destination." },
  { title: "One point of contact", description: "A consistent contact for your team's transportation requests, so you know who to call." },
];

const FAQ_ITEMS = [
  {
    question: "Is submitting a request a confirmed booking?",
    answer:
      "No. A request tells Zenward what transportation you need. Our team reviews it and contacts you, and the trip is confirmed only once we have confirmed availability and details with you.",
  },
  {
    question: "Can a family member or caregiver arrange transportation?",
    answer:
      "Yes. You can request transportation for yourself, for a family member, or as a caregiver. The request form asks for your relationship to the passenger so we follow up with the right person.",
  },
  {
    question: "Does Zenward offer wheelchair-accessible transportation?",
    answer:
      "Yes. Zenward offers wheelchair-accessible transportation for scheduled, non-emergency medical trips. Tell us about the passenger's mobility and assistance needs when you submit the request so our team can review the trip details and confirm the transportation arrangement.",
  },
  {
    question: "Can I request recurring transportation?",
    answer:
      "Yes. Choose Recurring on the request form and tell us the days of the week and start date. Zenward reviews the schedule you requested and confirms with you what it can arrange. The form does not book trips automatically.",
  },
  {
    question: "What kinds of appointments does Zenward provide transportation to?",
    answer:
      "Scheduled, non-emergency medical care: doctor and specialist visits, dialysis, rehabilitation and therapy, transportation after a hospital discharge, and other recurring care. Choose the closest service on the request form, or Other.",
  },
  {
    question: "Is this emergency transportation?",
    answer:
      "No. Zenward provides non-emergency medical transportation only. If you are experiencing a medical emergency, call 911.",
  },
  {
    question: "Where does Zenward operate?",
    answer: serviceAreaFaqAnswer(),
  },
];

// Conservative, accurate schema.org type — see docs/product/marketing-scope.md
// "Structured data". `Organization` with a `ContactPoint` covers exactly what is
// verified: name, phone, url, logo, and the owner-confirmed operating market
// (`areaServed`, from src/lib/service-area.ts). No address, hours, rating, or
// price range.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  description:
    "Non-emergency medical transportation for appointments, treatments, discharge journeys, and scheduled care.",
  url: siteUrl,
  logo: absoluteUrl("/images/zenward-mobility-logo.png"),
  areaServed: areaServedJsonLd(),
  contactPoint: {
    "@type": "ContactPoint",
    telephone: business.phoneHref.replace("tel:", ""),
    contactType: "customer service",
    availableLanguage: "English",
  },
};

function TextPhoneLink({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <TrackedPhoneLink
      surface="homepage"
      className={cn(
        typography.bodySmall,
        "inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline",
        onDark ? "text-white" : "text-brand-care-navy",
        className,
      )}
    >
      <Phone className={cn("size-4", onDark ? "text-brand-arrival-gold" : "text-brand-interactive-teal")} weight="fill" aria-hidden />
      Call {business.phoneDisplay}
    </TrackedPhoneLink>
  );
}

export default function HomePage() {
  const serving = servingLine();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      {/* 1. Hero */}
      <HomeHero />

      {/* 2. Practical reassurance band (ZW-WEB-04B2) — keeps the approved
             overlapping white card, but no longer repeats the hero's CTAs:
             where Zenward operates, how requests are handled, one phone link.
             The hero stays the main conversion area. */}
      <div className="relative z-10 -mt-14 px-md sm:-mt-16 sm:px-xl lg:-mt-20">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg bg-surface-elevated px-lg py-md shadow-md ring-1 ring-brand-care-navy/10 sm:px-xl sm:py-lg">
            <h2 className="sr-only">Before you request</h2>
            <ul className="grid grid-cols-1 divide-y divide-border-subtle lg:grid-cols-[auto_1fr_auto] lg:divide-x lg:divide-y-0">
              <li className="flex items-center gap-3 py-3 lg:py-1 lg:pr-xl">
                <MapPin className="size-6 shrink-0 text-brand-interactive-teal" weight="fill" aria-hidden />
                <span className={cn(typography.body, "font-semibold text-text-primary")}>{serving}</span>
              </li>
              <li className="flex items-center gap-3 py-3 lg:py-1 lg:px-xl">
                <ClipboardText className="size-6 shrink-0 text-brand-interactive-teal" weight="fill" aria-hidden />
                <span className={cn(typography.bodySmall, "text-text-secondary sm:text-base sm:leading-7")}>
                  Every transportation request is reviewed by our team before availability is confirmed.
                </span>
              </li>
              <li className="flex items-center gap-3 pt-3 lg:py-1 lg:pl-xl">
                <TrackedPhoneLink
                  surface="hero"
                  aria-label={`Call Zenward at ${business.phoneDisplay}`}
                  className={cn(
                    typography.body,
                    "inline-flex min-h-11 items-center gap-3 font-semibold whitespace-nowrap text-brand-care-navy hover:underline underline-offset-4",
                  )}
                >
                  <Phone className="size-6 shrink-0 text-brand-interactive-teal" weight="fill" aria-hidden />
                  {business.phoneDisplay}
                </TrackedPhoneLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Services — the eight approved services from the canonical catalogue
             (7 medical transportation services + Airport Transportation, 4x2 on desktop). */}
      <Section tone="white" id="services">
        <div className="max-w-[40rem]">
          <p className={cn(typography.eyebrow, "text-brand-interactive-teal")}>Services</p>
          <h2 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>Transportation for essential care</h2>
          <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
            Non-emergency transportation for scheduled medical care, one trip or a regular schedule, plus
            pre-arranged airport rides.
          </p>
        </div>
        {/* Phones: one grouped list with dividers (not a wall of cards). sm+: a card grid. */}
        <ul className="mt-2xl grid grid-cols-1 divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle sm:grid-cols-2 sm:gap-lg sm:divide-y-0 sm:overflow-visible sm:rounded-none sm:border-0 lg:grid-cols-4">
          {SERVICE_ORDER.map((slug) => {
            const service = SERVICES[slug];
            return (
              <li key={slug}>
                <Link
                  href={service.path}
                  className="group flex h-full gap-4 bg-surface-elevated p-md transition-colors duration-base hover:bg-surface-app sm:rounded-lg sm:border sm:border-border-subtle sm:p-lg sm:hover:border-brand-interactive-teal/50 lg:flex-col lg:gap-0"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-calm-mist text-brand-care-navy">
                    <service.icon className="size-6" weight="regular" aria-hidden />
                  </span>
                  <span className="flex flex-1 flex-col lg:mt-4">
                    <span className={cn(typography.body, "flex items-start justify-between gap-2 font-semibold text-text-primary")}>
                      {service.label}
                      <ArrowRight
                        className="mt-1.5 size-4 shrink-0 text-brand-interactive-teal transition-transform duration-base group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                    <span className={cn(typography.bodySmall, "mt-1 text-text-secondary")}>{service.summary}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-lg flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-xl">
          <Link
            href="/services"
            className={cn(
              typography.bodySmall,
              "inline-flex min-h-11 items-center gap-1.5 font-medium text-brand-interactive-teal hover:underline",
            )}
          >
            Compare all transportation services
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <p className={cn(typography.bodySmall, "flex flex-wrap items-center gap-x-2 text-text-secondary")}>
            Not sure which service fits? <TextPhoneLink />
          </p>
        </div>
      </Section>

      {/* 4. How it works — an editorial timeline, not another card grid. */}
      <Section tone="mist" id="how-it-works">
        <div className="grid grid-cols-1 gap-xl lg:grid-cols-[1fr_1.3fr] lg:gap-3xl">
          <div>
            <p className={cn(typography.eyebrow, "text-text-accent-on-tint")}>How It Works</p>
            <h2 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>From request to arrival</h2>
            <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
              A request starts a conversation with our team. Nothing is booked until Zenward confirms the details
              with you.
            </p>
            <p className={cn(typography.bodySmall, "mt-4 text-text-secondary")}>Prefer to talk it through?</p>
            <TextPhoneLink />
          </div>
          <ol className="relative">
            {PROCESS_STEPS.map((step, index) => (
              <li key={step.title} className="relative flex gap-5 pb-xl last:pb-0">
                {index < PROCESS_STEPS.length - 1 && (
                  <span aria-hidden className="absolute top-11 bottom-1 left-[1.375rem] w-px bg-brand-care-navy/20" />
                )}
                <span
                  className={cn(
                    typography.button,
                    "relative flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-care-navy text-base text-white",
                  )}
                >
                  {index + 1}
                </span>
                <div className="pt-2">
                  <h3 className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>{step.title}</h3>
                  <p className={cn(typography.body, "mt-1 text-text-secondary")}>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 5. Why Zenward — the single consolidated reassurance section. */}
      <Section tone="white" id="why-medical-transportation">
        <div className="grid grid-cols-1 gap-2xl lg:grid-cols-[1fr_1.1fr] lg:gap-3xl">
          {/* Sticky on desktop so the heading stays beside the list as it scrolls. */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className={cn(typography.eyebrow, "text-brand-interactive-teal")}>Why Zenward</p>
            <h2 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>
              Transportation planned around care, not just a pickup
            </h2>
            <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
              A medical trip often involves more than getting from one address to another. Appointment timing,
              recurring schedules, family coordination and changing care plans can all affect the journey.
            </p>
          </div>
          <ul className="divide-y divide-brand-care-navy/15 border-y border-brand-care-navy/15">
            {WHY_POINTS.map((point) => (
              <li key={point.title} className="flex gap-4 py-md sm:py-lg">
                <CheckCircle className="mt-1 size-5 shrink-0 text-brand-interactive-teal" weight="fill" aria-hidden />
                <div>
                  <h3 className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>{point.title}</h3>
                  <p className={cn(typography.bodySmall, "mt-1 text-text-secondary sm:text-base sm:leading-7")}>{point.description}</p>
                  {point.link && (
                    <Link
                      href={point.link.href}
                      className={cn(
                        typography.bodySmall,
                        "mt-1 inline-flex min-h-11 items-center gap-1.5 font-medium text-brand-interactive-teal hover:underline",
                      )}
                    >
                      {point.link.label}
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 6. Patients, families and caregivers. */}
      <Section tone="mist">
        <div className="grid grid-cols-1 items-center gap-2xl lg:grid-cols-2">
          <BrandImage asset={brandImages.staffWalkingAssist} aspect="video" objectPosition="center 38%" />
          <div>
            <p className={cn(typography.eyebrow, "text-text-accent-on-tint")}>Patients, Families &amp; Caregivers</p>
            <h2 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>
              Arrange a ride for yourself or someone you care for
            </h2>
            <dl className="mt-6 flex flex-col gap-4">
              {ARRANGERS.map((item) => (
                <div key={item.title} className="border-l-2 border-brand-route-teal pl-4">
                  <dt className={cn(typography.body, "font-semibold text-text-primary")}>{item.title}</dt>
                  <dd className={cn(typography.bodySmall, "mt-0.5 text-text-secondary")}>{item.description}</dd>
                </div>
              ))}
            </dl>
            <p className={cn(typography.bodySmall, "mt-6 text-text-secondary")}>
              Tell us about any mobility or assistance needs in the request. Zenward reviews them before the trip
              is confirmed.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
              <TrackedLinkButton
                href="/request-transportation"
                size="lg"
                event={{ name: "request_transportation_clicked", source: "patients_families" }}
              >
                Request a Quote
              </TrackedLinkButton>
              <TextPhoneLink />
            </div>
          </div>
        </div>
      </Section>

      {/* 7. Healthcare providers — the single provider section. */}
      <Section tone="navy">
        <div className="grid grid-cols-1 gap-2xl lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-3xl">
          <div>
            <p className={cn(typography.eyebrow, "text-brand-arrival-gold")}>For Healthcare Providers</p>
            <h2 className={cn(typography.sectionTitle, "mt-3 text-white")}>
              Transportation coordination your team can rely on
            </h2>
            <p className={cn(typography.lede, "mt-4 max-w-[34rem] text-white/80")}>
              If your organization arranges transportation for patients, such as a clinic, dialysis center,
              rehabilitation provider, hospital discharge team or senior care organization, Zenward can coordinate
              one-time trips and recurring schedules.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <LinkButton href="/healthcare-providers" size="lg" onDark>
                How Zenward works with providers
              </LinkButton>
              <TrackedLinkButton
                href="/contact"
                size="lg"
                variant="outline"
                onDark
                event={{ name: "provider_cta_clicked", source: "homepage" }}
              >
                Talk to Zenward
              </TrackedLinkButton>
            </div>
            <TextPhoneLink onDark className="mt-3" />
          </div>
          <ul className="divide-y divide-white/15 border-y border-white/15">
            {PROVIDER_POINTS.map((point) => (
              <li key={point.title} className="py-lg">
                <h3 className={cn(typography.subsectionTitle, "text-lg text-white")}>{point.title}</h3>
                <p className={cn(typography.bodySmall, "mt-1 text-white/75")}>{point.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 8. FAQ */}
      <Section tone="white" narrow>
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>Frequently asked questions</h2>
        <div className="mt-2xl">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
        <p className={cn(typography.bodySmall, "mt-lg text-center text-text-secondary")}>
          Still have a question?{" "}
          <Link href="/contact" className="font-medium text-brand-interactive-teal underline">
            Talk to our team
          </Link>{" "}
          or call{" "}
          <TrackedPhoneLink surface="homepage" className="font-medium text-brand-interactive-teal underline">
            {business.phoneDisplay}
          </TrackedPhoneLink>
          .
        </p>
      </Section>

      {/* 9. Final CTA — an inset Care Navy panel: the page's visual close, kept
             distinct from the navy footer below it. */}
      <section className="bg-surface-elevated pb-3xl sm:pb-4xl">
        <SectionContainer>
          <div className="relative overflow-hidden rounded-lg bg-brand-care-navy px-lg py-2xl text-center sm:px-2xl sm:py-3xl">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(60% 80% at 100% 0%, color-mix(in srgb, var(--color-brand-route-teal) 22%, transparent) 0%, transparent 70%)",
              }}
            />
            <div className="relative flex flex-col items-center gap-6">
              <h2 className={cn(typography.sectionTitle, "text-white")}>Need medical transportation?</h2>
              <p className={cn(typography.lede, "max-w-[36rem] text-white/85")}>
                <span className="font-medium text-white">{serving}.</span> Zenward reviews every request and follows up to confirm availability and details.
              </p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <TrackedLinkButton
                  href="/request-transportation"
                  size="lg"
                  onDark
                  event={{ name: "request_transportation_clicked", source: "final_cta" }}
                >
                  Request a Quote
                </TrackedLinkButton>
                <CallButton surface="homepage" onDark />
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>
    </>
  );
}
