import Image from "next/image";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { typography } from "@/design/typography";
import { cn } from "@/lib/cn";
import { brandImages } from "@/lib/images";
import { business } from "@/lib/business";

const NAVY = "var(--color-brand-care-navy)";
const TEAL = "var(--color-brand-route-teal)";
const mix = (pct: number) => `color-mix(in srgb, ${NAVY} ${pct}%, transparent)`;

/**
 * Homepage hero — one continuous composition, built in three explicit layers:
 *   1. the sharp approved NEMT photograph (`brandImages.heroRampAssist`,
 *      the higher-resolution v2 asset), full-bleed via next/image `fill`
 *   2. a Care Navy → transparent gradient scrim (horizontal on desktop,
 *      vertical on mobile) — its own absolutely-positioned layer, it never
 *      touches or blurs the photograph
 *   3. the headline / copy / CTAs
 * No hard image seam, no separate rectangular photo. See
 * docs/design/brand-assets.md and reference 01-public-homepage.png.
 */
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-care-navy text-white">
      <div className="absolute inset-0 -z-10">
        {/* Layer 1: the sharp photograph. No filter, transform, or opacity is
            applied here or anywhere in this tree — the scrims below are their
            own layers. `quality={90}` because this is the LCP / primary visual. */}
        <Image
          src={brandImages.heroRampAssist.src}
          alt={brandImages.heroRampAssist.alt}
          fill
          priority
          quality={90}
          sizes="100vw"
          placeholder="blur"
          className="object-cover object-[74%_42%] lg:object-[56%_50%]"
        />
        {/* Layer 2a — Mobile / tablet: vertical Care Navy scrim. Strong at the
            top and bottom edges for text; light through the middle so the van,
            staff, passenger and ramp read clearly. */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            backgroundImage: `linear-gradient(to bottom, ${mix(82)} 0%, ${mix(38)} 36%, ${mix(50)} 66%, ${mix(92)} 100%)`,
          }}
        />
        {/* Layer 2b — Desktop: horizontal Care Navy → transparent dissolve.
            Solid navy across the far-left column (covers the background
            signage and gives the headline a clean field); dissolves through
            the middle so the faces, van, ramp and branding on the right stay
            clear. */}
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            backgroundImage: `linear-gradient(to right, ${NAVY} 0%, ${NAVY} 19%, ${mix(82)} 34%, ${mix(44)} 52%, ${mix(12)} 70%, ${mix(0)} 86%)`,
          }}
        />
        {/* Restrained Route Teal depth in the lower-left dark zone — brand character, not decoration */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(58% 68% at 0% 100%, color-mix(in srgb, ${TEAL} 24%, transparent) 0%, transparent 68%)`,
          }}
        />
        {/* Hero melts into the section below instead of ending on a hard edge */}
        <div
          className="absolute inset-x-0 bottom-0 h-24"
          style={{ backgroundImage: `linear-gradient(to bottom, transparent, var(--color-surface-app))` }}
        />
      </div>

      <SectionContainer className="flex min-h-[33rem] flex-col justify-center py-3xl sm:min-h-[38rem] lg:min-h-[40rem] lg:py-4xl">
        <div className="max-w-[38rem]">
          <p className={cn(typography.eyebrow, "text-brand-arrival-gold")}>
            Non-Emergency Medical Transportation
          </p>
          <h1 className={cn(typography.display, "mt-4 text-white")}>Care that gets you there.</h1>
          <p className={cn(typography.lede, "mt-6 max-w-[34rem] text-pretty text-white/90")}>
            Dependable medical transportation for appointments, treatments, discharge journeys, and scheduled
            care across {business.serviceArea}.
          </p>
          <p className={cn(typography.body, "mt-3 max-w-[34rem] text-white/80")}>
            Clear coordination from request to arrival.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <TrackedLinkButton
              href="/request-transportation"
              size="lg"
              onDark
              event={{ name: "request_transportation_clicked", source: "hero" }}
            >
              Request Transportation
            </TrackedLinkButton>
            <TrackedLinkButton
              href="/contact"
              size="lg"
              variant="outline"
              onDark
              event={{ name: "contact_started", topic: "general" }}
            >
              Talk to Our Team
            </TrackedLinkButton>
          </div>
          <p className={cn(typography.metadata, "mt-6 max-w-[26rem] text-white/80")}>
            For patients, families, caregivers, and healthcare providers.
          </p>
        </div>
      </SectionContainer>

      {/* Clearance so the overlapping request banner never covers hero content */}
      <div aria-hidden className="h-14 sm:h-16 lg:h-20" />
    </section>
  );
}
