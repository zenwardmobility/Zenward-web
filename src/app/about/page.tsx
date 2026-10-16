import type { Metadata } from "next";
import { Target, Handshake, Compass } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { BrandImage } from "@/components/layout/BrandImage";
import { brandImages } from "@/lib/images";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";
import { OPERATING_STANDARDS, type OperatingStandardKey } from "@/lib/trust";
import { ClosingCta } from "@/components/public/ClosingCta";
import { getDefaultMarket } from "@/lib/service-area";

const market = getDefaultMarket();

export const metadata: Metadata = pageMetadata({
  title: "About Our Non-Emergency Medical Transportation",
  description: `Zenward Mobility provides non-emergency medical transportation in ${market.name} for patients, families, caregivers and the care teams who arrange their trips.`,
  path: "/about",
});

const VALUES = [
  {
    icon: Target,
    title: "Focused on medical transportation",
    description: "Zenward does one thing: scheduled, non-emergency medical transportation.",
  },
  {
    icon: Handshake,
    title: "Built around the people we serve",
    description: "Patients, families, caregivers, and the care teams who arrange transportation for patients.",
  },
  {
    icon: Compass,
    title: `Focused on ${market.name}`,
    description: `Zenward serves ${market.name}. For a specific pickup or destination, our team confirms whether the trip can be arranged.`,
  },
];

// "How Zenward operates" (ZW-WEB-04F): owner-confirmed standards only, from
// src/lib/trust.ts. No history, scale or statistics.
const OPERATING_ORDER: OperatingStandardKey[] = ["licensed", "drivers", "punctuality", "care", "wheelchair", "communication"];

export default function AboutPage() {
  return (
    <>
      <Section tone="mist" narrow>
        <p className={cn(typography.eyebrow, "text-text-accent-on-tint")}>About Zenward</p>
        <h1 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>Care that gets you there.</h1>
        <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
          Zenward Mobility provides non-emergency medical transportation in {market.name} for patients, families,
          caregivers, and the care teams who arrange their trips.
        </p>
      </Section>

      <Section tone="white">
        <div className="grid grid-cols-1 items-center gap-2xl lg:grid-cols-2">
          <BrandImage asset={brandImages.staffWalkingAssist} aspect="video" objectPosition="center 40%" />
          <div>
            <h2 className={cn(typography.sectionTitle, "text-text-primary")}>Why Zenward exists</h2>
            <p className={cn(typography.body, "mt-4 text-text-secondary")}>
              Getting to and from medical care shouldn&rsquo;t be the hardest part of a patient&rsquo;s day. Zenward
              coordinates non-emergency medical transportation so patients, families, and care teams have one
              clear place to arrange it, with a reply and a confirmation before any trip goes ahead.
            </p>
            <p className={cn(typography.body, "mt-4 text-text-secondary")}>
              Zenward provides transportation, not medical care. Our drivers don&rsquo;t provide clinical assistance,
              and Zenward does not provide ambulance, stretcher or emergency transportation. In a medical emergency,
              call 911.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <div className="grid grid-cols-1 gap-lg sm:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-lg bg-surface-elevated p-lg">
              <value.icon className="size-8 text-brand-interactive-teal" weight="light" aria-hidden />
              <p className={cn(typography.subsectionTitle, "mt-4 text-lg text-text-primary")}>{value.title}</p>
              <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{value.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="white">
        <div className="max-w-[40rem]">
          <h2 className={cn(typography.sectionTitle, "text-text-primary")}>How Zenward operates</h2>
          <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
            The standards behind every trip, for every passenger.
          </p>
        </div>
        <div className="mt-2xl grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
          {OPERATING_ORDER.map((key) => {
            const standard = OPERATING_STANDARDS[key];
            return (
              <div key={key} className="rounded-lg border border-border-subtle bg-surface-elevated p-lg">
                <h3 className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>{standard.category}</h3>
                <p className={cn(typography.bodySmall, "mt-2 text-text-secondary")}>{standard.description}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <ClosingCta
        heading="Need medical transportation?"
        body={`Request a quote or call. Zenward reviews every request in ${market.name} and follows up to confirm availability and details.`}
        event={{ name: "request_transportation_clicked", source: "about_page" }}
        surface="about_page"
      />
    </>
  );
}
