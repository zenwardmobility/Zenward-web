import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { BrandImage } from "@/components/layout/BrandImage";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { CallButton } from "@/components/public/CallButton";
import { PracticalFacts } from "@/components/public/PracticalFacts";
import { TrustStrip } from "@/components/public/TrustStrip";
import { OPERATING_STANDARDS, type OperatingStandardKey } from "@/lib/trust";
import { FaqAccordion } from "@/components/public/FaqAccordion";
import { ClosingCta } from "@/components/public/ClosingCta";
import { LinkButton } from "@/components/ui/LinkButton";
import { typography } from "@/design/typography";
import { cn } from "@/lib/cn";
import { brandImages } from "@/lib/images";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";
import { areaServedJsonLd, getActiveMarkets, getMarket, serviceAreaFaqAnswer, type Market } from "@/lib/service-area";
import { breadcrumbJsonLd } from "@/lib/service-pages";
import { SERVICE_CATALOG, SERVICE_ORDER } from "@/lib/service-catalog";
import { SERVICES } from "@/lib/services";

/**
 * Local market hub (ZW-WEB-04D): /locations/<market>, indexable and in the
 * sitemap. Only active, owner-confirmed markets from src/lib/service-area.ts
 * exist; any other slug 404s. No counties, cities, radius, address, hours or
 * airport procedures are stated, because none are confirmed.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getActiveMarkets().map((market) => ({ market: market.slug }));
}

type Params = { params: Promise<{ market: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const market = getMarket((await params).market);
  if (!market) return {};
  return pageMetadata({
    title: `Non-Emergency Medical Transportation Services in ${market.name}`,
    description: `Zenward Mobility provides scheduled, non-emergency medical transportation in ${market.name}: appointments, dialysis, rehabilitation, hospital discharge, recurring care and wheelchair-accessible trips. Request a quote or call.`,
    path: `/locations/${market.slug}`,
  });
}

// Restrained operations layer (ZW-WEB-04F): owner-confirmed standards from
// src/lib/trust.ts. No address, counties, fleet, years or trip counts.
const HUB_STANDARDS: OperatingStandardKey[] = ["punctuality", "drivers", "care", "licensed"];

const NEMT_SLUGS = SERVICE_ORDER.filter((slug) => slug !== "airport-transportation");

const AUDIENCES = [
  { title: "Patients", description: "Adults who don't drive, or would rather not drive, to medical care." },
  { title: "Families", description: "Relatives arranging a ride for a parent, spouse or family member." },
  { title: "Caregivers", description: "Caregivers coordinating trips for someone in their care." },
  { title: "Care teams", description: "Clinics, dialysis centers, rehabilitation providers and discharge teams." },
];

const STEPS = [
  { title: "Request a quote", description: "Online or by phone, with the passenger, pickup, destination and timing." },
  { title: "We review it", description: "A member of our team reviews the trip and any mobility or assistance notes." },
  { title: "We contact you", description: "To confirm availability, next steps and pricing." },
  { title: "Your trip is confirmed", description: "A request isn't a booking until Zenward confirms it with you." },
];

function hubJsonLd(market: Market) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `Non-Emergency Medical Transportation in ${market.name}`,
      serviceType: "Non-Emergency Medical Transportation",
      url: absoluteUrl(`/locations/${market.slug}`),
      provider: { "@type": "Organization", name: siteName, url: siteUrl },
      areaServed: areaServedJsonLd(market),
    },
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: market.name, path: `/locations/${market.slug}` },
    ]),
  ];
}

export default async function MarketHubPage({ params }: Params) {
  const market = getMarket((await params).market);
  if (!market) notFound();

  const faq = [
    { question: "Where does Zenward operate?", answer: serviceAreaFaqAnswer(market) },
    {
      question: "Is submitting a request a confirmed ride?",
      answer:
        "No. Our team reviews every request and contacts you, and the trip is confirmed only once we've confirmed availability, details and pricing with you.",
    },
    {
      question: "Do you offer wheelchair-accessible transportation?",
      answer:
        "Yes. Zenward offers wheelchair-accessible transportation for scheduled, non-emergency medical trips. Describe the passenger's mobility needs in the request.",
    },
    {
      question: "Can I request recurring trips, such as for dialysis?",
      answer:
        "Yes. Choose Recurring on the request form and describe the schedule. Zenward reviews it and confirms what it can arrange; nothing is booked automatically.",
    },
    {
      question: "Can a family member or care team arrange the ride?",
      answer: "Yes. The form asks for your relationship to the passenger, and Zenward follows up with the person who made the request.",
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hubJsonLd(market)) }} />

      {/* 1. Hero */}
      <section className="bg-linear-to-br from-brand-care-navy via-brand-care-navy to-brand-interactive-teal py-xl text-white sm:py-3xl lg:py-4xl">
        <SectionContainer className="grid grid-cols-1 items-center gap-xl lg:grid-cols-[1.2fr_1fr] lg:gap-2xl">
          <div>
            <p className={cn(typography.eyebrow, "text-brand-arrival-gold")}>Serving {market.name}</p>
            <h1 className="mt-3 text-balance font-display text-[2.125rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              Non-Emergency Medical Transportation in {market.name}
            </h1>
            <p className={cn(typography.body, "mt-4 max-w-[36rem] text-white/90 sm:text-lg sm:leading-8")}>
              Scheduled rides to appointments, treatment and recurring care, including wheelchair-accessible
              transportation, for passengers and the families, caregivers and care teams who arrange their trips.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <TrackedLinkButton
                href="/request-transportation"
                size="lg"
                onDark
                className="w-full sm:w-auto"
                event={{ name: "request_transportation_clicked", source: "market_page" }}
              >
                Request a Quote
              </TrackedLinkButton>
              <CallButton surface="market_page" onDark className="w-full sm:w-auto" />
            </div>
            <TrustStrip variant="compact" tone="dark" className="mt-6 border-t border-white/15 pt-5" />
          </div>
          <BrandImage
            asset={brandImages.vanWalkerAssist}
            aspectClass="aspect-[16/10] lg:aspect-[4/3]"
            sizes="(min-width: 1024px) 34rem, 100vw"
            objectPosition="70% 55%"
            priority
            className="ring-1 ring-white/15"
          />
        </SectionContainer>
      </section>

      <PracticalFacts surface="market_page" />

      {/* 2. Services available */}
      <Section tone="white">
        <div className="max-w-[40rem]">
          <h2 className={cn(typography.sectionTitle, "text-text-primary")}>Transportation services in {market.name}</h2>
          <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
            Seven medical transportation services, one trip or a regular schedule.
          </p>
        </div>
        <ul className="mt-xl grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NEMT_SLUGS.map((slug) => {
            const service = SERVICES[slug];
            return (
              <li key={slug}>
                <Link
                  href={service.path}
                  className="group flex h-full items-start gap-3 rounded-lg border border-border-subtle p-md transition-colors duration-base hover:border-brand-interactive-teal/50 hover:bg-surface-app"
                >
                  <service.icon className="mt-0.5 size-6 shrink-0 text-brand-care-navy" weight="regular" aria-hidden />
                  <span>
                    <span className={cn(typography.body, "font-semibold text-text-primary")}>{service.label}</span>
                    <span className={cn(typography.bodySmall, "mt-0.5 block text-text-secondary")}>{service.summary}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className={cn(typography.bodySmall, "mt-lg text-text-secondary")}>
          Also available:{" "}
          <Link href={SERVICE_CATALOG["airport-transportation"].path} className="font-medium text-brand-interactive-teal underline">
            {SERVICE_CATALOG["airport-transportation"].label}
          </Link>{" "}
          for pre-arranged trips to and from the airport.
        </p>
      </Section>

      {/* 3. Who Zenward serves */}
      <Section tone="mist">
        <h2 className={cn(typography.sectionTitle, "text-text-primary")}>Who Zenward serves</h2>
        <div className="mt-xl grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((item) => (
            <div key={item.title} className="border-t-2 border-brand-route-teal pt-4">
              <h3 className={cn(typography.body, "font-semibold text-text-primary")}>{item.title}</h3>
              <p className={cn(typography.bodySmall, "mt-1 text-text-secondary")}>{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. How requests work */}
      <Section tone="white">
        <h2 className={cn(typography.sectionTitle, "text-text-primary")}>How requests work</h2>
        <ol className="mt-2xl grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className={cn(typography.button, "flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-care-navy text-base text-white")}>
                {index + 1}
              </span>
              <div className="pt-1.5">
                <h3 className={cn(typography.body, "font-semibold text-text-primary")}>{step.title}</h3>
                <p className={cn(typography.bodySmall, "mt-1 text-text-secondary")}>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-3xl border-t border-border-subtle pt-2xl">
          <h2 className={cn(typography.sectionTitle, "text-text-primary")}>How Zenward operates in {market.name}</h2>
          <div className="mt-xl grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-4">
            {HUB_STANDARDS.map((key) => {
              const standard = OPERATING_STANDARDS[key];
              return (
                <div key={key} className="border-t-2 border-brand-route-teal pt-4">
                  <h3 className={cn(typography.body, "font-semibold text-text-primary")}>{standard.title}</h3>
                  <p className={cn(typography.bodySmall, "mt-1 text-text-secondary")}>{standard.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* 5. Wheelchair-accessible transportation */}
      <Section tone="mist">
        <div className="grid grid-cols-1 items-center gap-2xl lg:grid-cols-2">
          <BrandImage asset={brandImages.heroDesktop} aspect="video" objectPosition="72% 45%" />
          <div>
            <h2 className={cn(typography.sectionTitle, "text-text-primary")}>Wheelchair-accessible transportation</h2>
            <p className={cn(typography.body, "mt-4 text-text-secondary")}>
              Zenward offers wheelchair-accessible transportation for scheduled, non-emergency medical trips in{" "}
              {market.name}. Describe the passenger&rsquo;s mobility needs in the request, and our team reviews the trip
              before confirming the arrangement with you.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <LinkButton href={SERVICE_CATALOG["wheelchair-transportation"].path} size="lg" variant="outline">
                About wheelchair-accessible transportation
              </LinkButton>
            </div>
          </div>
        </div>
      </Section>

      {/* 6–7. One-time / recurring, and families & caregivers */}
      <Section tone="white">
        <div className="grid grid-cols-1 gap-2xl lg:grid-cols-2">
          <div>
            <h2 className={cn(typography.sectionTitle, "text-text-primary")}>One-time and recurring transportation</h2>
            <p className={cn(typography.body, "mt-4 text-text-secondary")}>
              Request a single trip, or describe a repeating schedule for dialysis, therapy or other ongoing care. Recurring
              requests are reviewed by our team and confirmed with you; nothing repeats automatically.
            </p>
            <Link
              href={SERVICE_CATALOG["recurring-care-transportation"].path}
              className={cn(typography.bodySmall, "mt-3 inline-flex min-h-11 items-center gap-1.5 font-medium text-brand-interactive-teal hover:underline")}
            >
              Recurring care transportation
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div>
            <h2 className={cn(typography.sectionTitle, "text-text-primary")}>For families and caregivers</h2>
            <ul className="mt-4 space-y-2">
              {[
                "Arrange a ride for a parent, spouse or relative",
                "Coordinate regular appointments for someone in your care",
                "Zenward follows up with the person who made the request",
              ].map((item) => (
                <li key={item} className={cn(typography.body, "flex items-start gap-2.5 text-text-secondary")}>
                  <CheckCircle className="mt-1 size-5 shrink-0 text-brand-interactive-teal" weight="fill" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 8. Healthcare providers */}
      <Section tone="navy">
        <div className="grid grid-cols-1 gap-xl lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className={cn(typography.eyebrow, "text-brand-arrival-gold")}>For Healthcare Providers</p>
            <h2 className={cn(typography.sectionTitle, "mt-3 text-white")}>Arranging transportation for patients?</h2>
            <p className={cn(typography.lede, "mt-4 text-white/80")}>
              Clinics, dialysis centers, rehabilitation providers, discharge teams and senior care organizations can arrange
              one-time trips and recurring schedules with Zenward.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <LinkButton href="/healthcare-providers" size="lg" onDark>
              How Zenward works with providers
            </LinkButton>
            <TrackedLinkButton
              href="/contact"
              size="lg"
              variant="outline"
              onDark
              event={{ name: "provider_cta_clicked", source: "market_page" }}
            >
              Talk to Zenward
            </TrackedLinkButton>
          </div>
        </div>
      </Section>

      {/* 9. FAQ */}
      <Section tone="white" narrow>
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>Frequently asked questions</h2>
        <div className="mt-2xl">
          <FaqAccordion items={faq} />
        </div>
      </Section>

      {/* 10. Closing CTA */}
      <ClosingCta
        heading={`Need medical transportation in ${market.name}?`}
        body="Request a quote or call. Zenward reviews every request and follows up to confirm availability and details."
        event={{ name: "request_transportation_clicked", source: "market_page" }}
        surface="market_page"
        note="Zenward provides non-emergency transportation only. In a medical emergency, call 911."
      />
    </>
  );
}
