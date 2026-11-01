import Link from "next/link";
import { ArrowLeft, CheckCircle, ClipboardText, Info, Repeat, UsersThree, Wheelchair } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { BrandImage } from "@/components/layout/BrandImage";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { CallButton } from "@/components/public/CallButton";
import { FaqAccordion } from "@/components/public/FaqAccordion";
import { PracticalFacts } from "@/components/public/PracticalFacts";
import { ClosingCta } from "@/components/public/ClosingCta";
import { TrustStrip } from "@/components/public/TrustStrip";
import { AssistanceLevelExplainer } from "@/components/public/AssistanceLevelExplainer";
import { ServiceRelated } from "@/components/public/ServicePage";
import { typography } from "@/design/typography";
import { cn } from "@/lib/cn";
import { business } from "@/lib/business";
import { brandImages } from "@/lib/images";
import { serviceJsonLd } from "@/lib/service-pages";
import type { ServiceContent } from "@/lib/services";
import { WHEELCHAIR_PAGE as PAGE } from "@/lib/wheelchair-page";

const CALL_LABEL = `Call ${business.phoneDisplay}`;
const AUDIENCE_ICONS = [Wheelchair, UsersThree, Repeat, ClipboardText];

/** An approved photograph with a visible caption. Never cropped: the frame matches the photo's own aspect ratio. */
function Photo({
  image,
  caption,
  aspectClass,
  sizes,
}: {
  image: keyof typeof brandImages;
  caption: string;
  aspectClass: string;
  sizes: string;
}) {
  return (
    <figure>
      <BrandImage asset={brandImages[image]} aspectClass={aspectClass} sizes={sizes} />
      <figcaption className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{caption}</figcaption>
    </figure>
  );
}

function Paragraphs({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {items.map((text) => (
        <p key={text} className={cn(typography.body, "text-text-secondary")}>
          {text}
        </p>
      ))}
    </div>
  );
}

/**
 * The wheelchair-accessible transportation page (ZENWARD-WEB-SERVICE-WHEELCHAIR-01).
 * Its own owner-approved structure, built from the same parts as the shared
 * ServicePage: the illustrative hero, the real vehicle and its features, who
 * it helps, trips, what to expect, the request steps, the market, FAQ and the
 * closing CTA. Every request CTA goes to the existing quote form with the
 * allow-listed ?service= value; nothing else is placed in a URL.
 */
export function WheelchairServicePage({ service }: { service: ServiceContent }) {
  const requestEvent = { name: "request_transportation_clicked", source: "service_page" } as const;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd(service)) }} />

      {/* 1. Hero */}
      <section className="bg-linear-to-br from-brand-care-navy via-brand-care-navy to-brand-interactive-teal py-xl text-white sm:py-3xl lg:py-4xl">
        <SectionContainer className="grid grid-cols-1 items-center gap-xl lg:grid-cols-[1.1fr_1fr] lg:gap-2xl">
          <div>
            <Link href="/services" className={cn(typography.bodySmall, "inline-flex min-h-11 items-center gap-1.5 text-white/75 hover:text-white")}>
              <ArrowLeft className="size-4" aria-hidden />
              All services
            </Link>
            <p className={cn(typography.eyebrow, "mt-3 text-brand-arrival-gold")}>{PAGE.hero.eyebrow}</p>
            <h1 className={cn(typography.sectionTitle, "mt-3 text-balance text-white sm:text-[2.75rem] sm:leading-[52px]")}>{PAGE.hero.heading}</h1>
            <div className="mt-4 flex max-w-[36rem] flex-col gap-3">
              {PAGE.hero.paragraphs.map((text) => (
                <p key={text} className={cn(typography.body, "text-white/85 sm:text-lg sm:leading-8")}>
                  {text}
                </p>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <TrackedLinkButton href={service.requestHref} size="lg" onDark className="w-full sm:w-auto" event={requestEvent}>
                {PAGE.requestLabel}
              </TrackedLinkButton>
              <CallButton surface="service_page" onDark className="w-full sm:w-auto" label={CALL_LABEL} />
            </div>
          </div>
          {/* Illustrative (AI-generated) scene: 4:3 shown whole on desktop; a 16:10 crop on smaller screens keeps the van, ramp, passenger and assistant in frame. */}
          <figure>
            <BrandImage
              asset={brandImages[PAGE.hero.image]}
              aspectClass="aspect-[16/10] lg:aspect-[4/3]"
              sizes="(min-width: 1024px) 34rem, 100vw"
              priority
              objectPosition="50% 60%"
              className="ring-1 ring-white/15"
            />
            <figcaption className={cn(typography.metadata, "mt-2 text-white/75")}>{PAGE.hero.caption}</figcaption>
          </figure>
        </SectionContainer>
      </section>
      <PracticalFacts surface="service_page" />

      {/* 2. Meet our vehicle + vehicle features */}
      <Section tone="white">
        <div className="grid grid-cols-1 items-center gap-xl lg:grid-cols-[1fr_1.15fr] lg:gap-3xl">
          <div>
            <h2 className={cn(typography.sectionTitle, "text-text-primary")}>{PAGE.vehicle.heading}</h2>
            <Paragraphs items={PAGE.vehicle.paragraphs} className="mt-4" />
          </div>
          <Photo
            image={PAGE.vehicle.exterior.image}
            caption={PAGE.vehicle.exterior.caption}
            aspectClass="aspect-4/3"
            sizes="(min-width: 1024px) 38rem, 100vw"
          />
        </div>
        <div className="mx-auto mt-3xl grid max-w-[64rem] grid-cols-1 gap-2xl md:grid-cols-2 md:gap-xl">
          {PAGE.vehicle.features.map((feature) => (
            <div key={feature.heading} className="flex flex-col gap-md rounded-lg border border-border-subtle bg-surface-elevated p-md sm:p-lg">
              <Photo
                image={feature.image}
                caption={feature.caption}
                aspectClass="aspect-3/4"
                sizes="(min-width: 1024px) 30rem, (min-width: 768px) 50vw, 100vw"
              />
              <h3 className={cn(typography.subsectionTitle, "text-text-primary")}>{feature.heading}</h3>
              <p className={cn(typography.body, "text-text-secondary")}>{feature.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 3. Who it helps */}
      <Section tone="mist">
        <div className="grid grid-cols-1 gap-xl lg:grid-cols-[1.1fr_1fr] lg:gap-3xl">
          <div>
            <h2 className={cn(typography.sectionTitle, "text-text-primary")}>{PAGE.audience.heading}</h2>
            <Paragraphs items={PAGE.audience.paragraphs} className="mt-4" />
          </div>
          <ul className="grid grid-cols-1 gap-md self-start sm:grid-cols-2">
            {PAGE.audience.cards.map((text, index) => {
              const Icon = AUDIENCE_ICONS[index];
              return (
                <li key={text} className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface-elevated p-lg">
                  <span className="flex size-11 items-center justify-center rounded-full bg-brand-calm-mist text-brand-care-navy">
                    <Icon className="size-6" weight="regular" aria-hidden />
                  </span>
                  <span className={cn(typography.body, "font-semibold text-text-primary")}>{text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>

      {/* 4. Medical trips */}
      <Section tone="white">
        <h2 className={cn(typography.sectionTitle, "max-w-[48rem] text-text-primary")}>{PAGE.trips.heading}</h2>
        <p className={cn(typography.lede, "mt-4 max-w-[44rem] text-text-secondary")}>{PAGE.trips.intro}</p>
        <ul className="mt-xl grid grid-cols-1 gap-x-xl gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {PAGE.trips.items.map((item) => (
            <li key={item} className={cn(typography.body, "flex items-start gap-2.5 text-text-primary")}>
              <CheckCircle className="mt-1 size-5 shrink-0 text-brand-interactive-teal" weight="fill" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <p className={cn(typography.bodySmall, "mt-xl flex max-w-[44rem] gap-2.5 rounded-lg border border-border-subtle bg-surface-app px-4 py-3 text-text-primary")}>
          <Info className="mt-0.5 size-5 shrink-0 text-text-accent-on-tint" aria-hidden />
          <span>{PAGE.trips.note}</span>
        </p>
      </Section>

      {/* 5. What to expect, with the seating photograph */}
      <Section tone="mist">
        <div className="grid grid-cols-1 gap-xl lg:grid-cols-[1.2fr_1fr] lg:gap-3xl">
          <div>
            <h2 className={cn(typography.sectionTitle, "text-text-primary")}>{PAGE.expect.heading}</h2>
            <Paragraphs items={PAGE.expect.paragraphs} className="mt-4" />
          </div>
          <div className="flex flex-col gap-md self-start rounded-lg border border-border-subtle bg-surface-elevated p-md sm:p-lg">
            <Photo
              image={PAGE.expect.seating.image}
              caption={PAGE.expect.seating.caption}
              aspectClass="aspect-3/4"
              sizes="(min-width: 1024px) 28rem, 100vw"
            />
            <h3 className={cn(typography.subsectionTitle, "text-text-primary")}>{PAGE.expect.seating.heading}</h3>
            <p className={cn(typography.body, "text-text-secondary")}>{PAGE.expect.seating.text}</p>
          </div>
        </div>
      </Section>

      {/* Pickup & assistance levels (canonical source, ZW-WEB-04G3): none is guaranteed for every booking. */}
      <Section tone="white">
        <AssistanceLevelExplainer variant="full" requestHref={service.requestHref} />
      </Section>

      {/* 6. How to request */}
      <Section tone="mist">
        <h2 className={cn(typography.sectionTitle, "text-text-primary")}>{PAGE.steps.heading}</h2>
        <ol className="mt-2xl grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-4">
          {PAGE.steps.items.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3">
              <span
                className={cn(
                  typography.button,
                  "flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-care-navy text-base text-white",
                )}
              >
                <span className="sr-only">Step </span>
                {index + 1}
              </span>
              <h3 className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>{step.title}</h3>
              <p className={cn(typography.body, "text-text-secondary")}>{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 7. Metro Atlanta */}
      <Section tone="white" narrow>
        <h2 className={cn(typography.sectionTitle, "text-text-primary")}>{PAGE.area.heading}</h2>
        <Paragraphs items={PAGE.area.paragraphs} className="mt-4" />
        <p className={cn(typography.body, "mt-4 text-text-secondary")}>
          {PAGE.area.linked.map((part) =>
            typeof part === "string" ? (
              part
            ) : (
              <Link key={part.href} href={part.href} className="font-semibold text-text-accent-on-tint underline underline-offset-4">
                {part.label}
              </Link>
            ),
          )}
        </p>
      </Section>

      {/* 8. FAQ (no FAQPage schema) */}
      <Section tone="mist" narrow>
        <h2 className={cn(typography.sectionTitle, "text-center text-text-primary")}>{PAGE.faqHeading}</h2>
        <div className="mt-2xl">
          <FaqAccordion items={[...PAGE.faq]} />
        </div>
      </Section>

      <ServiceRelated service={service} tone="white" />

      <div className="border-t border-border-subtle bg-surface-elevated">
        <SectionContainer className="pt-xl">
          <TrustStrip variant="compact" />
        </SectionContainer>
      </div>

      {/* 9. Final CTA */}
      <ClosingCta
        heading={PAGE.closing.heading}
        body={PAGE.closing.body}
        requestHref={service.requestHref}
        requestLabel={PAGE.requestLabel}
        callLabel={CALL_LABEL}
        event={requestEvent}
        surface="service_page"
        note="Zenward provides non-emergency medical transportation only. In a medical emergency, call 911."
      />
    </>
  );
}
