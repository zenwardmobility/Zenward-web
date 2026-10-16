import type { Metadata } from "next";
import { Target, Handshake, Compass } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { BrandImage } from "@/components/layout/BrandImage";
import { brandImages } from "@/lib/images";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";
import { OPERATING_STANDARDS, type OperatingStandardKey } from "@/lib/trust";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Zenward Mobility provides non-emergency medical transportation for patients, families, caregivers, and the healthcare providers who refer them.",
  path: "/about",
});

const VALUES = [
  {
    icon: Target,
    title: "Focused on medical transportation",
    description: "Zenward exists for one purpose: dependable, non-emergency medical transportation.",
  },
  {
    icon: Handshake,
    title: "Built around the people we serve",
    description: "Patients, families, caregivers, and the healthcare organizations that refer them.",
  },
  {
    icon: Compass,
    title: "Deliberate about how we grow",
    description:
      "Zenward is expanding service availability by market, holding the same standard of coordination and care as it grows.",
  },
];

// "How Zenward operates" (ZW-WEB-04F): owner-confirmed standards only, from
// src/lib/trust.ts. No history, scale or statistics.
const OPERATING_ORDER: OperatingStandardKey[] = ["punctuality", "drivers", "care", "readiness", "communication", "licensed"];

export default function AboutPage() {
  return (
    <>
      <Section tone="mist" narrow>
        <p className={cn(typography.eyebrow, "text-text-accent-on-tint")}>About Zenward</p>
        <h1 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>Care that gets you there.</h1>
        <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
          Zenward Mobility provides non-emergency medical transportation for patients, families, caregivers, and
          the healthcare providers who refer them.
        </p>
      </Section>

      <Section tone="white">
        <div className="grid grid-cols-1 items-center gap-2xl lg:grid-cols-2">
          <BrandImage asset={brandImages.staffWalkingAssist} aspect="video" objectPosition="center 40%" />
          <div>
            <h2 className={cn(typography.sectionTitle, "text-text-primary")}>Why Zenward exists</h2>
            <p className={cn(typography.body, "mt-4 text-text-secondary")}>
              Getting to and from medical care shouldn&rsquo;t be the hardest part of a patient&rsquo;s day. Zenward
              coordinates non-emergency medical transportation so patients, families, and healthcare
              organizations have one dependable place to arrange it — with clear communication from request to
              arrival.
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
    </>
  );
}
