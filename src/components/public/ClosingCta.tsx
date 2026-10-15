import { SectionContainer } from "@/components/layout/SectionContainer";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { CallButton } from "@/components/public/CallButton";
import { typography } from "@/design/typography";
import { cn } from "@/lib/cn";
import type { AnalyticsEvent } from "@/lib/analytics/events";

/**
 * The inset Care Navy closing panel used at the end of pages (same treatment
 * as the homepage final CTA, ZW-WEB-04B), kept visually distinct from the
 * navy footer below it.
 */
export function ClosingCta({
  heading,
  body,
  requestHref = "/request-transportation",
  event,
  note,
}: {
  heading: string;
  body: string;
  requestHref?: string;
  event: Extract<AnalyticsEvent, { name: "request_transportation_clicked" }>;
  note?: string;
}) {
  return (
    <section className="bg-surface-elevated py-3xl sm:py-4xl">
      <SectionContainer>
        <div className="relative overflow-hidden rounded-lg bg-brand-care-navy px-lg py-2xl text-center sm:px-2xl sm:py-3xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(60% 80% at 100% 0%, color-mix(in srgb, var(--color-brand-route-teal) 22%, transparent) 0%, transparent 70%)",
            }}
          />
          <div className="relative flex flex-col items-center gap-6">
            <h2 className={cn(typography.sectionTitle, "text-white")}>{heading}</h2>
            <p className={cn(typography.lede, "max-w-[36rem] text-white/85")}>{body}</p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <TrackedLinkButton href={requestHref} size="lg" onDark event={event}>
                Request a Quote
              </TrackedLinkButton>
              <CallButton onDark />
            </div>
            {note && <p className={cn(typography.metadata, "max-w-[32rem] text-white/70")}>{note}</p>}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
