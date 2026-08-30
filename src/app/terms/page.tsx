import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: "Terms governing the use of the Zenward Mobility website.",
  path: "/terms",
});

/**
 * Structural placeholder. Replace with counsel-reviewed terms before
 * launch — see docs/product/marketing-scope.md.
 */
export default function TermsPage() {
  return (
    <Section tone="white" narrow>
      <p className={cn(typography.eyebrow, "text-brand-interactive-teal")}>Legal</p>
      <h1 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>Terms of Service</h1>
      <p className={cn(typography.bodySmall, "mt-4 text-text-muted")}>
        This page is a placeholder pending legal review. It does not yet reflect Zenward&rsquo;s final terms.
      </p>

      <div className="mt-2xl flex flex-col gap-xl">
        <div>
          <h2 className={cn(typography.subsectionTitle, "text-text-primary")}>This is a website, not a booking</h2>
          <p className={cn(typography.body, "mt-2 text-text-secondary")}>
            Submitting a transportation request or contact message through this site is a request for
            information or service. It is not a confirmed booking, and does not guarantee vehicle or driver
            availability.
          </p>
        </div>
        <div>
          <h2 className={cn(typography.subsectionTitle, "text-text-primary")}>Not for emergencies</h2>
          <p className={cn(typography.body, "mt-2 text-text-secondary")}>
            Zenward provides non-emergency medical transportation only. If you are experiencing a medical
            emergency, call 911.
          </p>
        </div>
        <div>
          <h2 className={cn(typography.subsectionTitle, "text-text-primary")}>Site use</h2>
          <p className={cn(typography.body, "mt-2 text-text-secondary")}>
            This website is provided for informational purposes and to submit transportation requests and
            inquiries. Content on this site is subject to change as Zenward&rsquo;s service launches and
            develops.
          </p>
        </div>
        <div>
          <h2 className={cn(typography.subsectionTitle, "text-text-primary")}>Contact</h2>
          <p className={cn(typography.body, "mt-2 text-text-secondary")}>
            Questions about these terms can be sent through our{" "}
            <a href="/contact" className="text-brand-interactive-teal underline">
              contact page
            </a>
            .
          </p>
        </div>
      </div>
    </Section>
  );
}
