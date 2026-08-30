import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Zenward Mobility handles information submitted through this website.",
  path: "/privacy",
});

/**
 * Structural placeholder. This page does not make specific compliance
 * claims (HIPAA, licensing, etc.) because none have been legally reviewed
 * or confirmed yet — see docs/product/marketing-scope.md. Replace with
 * counsel-reviewed content before launch.
 */
export default function PrivacyPage() {
  return (
    <Section tone="white" narrow>
      <p className={cn(typography.eyebrow, "text-brand-interactive-teal")}>Legal</p>
      <h1 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>Privacy Policy</h1>
      <p className={cn(typography.bodySmall, "mt-4 text-text-muted")}>
        This page is a placeholder pending legal review. It does not yet reflect Zenward&rsquo;s final privacy
        practices.
      </p>

      <div className="mt-2xl flex flex-col gap-xl">
        <div>
          <h2 className={cn(typography.subsectionTitle, "text-text-primary")}>Information we collect</h2>
          <p className={cn(typography.body, "mt-2 text-text-secondary")}>
            When you submit a transportation request or contact message through this site, we collect the
            information you provide — such as your name, contact details, and the details of the transportation
            you&rsquo;re requesting — in order to respond to you.
          </p>
        </div>
        <div>
          <h2 className={cn(typography.subsectionTitle, "text-text-primary")}>How we use it</h2>
          <p className={cn(typography.body, "mt-2 text-text-secondary")}>
            Information submitted through this site is used to follow up on your request or message. It is not
            sold to third parties.
          </p>
        </div>
        <div>
          <h2 className={cn(typography.subsectionTitle, "text-text-primary")}>Analytics</h2>
          <p className={cn(typography.body, "mt-2 text-text-secondary")}>
            This site may use privacy-conscious analytics to understand how visitors use it. Analytics never
            receive passenger names, contact details, pickup or destination addresses, or medical/visit
            information submitted in a transportation request.
          </p>
        </div>
        <div>
          <h2 className={cn(typography.subsectionTitle, "text-text-primary")}>Contact</h2>
          <p className={cn(typography.body, "mt-2 text-text-secondary")}>
            Questions about this policy can be sent through our{" "}
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
