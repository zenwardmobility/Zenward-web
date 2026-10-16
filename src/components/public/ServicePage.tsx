import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Section, type SectionTone } from "@/components/layout/Section";
import { BrandImage } from "@/components/layout/BrandImage";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { CallButton } from "@/components/public/CallButton";
import { FaqAccordion } from "@/components/public/FaqAccordion";
import { PracticalFacts } from "@/components/public/PracticalFacts";
import { ClosingCta } from "@/components/public/ClosingCta";
import { TrustStrip } from "@/components/public/TrustStrip";
import { typography } from "@/design/typography";
import { cn } from "@/lib/cn";
import { getDefaultMarket } from "@/lib/service-area";
import { serviceJsonLd } from "@/lib/service-pages";
import { SERVICES, type ServiceContent, type ServiceSectionKey } from "@/lib/services";

/**
 * Shared renderer for the seven service pages (ZW-WEB-03A; rebuilt in
 * ZW-WEB-04C). One system, controlled variation: each page supplies its own
 * photo, section order, considerations, FAQ and related services.
 *
 * Every page funnels into the existing /request-transportation form. The CTA
 * carries only an allow-listed `?service=` label (see `requestHrefFor`) so the
 * form can preselect the service; nothing about the passenger or the trip is
 * ever placed in a URL.
 */

function Hero({ service }: { service: ServiceContent }) {
  const market = getDefaultMarket();
  return (
    // Tighter top/bottom padding than a standard Section on phones, so the
    // CTAs land early (04A S-07).
    <section className="bg-linear-to-br from-brand-care-navy via-brand-care-navy to-brand-interactive-teal py-xl text-white sm:py-3xl lg:py-4xl">
      <SectionContainer className="grid grid-cols-1 items-center gap-xl lg:grid-cols-[1.15fr_1fr] lg:gap-2xl">
        <div>
          <Link
            href="/services"
            className={cn(typography.bodySmall, "inline-flex min-h-11 items-center gap-1.5 text-white/75 hover:text-white")}
          >
            <ArrowLeft className="size-4" aria-hidden />
            All services
          </Link>
          <p className={cn(typography.eyebrow, "mt-3 text-brand-arrival-gold")}>
            {service.heroEyebrow ?? "Non-Emergency Medical Transportation"}
          </p>
          <h1 className={cn(typography.sectionTitle, "mt-3 text-balance text-white sm:text-[2.75rem] sm:leading-[52px]")}>
            {service.label} <span className="text-white/80">in {market.name}</span>
          </h1>
          <p className={cn(typography.body, "mt-4 max-w-[36rem] text-white/85 sm:text-lg sm:leading-8")}>{service.lede}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <TrackedLinkButton
              href={service.requestHref}
              size="lg"
              onDark
              className="w-full sm:w-auto"
              event={{ name: "request_transportation_clicked", source: "service_page" }}
            >
              Request a Quote
            </TrackedLinkButton>
            <CallButton surface="service_page" onDark className="w-full sm:w-auto" />
          </div>
          {service.intakeNote && (
            <p className={cn(typography.bodySmall, "mt-4 max-w-[34rem] text-white/80")}>{service.intakeNote}</p>
          )}
        </div>
        <BrandImage
          asset={service.image.asset}
          aspectClass="aspect-[16/10] lg:aspect-[4/3]"
          sizes="(min-width: 1024px) 34rem, 100vw"
          objectPosition={service.image.objectPosition}
          className="ring-1 ring-white/15"
        />
      </SectionContainer>
    </section>
  );
}

function Audience({ service, tone }: { service: ServiceContent; tone: SectionTone }) {
  const { audience } = service;
  return (
    <Section tone={tone}>
      <div className="grid grid-cols-1 gap-xl lg:grid-cols-[1fr_1.2fr] lg:gap-3xl">
        <div>
          <h2 className={cn(typography.sectionTitle, "text-text-primary")}>{audience.heading}</h2>
          <p className={cn(typography.lede, "mt-4 text-text-secondary")}>{audience.intro}</p>
          <h3 className={cn(typography.eyebrow, "mt-xl text-brand-interactive-teal")}>A good fit for</h3>
          <ul className="mt-3 space-y-2">
            {service.fit.map((item) => (
              <li key={item} className={cn(typography.body, "flex items-start gap-2.5 text-text-primary")}>
                <CheckCircle className="mt-1 size-5 shrink-0 text-brand-interactive-teal" weight="fill" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <ul className="divide-y divide-border-subtle self-start border-y border-border-subtle">
          {audience.points.map((point) => (
            <li key={point} className={cn(typography.body, "py-4 text-text-primary")}>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function Coordinate({ service, tone }: { service: ServiceContent; tone: SectionTone }) {
  const { coordinate } = service;
  return (
    <Section tone={tone}>
      <h2 className={cn(typography.sectionTitle, "text-text-primary")}>{coordinate.heading}</h2>
      <div className="mt-2xl grid grid-cols-1 gap-x-2xl gap-y-xl sm:grid-cols-2">
        {coordinate.items.map((item) => (
          <div key={item.title} className="flex gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-calm-mist text-brand-care-navy">
              <item.icon className="size-6" weight="regular" aria-hidden />
            </span>
            <div>
              <h3 className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>{item.title}</h3>
              <p className={cn(typography.body, "mt-1 text-text-secondary")}>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Expect({ service, tone }: { service: ServiceContent; tone: SectionTone }) {
  const { expect } = service;
  return (
    <Section tone={tone}>
      <div className="grid grid-cols-1 gap-xl lg:grid-cols-[1fr_1.4fr] lg:gap-3xl">
        <div>
          <h2 className={cn(typography.sectionTitle, "text-text-primary")}>{expect.heading}</h2>
          <p className={cn(typography.lede, "mt-4 text-text-secondary")}>{expect.intro}</p>
        </div>
        <ol>
          {expect.steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-5 pb-xl last:pb-0">
              {index < expect.steps.length - 1 && (
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
  );
}

function Considerations({ service, tone }: { service: ServiceContent; tone: SectionTone }) {
  const { considerations } = service;
  return (
    <Section tone={tone}>
      <div className="grid grid-cols-1 gap-xl lg:grid-cols-[1fr_2fr] lg:gap-3xl">
        <h2 className={cn(typography.sectionTitle, "text-text-primary")}>{considerations.heading}</h2>
        <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
          {considerations.items.map((item) => (
            <div key={item.title} className="border-t-2 border-brand-route-teal pt-4">
              <h3 className={cn(typography.body, "font-semibold text-text-primary")}>{item.title}</h3>
              <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Scenarios({ service, tone }: { service: ServiceContent; tone: SectionTone }) {
  const { scenarios } = service;
  return (
    <Section tone={tone}>
      <h2 className={cn(typography.sectionTitle, "text-text-primary")}>{scenarios.heading}</h2>
      <div className="mt-2xl grid grid-cols-1 gap-lg md:grid-cols-3">
        {scenarios.items.map((item) => (
          <div key={item.title} className="rounded-lg border-l-4 border-brand-route-teal bg-surface-elevated p-lg shadow-sm">
            <h3 className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>{item.title}</h3>
            <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{item.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

const SECTION_RENDERERS: Record<
  ServiceSectionKey,
  (props: { service: ServiceContent; tone: SectionTone }) => React.JSX.Element
> = {
  audience: Audience,
  coordinate: Coordinate,
  expect: Expect,
  considerations: Considerations,
  scenarios: Scenarios,
};

function Related({ service, tone }: { service: ServiceContent; tone: SectionTone }) {
  return (
    <Section tone={tone}>
      <h2 className={cn(typography.sectionTitle, "text-text-primary")}>Related services</h2>
      <ul className="mt-xl grid grid-cols-1 gap-lg md:grid-cols-3">
        {service.related.map((slug) => {
          const related = SERVICES[slug];
          return (
            <li key={slug}>
              <Link
                href={related.path}
                className="group flex h-full gap-4 rounded-lg border border-border-subtle bg-surface-elevated p-lg transition-colors duration-base hover:border-brand-interactive-teal/50"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-calm-mist text-brand-care-navy">
                  <related.icon className="size-6" weight="regular" aria-hidden />
                </span>
                <span>
                  <span className={cn(typography.body, "flex items-start gap-2 font-semibold text-text-primary")}>
                    {related.label}
                    <ArrowRight
                      className="mt-1.5 size-4 shrink-0 text-brand-interactive-teal transition-transform duration-base group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                  <span className={cn(typography.bodySmall, "mt-1 block text-text-secondary")}>{related.summary}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

export function ServicePage({ service }: { service: ServiceContent }) {
  // Sections alternate white/mist; the FAQ and related services continue the
  // alternation so two bands of the same tone never sit together.
  const faqTone: SectionTone = service.order.length % 2 === 0 ? "white" : "mist";
  const relatedTone: SectionTone = faqTone === "mist" ? "white" : "mist";
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd(service)) }} />
      <Hero service={service} />
      <PracticalFacts surface="service_page" />

      {service.order.map((key, index) => {
        const Renderer = SECTION_RENDERERS[key];
        return <Renderer key={key} service={service} tone={index % 2 === 0 ? "white" : "mist"} />;
      })}

      <Section tone={faqTone} narrow>
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>Common questions</h2>
        <div className="mt-2xl">
          <FaqAccordion items={service.faq} />
        </div>
      </Section>

      <Related service={service} tone={relatedTone} />

      {/* Compact operating standards (ZW-WEB-04F), right before the closing CTA. */}
      <div className="border-t border-border-subtle bg-surface-elevated">
        <SectionContainer className="pt-xl">
          <TrustStrip variant="compact" />
        </SectionContainer>
      </div>

      <ClosingCta
        heading={service.ctaHeading}
        body={service.ctaBody}
        requestHref={service.requestHref}
        event={{ name: "request_transportation_clicked", source: "service_page" }}
        surface="service_page"
        note={service.closingNote ?? "Zenward provides non-emergency medical transportation only. In a medical emergency, call 911."}
      />
    </>
  );
}
