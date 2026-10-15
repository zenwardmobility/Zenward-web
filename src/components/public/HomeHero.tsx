import Image from "next/image";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { CallButton } from "@/components/public/CallButton";
import { typography } from "@/design/typography";
import { cn } from "@/lib/cn";
import { brandImages } from "@/lib/images";
import { heroHeadlineLines, servingLine } from "@/lib/service-area";

const NAVY = "var(--color-brand-care-navy)";
const TEAL = "var(--color-brand-route-teal)";
const mix = (pct: number) => `color-mix(in srgb, ${NAVY} ${pct}%, transparent)`;

/** Vertical Care Navy scrim for phones and tablets (< lg), where the copy
 *  spans most of the width. Held fairly even (ZW-WEB-04B2): the white van is
 *  far brighter than the previous navy-van photo, so the support copy and
 *  CTAs need a consistent dark field; the passenger, staff member and van
 *  stay visible underneath. */
const SCRIM_PORTRAIT = `linear-gradient(to bottom, ${mix(88)} 0%, ${mix(80)} 30%, ${mix(72)} 55%, ${mix(66)} 78%, ${mix(74)} 100%)`;

/** Horizontal Care Navy → transparent dissolve for the full-bleed landscape
 *  crop (lg … < 1600). Solid at the far left; held heavy through the
 *  mid-left because the white van (ZW-WEB-04B2 hero) is much brighter than
 *  the previous navy van, and the H1's first line reaches ~65% of the width;
 *  the door lettering stays a dim watermark behind the copy. Eases off from
 *  ~60% so the passenger and staff member stay sharp. */
const SCRIM_FULLBLEED = `linear-gradient(to right, ${NAVY} 0%, ${NAVY} 22%, ${mix(90)} 40%, ${mix(72)} 54%, ${mix(36)} 64%, ${mix(8)} 76%, transparent 88%)`;

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
  // The market comes from the central config (src/lib/service-area.ts).
  const headline = heroHeadlineLines();
  const serving = servingLine();
  // ZW-WEB-04B2: the hero uses the general-NEMT photograph (branded van,
  // passenger with a walker, staff member, medical-office building) rather
  // than the wheelchair/ramp scene, so the first screen reads as broad NEMT.
  // The wheelchair/ramp crops stay registered for the wheelchair page (04C).
  const photo = brandImages.vanWalkerAssist;
  return (
    <section className="relative isolate overflow-hidden bg-brand-care-navy text-white">
      {/* Layer 1 — portrait crop, < lg. Full-bleed. */}
      <div className="absolute inset-0 -z-10 lg:hidden">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority
          quality={90}
          sizes="(min-width: 1024px) 1px, 100vw"
          placeholder="blur"
          className="object-cover object-[74%_50%]"
        />
        <div className="absolute inset-0" style={{ backgroundImage: SCRIM_PORTRAIT }} />
      </div>

      {/* Layer 1 — landscape crop, ≥ lg. Full-bleed lg … < 1600; capped
          right-anchored region ≥ 1600. */}
      <div className="absolute inset-y-0 right-0 -z-10 hidden w-full lg:block min-[1600px]:w-[62vw] min-[1600px]:max-w-[82rem]">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority
          quality={90}
          sizes="(min-width: 2120px) 1312px, (min-width: 1600px) 62vw, (min-width: 1024px) 100vw, 1px"
          placeholder="blur"
          className="object-cover object-[50%_62%] min-[1600px]:object-[60%_60%]"
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

      <SectionContainer className="flex min-h-[32rem] flex-col justify-center py-2xl sm:min-h-[36rem] sm:py-3xl lg:min-h-[38rem] xl:min-h-[40rem] xl:py-4xl min-[1600px]:min-h-[42rem] min-[1600px]:max-w-[92rem]">
        <div>
          {/* 1. Market eyebrow — small and quiet; the H1 carries the weight. */}
          <p className={cn(typography.eyebrow, "text-brand-calm-mist")}>{serving}</p>
          {/* 2. The H1: three designed lines, "Transportation" in Arrival Gold.
                 One semantic heading; the spans only control the line breaks. */}
          <h1 className="mt-4 font-display text-[clamp(2.5rem,10.8vw,3rem)] font-bold leading-[1.04] tracking-tight text-white sm:text-[3.5rem] lg:text-[3.75rem] xl:text-[4.25rem]">
            <span className="block">{headline.lead}</span>{" "}
            <span className="block text-brand-arrival-gold">{headline.accent}</span>{" "}
            <span className="block">
              {headline.tailPrefix} <span className="whitespace-nowrap">{headline.marketName}</span>
            </span>
          </h1>
          {/* 3. The brand signature — quieter than the headline, not a second headline. */}
          <p className="mt-4 font-display text-lg font-semibold leading-7 text-white/80 sm:text-xl">
            Care that gets you there.
          </p>
          {/* 4. Plain-language use cases. Wheelchair is one of them, not the headline. */}
          <p className={cn(typography.body, "mt-4 max-w-[34rem] text-pretty text-white/90 sm:text-lg sm:leading-8")}>
            Transportation for medical appointments, dialysis, rehabilitation, hospital discharge, recurring
            care and wheelchair-accessible trips.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <TrackedLinkButton
              href="/request-transportation"
              size="lg"
              onDark
              event={{ name: "request_transportation_clicked", source: "hero" }}
            >
              Request a Quote
            </TrackedLinkButton>
            <CallButton onDark />
          </div>
        </div>
      </SectionContainer>

      {/* Clearance so the overlapping request banner never covers hero content */}
      <div aria-hidden className="h-14 sm:h-16 lg:h-20" />
    </section>
  );
}
