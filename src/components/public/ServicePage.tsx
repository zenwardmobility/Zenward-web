import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, Phone } from "@phosphor-icons/react/dist/ssr";
import { Section, type SectionTone } from "@/components/layout/Section";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { FaqAccordion } from "@/components/public/FaqAccordion";
import { buttonClassNames } from "@/components/ui/buttonStyles";
import { typography } from "@/design/typography";
import { business } from "@/lib/business";
import { cn } from "@/lib/cn";
import type { ServiceContent, ServiceSectionKey } from "@/lib/services";

/**
 * Shared renderer for the dedicated service landing pages (ZW-WEB-03A).
 * Every page funnels into the existing /request-transportation form — no new
 * intake, and nothing about the passenger or the trip is placed in a URL. The
 * form has no service-preselection support, so the CTA is a plain link.
 */

const REQUEST_HREF = "/request-transportation";

function PhoneLink({ className }: { className?: string }) {
  return (
    <a
      href={business.phoneHref}
      aria-label={`Call Zenward at ${business.phoneDisplay}`}
      className={buttonClassNames("outline", "lg", false, className, true)}
    >
      <Phone className="size-4" weight="fill" aria-hidden />
      Call {business.phoneDisplay}
    </a>
  );
}

function CtaRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
      <TrackedLinkButton
        href={REQUEST_HREF}
        size="lg"
        onDark
        className="w-full sm:w-auto"
        event={{ name: "request_transportation_clicked", source: "service_page" }}
      >
        Request Transportation
      </TrackedLinkButton>
      <PhoneLink className="w-full sm:w-auto" />
    </div>
  );
}

function Hero({ service }: { service: ServiceContent }) {
  const Icon = service.icon;
  return (
    <Section tone="navy-gradient">
      <div className="grid grid-cols-1 items-center gap-2xl lg:grid-cols-[1.3fr_1fr]">
        <div>
          <Link
            href="/services"
            className={cn(typography.bodySmall, "inline-flex items-center gap-1.5 text-white/75 hover:text-white")}
          >
            <ArrowLeft className="size-4" aria-hidden />
            All services
          </Link>
          <p className={cn(typography.eyebrow, "mt-6 text-brand-arrival-gold")}>{service.eyebrow}</p>
          <h1 className={cn(typography.sectionTitle, "mt-3 text-white")}>{service.h1}</h1>
          <p className={cn(typography.lede, "mt-4 max-w-[36rem] text-white/85")}>{service.lede}</p>
          <CtaRow className="mt-8" />
        </div>

        <aside
          aria-label={`${service.eyebrow} at a glance`}
          className="rounded-lg bg-white/10 p-lg ring-1 ring-white/15 sm:p-xl"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-brand-arrival-gold text-brand-care-navy">
            <Icon className="size-7" weight="regular" aria-hidden />
          </span>
          <p className={cn(typography.eyebrow, "mt-5 text-white/70")}>{service.glance.heading}</p>
          <ul className="mt-3 space-y-3">
            {service.glance.items.map((item) => (
              <li key={item} className={cn(typography.body, "flex items-start gap-3 text-white")}>
                <CheckCircle className="mt-0.5 size-5 shrink-0 text-brand-arrival-gold" weight="fill" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Section>
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
        </div>
        <ul className="space-y-3">
          {audience.points.map((point) => (
            <li
              key={point}
              className={cn(
                typography.body,
                "flex items-start gap-3 rounded-lg border border-border-subtle bg-surface-elevated p-md text-text-primary",
              )}
            >
              <CheckCircle className="mt-0.5 size-5 shrink-0 text-brand-interactive-teal" weight="fill" aria-hidden />
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
      <div className="mt-2xl grid grid-cols-1 gap-lg sm:grid-cols-2">
        {coordinate.items.map((item) => (
          <div key={item.title} className="rounded-lg border border-border-subtle bg-surface-elevated p-lg">
            <item.icon className="size-8 text-brand-interactive-teal" weight="light" aria-hidden />
            <h3 className={cn(typography.subsectionTitle, "mt-4 text-lg text-text-primary")}>{item.title}</h3>
            <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{item.description}</p>
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
        <ol className="space-y-lg">
          {expect.steps.map((step, index) => (
            <li key={step.title} className="flex items-start gap-4">
              <span
                className={cn(
                  typography.button,
                  "flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-care-navy text-white",
                )}
              >
                {index + 1}
              </span>
              <div>
                <h3 className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>{step.title}</h3>
                <p className={cn(typography.bodySmall, "mt-1 text-text-secondary")}>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
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
          <div
            key={item.title}
            className="flex flex-col rounded-lg border-l-4 border-brand-route-teal bg-surface-elevated p-lg shadow-sm"
          >
            <h3 className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>{item.title}</h3>
            <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{item.description}</p>
            {item.link && (
              <Link
                href={item.link.href}
                className={cn(
                  typography.bodySmall,
                  "mt-4 inline-flex items-center gap-1.5 font-medium text-brand-interactive-teal hover:underline",
                )}
              >
                {item.link.label}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}
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
  scenarios: Scenarios,
};

export function ServicePage({ service }: { service: ServiceContent }) {
  return (
    <>
      <Hero service={service} />

      {service.order.map((key, index) => {
        const Renderer = SECTION_RENDERERS[key];
        return <Renderer key={key} service={service} tone={index % 2 === 0 ? "white" : "mist"} />;
      })}

      <Section tone="white" narrow>
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>Common questions</h2>
        <div className="mt-2xl">
          <FaqAccordion items={service.faq} />
        </div>
        {service.related.length > 0 && (
          <div className="mt-2xl">
            <p className={cn(typography.eyebrow, "text-text-muted")}>Related</p>
            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {service.related.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex h-full items-start justify-between gap-3 rounded-lg border border-border-subtle p-md hover:bg-surface-hover"
                  >
                    <span>
                      <span className={cn(typography.body, "block font-semibold text-text-primary")}>{link.label}</span>
                      <span className={cn(typography.bodySmall, "block text-text-secondary")}>{link.blurb}</span>
                    </span>
                    <ArrowRight className="mt-1 size-4 shrink-0 text-brand-interactive-teal" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section tone="navy-gradient">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className={cn(typography.sectionTitle, "text-white")}>{service.ctaHeading}</h2>
          <p className={cn(typography.lede, "max-w-[36rem] text-white/85")}>{service.ctaBody}</p>
          <CtaRow className="w-full items-center justify-center sm:w-auto" />
          <p className={cn(typography.metadata, "max-w-[32rem] text-white/70")}>
            Zenward provides non-emergency medical transportation only. In a medical emergency, call 911.
          </p>
        </div>
      </Section>
    </>
  );
}
