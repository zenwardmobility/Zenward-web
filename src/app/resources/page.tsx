import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { ClosingCta } from "@/components/public/ClosingCta";
import { ResourceCard } from "@/components/public/resources/ResourceCard";
import { typography } from "@/design/typography";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/service-pages";
import { RESOURCES, RESOURCE_CATEGORIES, categoriesOf, type ResourceCategory } from "@/lib/resources/catalog";

export const metadata: Metadata = pageMetadata({
  title: "Medical Transportation Resources & Guides",
  description:
    "Practical guides, checklists and planning tools for arranging non-emergency medical transportation in Metro Atlanta, for riders, families, caregivers and care teams.",
  path: "/resources",
});

const SECTIONS: ResourceCategory[] = ["riders-families", "providers", "tools"];

/**
 * Zenward Resources hub (ZW-WEB-04K): a small knowledge centre, not a blog
 * feed. Featured guide, then three audience sections. No search (six
 * Resources browse well by category), no dates or engagement counts on cards,
 * no stock thumbnails.
 */
export default function ResourcesHubPage() {
  const featured = RESOURCES.find((resource) => resource.featured)!;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "Resources", path: "/resources" }])) }} />

      <Section tone="mist">
        <div className="max-w-[44rem]">
          <p className={cn(typography.eyebrow, "text-text-accent-on-tint")}>Resources</p>
          <h1 className={cn(typography.sectionTitle, "mt-3 text-balance text-text-primary")}>
            Practical guidance for planning medical transportation
          </h1>
          <p className={cn(typography.lede, "mt-4 text-text-secondary")}>
            Plain-language guides, checklists and planning tools for riders, families, caregivers and the care teams who
            arrange their trips.
          </p>
        </div>

        <Link
          href={featured.path}
          className="group mt-2xl flex flex-col gap-3 rounded-lg border border-brand-care-navy/10 bg-surface-elevated p-lg shadow-sm transition-shadow duration-base hover:shadow-md sm:p-xl"
        >
          <span className={cn(typography.eyebrow, "text-text-accent-on-tint")}>Featured guide</span>
          <h2 className={cn(typography.subsectionTitle, "text-text-primary sm:text-3xl sm:leading-10")}>{featured.title}</h2>
          <span className={cn(typography.body, "max-w-[40rem] text-text-secondary")}>{featured.description}</span>
          <span className={cn(typography.bodySmall, "inline-flex items-center gap-1.5 font-semibold text-text-accent-on-tint")}>
            {featured.cardAction}
            <ArrowRight className="size-4 transition-transform duration-base group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      </Section>

      {SECTIONS.map((category, index) => {
        // A Resource can be listed in more than one section (same URL; e.g. the discharge checklist).
        const items = RESOURCES.filter((resource) => categoriesOf(resource).includes(category) && !resource.featured);
        return (
          <Section key={category} tone={index % 2 === 0 ? "white" : "mist"} aria-labelledby={`section-${category}`}>
            <div className="max-w-[40rem]">
              <h2 id={`section-${category}`} className={cn(typography.sectionTitle, "text-text-primary")}>
                {RESOURCE_CATEGORIES[category].label}
              </h2>
              <p className={cn(typography.body, "mt-2 text-text-secondary")}>{RESOURCE_CATEGORIES[category].blurb}</p>
            </div>
            <ul className="mt-xl grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
              {items.map((resource) => (
                <li key={resource.slug}>
                  <ResourceCard resource={resource} category={category} />
                </li>
              ))}
            </ul>
            {category === "riders-families" && (
              <p className={cn(typography.bodySmall, "mt-lg text-text-secondary")}>
                Arranging a ride in Metro Atlanta?{" "}
                <Link href="/locations/metro-atlanta" className="font-semibold text-text-accent-on-tint underline-offset-4 hover:underline">
                  How Zenward works in Metro Atlanta
                </Link>
              </p>
            )}
            {category === "providers" && (
              <p className={cn(typography.bodySmall, "mt-lg text-text-secondary")}>
                Arranging transportation for patients regularly?{" "}
                <Link href="/healthcare-providers" className="font-semibold text-text-accent-on-tint underline-offset-4 hover:underline">
                  How Zenward works with healthcare providers
                </Link>
              </p>
            )}
          </Section>
        );
      })}

      <ClosingCta
        heading="Ready to request transportation?"
        body="Send the trip details and our team will review them and contact you."
        event={{ name: "request_transportation_clicked", source: "resource_page" }}
        surface="resource_page"
      />
    </>
  );
}
