import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { BrandImage } from "@/components/layout/BrandImage";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { CallButton } from "@/components/public/CallButton";
import { PracticalFacts } from "@/components/public/PracticalFacts";
import { ClosingCta } from "@/components/public/ClosingCta";
import { buttonClassNames } from "@/components/ui/buttonStyles";
import { typography } from "@/design/typography";
import { brandImages } from "@/lib/images";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";
import { getDefaultMarket } from "@/lib/service-area";
import { breadcrumbJsonLd } from "@/lib/service-pages";
import { SERVICES, SERVICE_ORDER } from "@/lib/services";

const market = getDefaultMarket();

export const metadata: Metadata = pageMetadata({
  title: `Non-Emergency Medical Transportation Services in ${market.name}`,
  description: `Medical appointment, dialysis, rehabilitation, hospital discharge, recurring care, senior medical and wheelchair-accessible transportation in ${market.name}, plus airport transportation. Request a quote or call Zenward Mobility.`,
  path: "/services",
});

/**
 * The service catalogue (ZW-WEB-04C; Airport Transportation added as 08 in
 * ZW-WEB-04C1): an editorial, numbered list of the approved services as
 * equal peers, not a card grid. Labels and
 * summaries come from src/lib/services.ts; the market from
 * src/lib/service-area.ts.
 */
export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])),
        }}
      />

      <Section tone="mist">
        <div className="grid grid-cols-1 items-center gap-2xl lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className={cn(typography.eyebrow, "text-brand-interactive-teal")}>Services</p>
            <h1 className={cn(typography.sectionTitle, "mt-3 text-balance text-text-primary sm:text-[2.75rem] sm:leading-[52px]")}>
              Non-Emergency Medical Transportation Services
            </h1>
            <p className={cn(typography.lede, "mt-4 max-w-[36rem] text-text-secondary")}>
              Zenward provides non-emergency medical transportation across {market.name}, from a single appointment to
              a recurring treatment schedule. Every request is reviewed by our team before availability is confirmed.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <TrackedLinkButton
                href="/request-transportation"
                size="lg"
                event={{ name: "request_transportation_clicked", source: "services_page" }}
              >
                Request a Quote
              </TrackedLinkButton>
              <CallButton variant="secondary" />
            </div>
          </div>
          <BrandImage
            asset={brandImages.staffWalkingAssist}
            aspectClass="aspect-[16/10] lg:aspect-[4/3]"
            sizes="(min-width: 1024px) 34rem, 100vw"
            objectPosition="center 38%"
          />
        </div>
      </Section>

      <PracticalFacts />

      <Section tone="white">
        <div className="max-w-[40rem]">
          <h2 className={cn(typography.sectionTitle, "text-text-primary")}>Transportation for essential care</h2>
          <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
            Seven non-emergency medical transportation services, plus pre-arranged airport transportation. Choose
            the closest fit, or call and we&rsquo;ll help.
          </p>
        </div>
        <ol className="mt-2xl border-b border-border-subtle">
          {SERVICE_ORDER.map((slug, index) => {
            const service = SERVICES[slug];
            return (
              <li
                key={slug}
                className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-4 border-t border-border-subtle py-lg sm:gap-x-lg lg:grid-cols-[3rem_1.3fr_1fr_auto] lg:items-center lg:gap-x-xl lg:py-xl"
              >
                <span
                  aria-hidden
                  className="font-display text-sm font-semibold text-text-muted tabular-nums lg:text-base"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex gap-4">
                  <span className="hidden size-11 shrink-0 items-center justify-center rounded-full bg-brand-calm-mist text-brand-care-navy sm:flex">
                    <service.icon className="size-6" weight="regular" aria-hidden />
                  </span>
                  <div>
                    <h3 className={cn(typography.subsectionTitle, "text-lg text-text-primary sm:text-xl")}>
                      <Link href={service.path} className="hover:text-brand-interactive-teal hover:underline underline-offset-4">
                        {service.label}
                      </Link>
                    </h3>
                    <p className={cn(typography.body, "mt-1 text-text-secondary")}>{service.summary}</p>
                  </div>
                </div>
                <p className={cn(typography.bodySmall, "col-start-2 text-text-secondary lg:col-start-auto")}>
                  <span className="font-semibold text-text-primary">Good fit for: </span>
                  {service.fit.join(" · ")}
                </p>
                <div className="col-start-2 flex flex-wrap items-center gap-x-lg gap-y-2 lg:col-start-auto lg:flex-col lg:items-end">
                  <Link
                    href={service.path}
                    className={cn(
                      typography.bodySmall,
                      "inline-flex min-h-11 items-center gap-1.5 font-semibold whitespace-nowrap text-brand-interactive-teal hover:underline",
                    )}
                  >
                    About this service
                    <span className="sr-only">: {service.label}</span>
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <Link
                    href={service.requestHref}
                    aria-label={`Request a quote for ${service.label}`}
                    className={buttonClassNames("outline", "md", false, "whitespace-nowrap")}
                  >
                    Request a Quote
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </Section>

      <ClosingCta
        heading="Not sure which service you need?"
        body="Call us or request a quote and choose Other. Zenward reviews every request and follows up to confirm availability and details."
        event={{ name: "request_transportation_clicked", source: "services_page" }}
      />
    </>
  );
}
