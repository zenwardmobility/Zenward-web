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

/** Vertical Care Navy scrim for the portrait (mobile) crop — strong over the
 *  light building at the top, light through the subject band, soft anchor at
 *  the bottom for the fine print. */
const SCRIM_PORTRAIT = `linear-gradient(to bottom, ${mix(86)} 0%, ${mix(66)} 24%, ${mix(34)} 48%, ${mix(34)} 70%, ${mix(58)} 100%)`;

/** Horizontal Care Navy → transparent dissolve for the full-bleed landscape
 *  crop (lg … < 1600). Solid at the far left; held heavy through the mid-left
 *  so the van's own door lettering stays a faint watermark behind the copy;
 *  clear by ~63% so the staff member, passenger and ramp stay sharp. */
const SCRIM_FULLBLEED = `linear-gradient(to right, ${NAVY} 0%, ${NAVY} 19%, ${mix(86)} 38%, ${mix(56)} 52%, ${mix(20)} 63%, transparent 82%)`;

/** For ultrawide (≥ 1600) the photograph is a capped region anchored right,
 *  not a full-bleed layer. This dissolve is relative to *that region*: solid
 *  navy at its left edge (a seamless join with the Care Navy field to its
 *  left), dissolving across the region's left ~half so there is no hard
 *  seam and the headline stays readable where the two meet. */
const SCRIM_ULTRAWIDE = `linear-gradient(to right, ${NAVY} 0%, ${NAVY} 12%, ${mix(72)} 30%, ${mix(30)} 46%, transparent 64%)`;

const SCRIM_TEAL = `radial-gradient(58% 68% at 0% 100%, color-mix(in srgb, ${TEAL} 22%, transparent) 0%, transparent 68%)`;
const FADE_BOTTOM = `linear-gradient(to bottom, transparent, var(--color-surface-app))`;

/**
 * Homepage hero — one continuous composition, art-directed per viewport class
 * rather than a single photo stretched to every aspect ratio. Three layers:
 *
 *   1. the sharp approved NEMT photograph — two dedicated crops of one shoot:
 *        · < lg   → 9:16 portrait crop, full-bleed
 *        · ≥ lg   → 16:9 landscape crop:
 *            lg … < 1600  full-bleed (compact + normal desktop, different
 *                         object-position per range)
 *            ≥ 1600       a capped region anchored to the right (≈ 60vw,
 *                         max ~1312px so the ~1376px source is never
 *                         upscaled); Care Navy fills the space to its left
 *      Only one <Image> is active per breakpoint (CSS), and each `sizes`
 *      string reflects the real coverage so the preload scanner never
 *      fetches an inactive crop at full size.
 *   2. a Care Navy → transparent gradient scrim, its own layer — never
 *      touches or blurs the photograph, and always broad enough that there
 *      is no dark-rectangle / image-rectangle seam.
 *   3. the headline / copy / CTAs, in the shared max-width content grid.
 *
 * See docs/design/brand-assets.md and reference 01-public-homepage.png.
 */
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-care-navy text-white">
      {/* Layer 1 — portrait crop, < lg. Full-bleed. */}
      <div className="absolute inset-0 -z-10 lg:hidden">
        <Image
          src={brandImages.heroMobile.src}
          alt={brandImages.heroMobile.alt}
          fill
          priority
          quality={90}
          sizes="(min-width: 1024px) 1px, 100vw"
          placeholder="blur"
          className="object-cover object-[50%_48%]"
        />
        <div className="absolute inset-0" style={{ backgroundImage: SCRIM_PORTRAIT }} />
      </div>

      {/* Layer 1 — landscape crop, ≥ lg. Full-bleed lg … < 1600; capped
          right-anchored region ≥ 1600. */}
      <div className="absolute inset-y-0 right-0 -z-10 hidden w-full lg:block min-[1600px]:w-[62vw] min-[1600px]:max-w-[82rem]">
        <Image
          src={brandImages.heroDesktop.src}
          alt={brandImages.heroDesktop.alt}
          fill
          priority
          quality={90}
          sizes="(min-width: 2120px) 1312px, (min-width: 1600px) 62vw, (min-width: 1024px) 100vw, 1px"
          placeholder="blur"
          className="object-cover object-[66%_40%] xl:object-[74%_42%] min-[1600px]:object-[56%_36%]"
        />
        <div className="absolute inset-0 min-[1600px]:hidden" style={{ backgroundImage: SCRIM_FULLBLEED }} />
        <div className="absolute inset-0 hidden min-[1600px]:block" style={{ backgroundImage: SCRIM_ULTRAWIDE }} />
      </div>

      {/* Shared brand-character + section blend, full width, above the photo
          layers but behind the content. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{ backgroundImage: SCRIM_TEAL }} />
        <div className="absolute inset-x-0 bottom-0 h-24" style={{ backgroundImage: FADE_BOTTOM }} />
      </div>

      <SectionContainer className="flex min-h-[33rem] flex-col justify-center py-3xl sm:min-h-[36rem] lg:min-h-[38rem] xl:min-h-[40rem] xl:py-4xl min-[1600px]:min-h-[42rem] min-[1600px]:max-w-[92rem]">
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
