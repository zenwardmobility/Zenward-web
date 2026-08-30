import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { ContactForm } from "@/components/public/ContactForm";
import { typography } from "@/design/typography";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Get in touch with Zenward Mobility — patients, families, caregivers, and healthcare providers.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <Section tone="mist" narrow>
        <p className={cn(typography.eyebrow, "text-brand-interactive-teal")}>Contact</p>
        <h1 className={cn(typography.sectionTitle, "mt-3 text-text-primary")}>Talk to our team</h1>
        <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
          Whether you have a question, need support, or want to talk about transportation coordination for your
          organization, we&rsquo;d like to hear from you.
        </p>
        <p className={cn(typography.bodySmall, "mt-3 text-text-muted")}>
          For medical emergencies, call 911. Zenward does not provide emergency transportation.
        </p>
      </Section>

      <Section tone="white" narrow>
        <ContactForm />
      </Section>
    </>
  );
}
