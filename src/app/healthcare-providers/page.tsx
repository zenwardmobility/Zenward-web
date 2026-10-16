import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { BrandImage } from "@/components/layout/BrandImage";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { CallButton } from "@/components/public/CallButton";
import { FaqAccordion } from "@/components/public/FaqAccordion";
import { brandImages } from "@/lib/images";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { business } from "@/lib/business";
import { cn } from "@/lib/cn";
import { OPERATING_STANDARDS, PROVIDER_TRUST_ORDER, QUOTE_RESPONSE_LINE } from "@/lib/trust";
import { commercialFaq } from "@/lib/operating-facts";
import { getDefaultMarket } from "@/lib/service-area";
import { SERVICE_CATALOG, SERVICE_ORDER } from "@/lib/service-catalog";
import { SERVICES } from "@/lib/services";
import { breadcrumbJsonLd } from "@/lib/service-pages";
import {
  DISCHARGE_CHECKLIST_HREF,
  PROVIDER_AUDIENCES,
  PROVIDER_ENQUIRY_HREF,
  PROVIDER_HEADLINE,
  PROVIDER_LEDE,
  PROVIDER_NOT_AUTOMATED,
  PROVIDER_NO_MEDICAL_DETAILS,
  PROVIDER_READY_ITEMS,
  PROVIDER_REQUEST_HREF,
  PROVIDER_ROUTES,
  PROVIDER_SCENARIOS,
  PROVIDER_STEPS,
} from "@/lib/providers";

const market = getDefaultMarket();

export const metadata: Metadata = pageMetadata({
  title: `Healthcare Provider Transportation in ${market.name}`,
  description: `How care teams request scheduled, non-emergency patient transportation in ${market.name}: what to have ready, how requests are reviewed, and recurring trips.`,
  path: "/healthcare-providers",
});

// Care-team questions from the canonical operating facts (ZW-WEB-04I). No portal, contract billing or SLA claims.
const PROVIDER_FAQ = (() => {
  const f = commercialFaq();
  return [f.response, f.confirmation, f.pricing, f.recurring, f.facilityBilling, f.area];
})();

// Medical trip types are central; Airport stays a secondary mention.
const PROVIDER_SERVICES = SERVICE_ORDER.filter((slug) => slug !== "airport-transportation");

/**
 * /healthcare-providers (ZW-WEB-04L): a working page for care teams that
 * arrange transportation for patients. Primary path: the request form
 * (/request-transportation). General provider enquiries: /contact. No second
 * intake form, no implied contracts, partnerships, integrations or logos.
 * Trust wording comes from src/lib/trust.ts; page copy from src/lib/providers.ts.
 */
export default function HealthcareProvidersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Healthcare Providers", path: "/healthcare-providers" },
            ]),
          ),
        }}
      />

      {/* A. Hero */}
      <Section tone="navy-gradient">
        <div className="grid grid-cols-1 items-center gap-2xl lg:grid-cols-2">
          <div>
            <p className={cn(typography.eyebrow, "text-brand-arrival-gold")}>Healthcare Providers</p>
            <h1 className={cn(typography.sectionTitle, "mt-3 text-balance text-white")}>{PROVIDER_HEADLINE(market.name)}</h1>
            <p className={cn(typography.lede, "mt-4 max-w-[34rem] text-white/85")}>{PROVIDER_LEDE}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <TrackedLinkButton
                href={PROVIDER_REQUEST_HREF}
                size="lg"
                onDark
                className="w-full sm:w-auto"
                event={{ name: "request_transportation_clicked", source: "provider_page" }}
              >
                Request Transportation
              </TrackedLinkButton>
              <CallButton surface="provider_page" onDark className="w-full sm:w-auto" label={`Call Zenward ${business.phoneDisplay}`} />
            </div>
            <p className={cn(typography.bodySmall, "mt-4 font-semibold text-white")}>{QUOTE_RESPONSE_LINE}</p>
          </div>
          <BrandImage
            asset={brandImages.vanWalkerAssist}
            aspectClass="aspect-[4/3] lg:aspect-square"
            sizes="(min-width: 1024px) 30rem, 100vw"
            className="ring-1 ring-white/10"
            objectPosition="center 45%"
          />
        </div>
      </Section>

      {/* B. Who Zenward works with — roles, never organisation names or logos */}
      <Section tone="white">
        <h2 className={cn(typography.sectionTitle, "text-text-primary")}>Who this is for</h2>
        <p className={cn(typography.lede, "mt-4 max-w-[40rem] text-text-secondary")}>
          Anyone arranging non-emergency transportation for patients as part of their work.
        </p>
        <ul className="mt-xl flex flex-wrap gap-3">
          {PROVIDER_AUDIENCES.map((audience) => (
            <li key={audience} className={cn(typography.bodySmall, "rounded-full border border-border-strong px-5 py-2.5 font-medium text-text-primary")}>
              {audience}
            </li>
          ))}
        </ul>
      </Section>

      {/* C. Transportation needs */}
      <Section tone="mist">
        <h2 className={cn(typography.sectionTitle, "text-text-primary")}>Trips Zenward can help coordinate</h2>
        <ul className="mt-xl grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROVIDER_SERVICES.map((slug) => {
            const service = SERVICES[slug];
            return (
              <li key={slug}>
                <Link
                  href={service.path}
                  className="group flex h-full items-start gap-3 rounded-lg border border-border-subtle bg-surface-elevated p-md transition-colors duration-base hover:border-brand-interactive-teal/50"
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
          <Link href={SERVICE_CATALOG["airport-transportation"].path} className="font-medium text-text-accent-on-tint underline">
            {SERVICE_CATALOG["airport-transportation"].label}
          </Link>{" "}
          for pre-arranged trips to and from the airport.
        </p>
      </Section>

      {/* D. What to have ready + E. How requests work */}
      <Section tone="white">
        <div className="grid grid-cols-1 gap-2xl lg:grid-cols-2 lg:gap-3xl">
          <div>
            <h2 className={cn(typography.sectionTitle, "text-text-primary")}>What to have ready</h2>
            <ul className="mt-xl flex flex-col gap-3">
              {PROVIDER_READY_ITEMS.map((item) => (
                <li key={item.label} className="flex gap-3">
                  <CheckCircle className="mt-0.5 size-5 shrink-0 text-brand-interactive-teal" weight="fill" aria-hidden />
                  <span>
                    <span className={cn(typography.body, "block font-semibold text-text-primary")}>{item.label}</span>
                    <span className={cn(typography.bodySmall, "block text-text-secondary")}>{item.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className={cn(typography.bodySmall, "mt-lg rounded-lg bg-surface-app px-4 py-3 text-text-primary")}>{PROVIDER_NO_MEDICAL_DETAILS}</p>
          </div>
          <div>
            <h2 className={cn(typography.sectionTitle, "text-text-primary")}>How requests work</h2>
            <ol className="mt-xl flex flex-col gap-lg">
              {PROVIDER_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className={cn(typography.button, "flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-care-navy text-white")}>
                    {index + 1}
                  </span>
                  <div className="pt-1.5">
                    <h3 className={cn(typography.body, "font-semibold text-text-primary")}>{step.title}</h3>
                    <p className={cn(typography.bodySmall, "mt-1 text-text-secondary")}>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className={cn(typography.bodySmall, "mt-lg text-text-secondary")}>{PROVIDER_NOT_AUTOMATED}</p>
          </div>
        </div>
      </Section>

      {/* F. Recurring + discharge coordination */}
      <Section tone="mist">
        <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
          <div className="rounded-lg bg-surface-elevated p-lg">
            <h2 className={cn(typography.subsectionTitle, "text-text-primary")}>{PROVIDER_SCENARIOS.recurring.title}</h2>
            <p className={cn(typography.body, "mt-2 text-text-secondary")}>{PROVIDER_SCENARIOS.recurring.text}</p>
            <Link
              href={SERVICE_CATALOG["recurring-care-transportation"].path}
              className={cn(typography.bodySmall, "mt-2 inline-flex min-h-11 items-center gap-1.5 font-semibold text-text-accent-on-tint hover:underline")}
            >
              Recurring care transportation
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="rounded-lg bg-surface-elevated p-lg">
            <h2 className={cn(typography.subsectionTitle, "text-text-primary")}>{PROVIDER_SCENARIOS.discharge.title}</h2>
            <p className={cn(typography.body, "mt-2 text-text-secondary")}>{PROVIDER_SCENARIOS.discharge.text}</p>
            <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-lg">
              <Link
                href={SERVICE_CATALOG["hospital-discharge-transportation"].path}
                className={cn(typography.bodySmall, "inline-flex min-h-11 items-center gap-1.5 font-semibold text-text-accent-on-tint hover:underline")}
              >
                Hospital discharge transportation
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href={DISCHARGE_CHECKLIST_HREF}
                className={cn(typography.bodySmall, "inline-flex min-h-11 items-center gap-1.5 font-semibold text-text-accent-on-tint hover:underline")}
              >
                Hospital discharge checklist
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* G. Trust — owner-confirmed standards only, from src/lib/trust.ts */}
      <Section tone="white">
        <div className="max-w-[40rem]">
          <h2 className={cn(typography.sectionTitle, "text-text-primary")}>How Zenward operates</h2>
          <p className={cn(typography.lede, "mt-4 text-text-secondary")}>What your team and your patients can expect.</p>
        </div>
        <div className="mt-2xl grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
          {PROVIDER_TRUST_ORDER.map((key) => {
            const standard = OPERATING_STANDARDS[key];
            return (
              <div key={key} className="border-t-2 border-brand-route-teal pt-4">
                <h3 className={cn(typography.body, "font-semibold text-text-primary")}>{standard.title}</h3>
                <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{standard.description}</p>
              </div>
            );
          })}
        </div>
        <p className={cn(typography.bodySmall, "mt-xl text-text-secondary")}>
          Zenward provides non-emergency transportation, not clinical care. In a medical emergency, call 911.
        </p>
      </Section>

      <Section tone="mist" narrow>
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>Questions from care teams</h2>
        <div className="mt-2xl">
          <FaqAccordion items={PROVIDER_FAQ} />
        </div>
      </Section>

      {/* H. Provider CTA: a trip request vs a general enquiry */}
      <Section tone="navy">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className={cn(typography.sectionTitle, "text-white")}>Arranging transportation for a patient?</h2>
          <p className={cn(typography.lede, "max-w-[38rem] text-white/85")}>{PROVIDER_ROUTES.request}</p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <TrackedLinkButton
              href={PROVIDER_REQUEST_HREF}
              size="lg"
              onDark
              event={{ name: "request_transportation_clicked", source: "provider_page" }}
            >
              Request Transportation
            </TrackedLinkButton>
            <CallButton surface="provider_page" onDark label={`Call Zenward ${business.phoneDisplay}`} />
          </div>
          <p className={cn(typography.bodySmall, "max-w-[38rem] text-white/80")}>
            {PROVIDER_ROUTES.enquiry}{" "}
            <Link
              href={PROVIDER_ENQUIRY_HREF}
              className="font-semibold text-white underline underline-offset-4"
              data-provider-enquiry
            >
              Send a general enquiry
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}
