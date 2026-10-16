import Link from "next/link";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { BrandImage } from "@/components/layout/BrandImage";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { CallButton } from "@/components/public/CallButton";
import { FaqAccordion } from "@/components/public/FaqAccordion";
import { ClosingCta } from "@/components/public/ClosingCta";
import { TrustStrip } from "@/components/public/TrustStrip";
import { typography } from "@/design/typography";
import { cn } from "@/lib/cn";
import type { CampaignContent } from "@/lib/campaigns";
import { getDefaultMarket } from "@/lib/service-area";
import { breadcrumbJsonLd } from "@/lib/service-pages";
import { SERVICE_CATALOG } from "@/lib/service-catalog";
import { SERVICES } from "@/lib/services";

const STEPS = [
  { title: "Request a quote", description: "Online or by phone: passenger, pickup, destination and timing." },
  { title: "We review it", description: "A member of our team reviews the trip and any mobility notes." },
  { title: "We contact you", description: "To confirm availability, next steps and pricing." },
  { title: "Your trip is confirmed", description: "Only once Zenward has confirmed the details with you." },
];

/**
 * Paid-search landing page (ZW-WEB-04D). One system for all campaign pages:
 * focused, commercially bold, and still part of the Zenward site (the
 * campaign header keeps home, Services and phone; the footer is the normal
 * site footer). Answers in seconds: what service, where, who it's for, how to
 * request, how to call, and that a request isn't a confirmed ride.
 */
export function CampaignPage({ campaign }: { campaign: CampaignContent }) {
  const market = getDefaultMarket();
  const marketPath = `/locations/${market.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: market.name, path: marketPath },
    { name: `${campaign.label} in ${market.name}`, path: campaign.path },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }} />

      {/* Hero */}
      <section className="bg-linear-to-br from-brand-care-navy via-brand-care-navy to-brand-interactive-teal py-xl text-white sm:py-3xl lg:py-4xl">
        <SectionContainer className="grid grid-cols-1 items-center gap-xl lg:grid-cols-[1.2fr_1fr] lg:gap-2xl">
          <div>
            <p className={cn(typography.eyebrow, "text-brand-arrival-gold")}>{campaign.eyebrow}</p>
            <h1 className="mt-3 text-balance font-display text-[2.125rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              {campaign.label} <span className="text-brand-arrival-gold">in {market.name}</span>
            </h1>
            <p className={cn(typography.body, "mt-4 max-w-[36rem] text-white/90 sm:text-lg sm:leading-8")}>{campaign.lede}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <TrackedLinkButton
                href={campaign.requestHref}
                size="lg"
                onDark
                className="w-full sm:w-auto"
                event={{ name: "request_transportation_clicked", source: "campaign_page" }}
              >
                Request a Quote
              </TrackedLinkButton>
              <CallButton surface="campaign_page" onDark className="w-full sm:w-auto" />
            </div>
            <p className={cn(typography.bodySmall, "mt-4 max-w-[34rem] text-white/75")}>
              A request isn&rsquo;t a confirmed ride. Zenward reviews it and contacts you to confirm availability, next
              steps and pricing.
            </p>
            {/* Owner-confirmed operating standards (ZW-WEB-04F): high on the page,
                but below the service, market, quote and phone. */}
            <TrustStrip variant="compact" tone="dark" className="mt-6 border-t border-white/15 pt-5" />
          </div>
          <BrandImage
            asset={campaign.image.asset}
            aspectClass="aspect-[16/10] lg:aspect-[4/3]"
            sizes="(min-width: 1024px) 34rem, 100vw"
            objectPosition={campaign.image.objectPosition}
            priority
            className="ring-1 ring-white/15"
          />
        </SectionContainer>
      </section>

      {/* Quick answers */}
      <section aria-label="At a glance" className="border-b border-border-subtle bg-surface-elevated">
        <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-md py-lg sm:grid-cols-2 sm:px-xl lg:grid-cols-4">
          {[`Serving ${market.name}`, ...campaign.glance].map((item) => (
            <li key={item} className={cn(typography.bodySmall, "flex items-center gap-2.5 font-semibold text-text-primary")}>
              <CheckCircle className="size-5 shrink-0 text-brand-interactive-teal" weight="fill" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Use cases */}
      <Section tone="white">
        <div className="max-w-[40rem]">
          <h2 className={cn(typography.sectionTitle, "text-text-primary")}>{campaign.useCases.heading}</h2>
          <p className={cn(typography.lede, "mt-4 text-text-secondary")}>{campaign.useCases.intro}</p>
        </div>
        <div className="mt-2xl grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-4">
          {campaign.useCases.items.map((item) => (
            <div key={item.title} className="border-t-2 border-brand-route-teal pt-4">
              <h3 className={cn(typography.body, "font-semibold text-text-primary")}>{item.title}</h3>
              <p className={cn(typography.bodySmall, "mt-1 text-text-secondary")}>{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Broad page only: the NEMT service family */}
      {campaign.serviceFamily && (
        <Section tone="mist">
          <h2 className={cn(typography.sectionTitle, "text-text-primary")}>Medical transportation services</h2>
          <ul className="mt-xl grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {campaign.serviceFamily.map((slug) => {
              const service = SERVICES[slug];
              return (
                <li key={slug}>
                  <Link
                    href={service.path}
                    className="group flex h-full items-start gap-3 rounded-lg bg-surface-elevated p-md transition-colors duration-base hover:bg-surface-app"
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
            </Link>
            .
          </p>
        </Section>
      )}

      {/* How it works */}
      <Section tone={campaign.serviceFamily ? "white" : "mist"}>
        <h2 className={cn(typography.sectionTitle, "text-text-primary")}>How it works</h2>
        <ol className="mt-2xl grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                className={cn(
                  typography.button,
                  "flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-care-navy text-base text-white",
                )}
              >
                {index + 1}
              </span>
              <div className="pt-1.5">
                <h3 className={cn(typography.body, "font-semibold text-text-primary")}>{step.title}</h3>
                <p className={cn(typography.bodySmall, "mt-1 text-text-secondary")}>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Considerations */}
      <Section tone={campaign.serviceFamily ? "mist" : "white"}>
        <div className="grid grid-cols-1 gap-xl lg:grid-cols-[1fr_2fr] lg:gap-3xl">
          <h2 className={cn(typography.sectionTitle, "text-text-primary")}>{campaign.considerations.heading}</h2>
          <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
            {campaign.considerations.items.map((item) => (
              <div key={item.title} className="border-t-2 border-brand-route-teal pt-4">
                <h3 className={cn(typography.body, "font-semibold text-text-primary")}>{item.title}</h3>
                <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FAQ + restrained links */}
      <Section tone={campaign.serviceFamily ? "white" : "mist"} narrow>
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>Common questions</h2>
        <div className="mt-2xl">
          <FaqAccordion items={campaign.faq} />
        </div>
        <nav aria-label="More from Zenward" className="mt-2xl flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-xl">
          {[
            { href: campaign.organicPath, label: campaign.organicLinkLabel },
            { href: "/services", label: "All services" },
            ...(campaign.organicPath === marketPath ? [] : [{ href: marketPath, label: `Zenward in ${market.name}` }]),
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                typography.bodySmall,
                "inline-flex min-h-11 items-center gap-1.5 font-medium text-text-accent-on-tint hover:underline",
              )}
            >
              {link.label}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          ))}
        </nav>
      </Section>

      <ClosingCta
        heading={campaign.ctaHeading}
        body={campaign.ctaBody}
        requestHref={campaign.requestHref}
        event={{ name: "request_transportation_clicked", source: "campaign_page" }}
        surface="campaign_page"
        note="Zenward provides non-emergency transportation only. In a medical emergency, call 911."
      />
    </>
  );
}
