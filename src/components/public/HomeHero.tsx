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
 *   1. the sharp approved NEMT photograph — two dedicated crops of the same
 *      shoot: a 16:9 desktop composition and a 9:16 portrait mobile
 *      composition. Only one is rendered per breakpoint (CSS), and each
 *      `sizes` string collapses to a placeholder width at the other
 *      breakpoint so the preload scanner does not fetch both at full size.
 *   2. a Care Navy → transparent gradient scrim (horizontal on desktop,
 *      vertical on mobile) — its own absolutely-positioned layer; it never
 *      touches or blurs the photograph.
 *   3. the headline / copy / CTAs.
 * No hard image seam, no separate rectangular photo. See
 * docs/design/brand-assets.md and reference 01-public-homepage.png.
 */
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-care-navy text-white">
      <div className="absolute inset-0 -z-10">
        {/* Layer 1 — mobile / tablet crop (portrait). Rendered < lg only. */}
        <Image
          src={brandImages.heroMobile.src}
          alt={brandImages.heroMobile.alt}
          fill
          priority
          quality={90}
          sizes="(min-width: 1024px) 1px, 100vw"
          placeholder="blur"
          className="object-cover object-[50%_48%] lg:hidden"
        />
        {/* Layer 1 — desktop crop (16:9). Rendered >= lg only. */}
        <Image
          src={brandImages.heroDesktop.src}
          alt={brandImages.heroDesktop.alt}
          fill
          priority
          quality={90}
          sizes="(min-width: 1024px) 100vw, 1px"
          placeholder="blur"
          className="hidden object-cover object-[75%_42%] lg:block"
        />

        {/* Layer 2a — Mobile / tablet: vertical Care Navy scrim. Strong through
            the headline zone (over the light building), light through the
            middle so the van, wheelchair passenger, staff and ramp read
            clearly, with a soft anchor at the bottom for the fine print. */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            backgroundImage: `linear-gradient(to bottom, ${mix(86)} 0%, ${mix(66)} 24%, ${mix(34)} 48%, ${mix(34)} 70%, ${mix(58)} 100%)`,
          }}
        />
        {/* Layer 2b — Desktop: horizontal Care Navy → transparent dissolve.
            Solid navy across the far left; held heavy through the mid-left so
            the van's own door lettering reads as a faint watermark behind the
            copy rather than competing with it; fully clear by ~63% so the
            staff member, passenger, and ramp on the right stay sharp. */}
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            backgroundImage: `linear-gradient(to right, ${NAVY} 0%, ${NAVY} 19%, ${mix(86)} 38%, ${mix(56)} 52%, ${mix(20)} 63%, ${mix(0)} 82%)`,
          }}
        />
        {/* Restrained Route Teal depth in the lower-left dark zone — brand character, not decoration */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(58% 68% at 0% 100%, color-mix(in srgb, ${TEAL} 22%, transparent) 0%, transparent 68%)`,
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
