import Link from "next/link";
import { ArrowRight, CaretRight, Info } from "@phosphor-icons/react/dist/ssr";
import { Section } from "@/components/layout/Section";
import { TrackedLinkButton } from "@/components/public/TrackedLinkButton";
import { ClosingCta } from "@/components/public/ClosingCta";
import { ResourceCard } from "@/components/public/resources/ResourceCard";
import { TripChecklist } from "@/components/public/resources/TripChecklist";
import { typography } from "@/design/typography";
import { cn } from "@/lib/cn";
import { siteName } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/service-pages";
import { getDefaultMarket } from "@/lib/service-area";
import { RESOURCE_CATEGORIES, categoriesOf, getResource, requestCtaFor, type ResourceMeta } from "@/lib/resources/catalog";
import { RESOURCE_BODIES, type ResourceBlock } from "@/lib/resources/content";
import { resourceArticleJsonLd } from "@/lib/resources/schema";

const KIND_LABEL: Record<ResourceMeta["kind"], string> = { guide: "Guide", checklist: "Checklist", tool: "Planning tool" };

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
}

function Block({ block }: { block: ResourceBlock }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 id={block.id} className={cn(typography.subsectionTitle, "scroll-mt-28 pt-md text-text-primary")}>
          {block.text}
        </h2>
      );
    case "p":
      return <p className={cn(typography.body, "text-text-secondary")}>{block.text}</p>;
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List className={cn(typography.body, "flex flex-col gap-1.5 pl-6 text-text-secondary", block.ordered ? "list-decimal" : "list-disc")}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </List>
      );
    }
    case "checklist":
      return (
        <ul className="flex flex-col divide-y divide-border-subtle rounded-lg border border-border-subtle bg-surface-elevated px-md">
          {block.items.map((item) => (
            <li key={item.label} className="flex items-start gap-3 py-3">
              <span aria-hidden className="mt-1 size-4 shrink-0 rounded-sm border-2 border-brand-care-navy" />
              <span>
                <span className={cn(typography.body, "block font-semibold text-text-primary")}>{item.label}</span>
                {item.hint && <span className={cn(typography.bodySmall, "block text-text-secondary")}>{item.hint}</span>}
              </span>
            </li>
          ))}
        </ul>
      );
    case "faq":
      return (
        <dl className="flex flex-col gap-md">
          {block.items.map((item) => (
            <div key={item.question}>
              <dt className={cn(typography.body, "font-semibold text-text-primary")}>{item.question}</dt>
              <dd className={cn(typography.body, "mt-1 text-text-secondary")}>{item.answer}</dd>
            </div>
          ))}
        </dl>
      );
    case "note":
      return (
        <p className={cn(typography.bodySmall, "flex gap-2.5 rounded-lg border border-border-subtle bg-surface-app px-4 py-3 text-text-primary")}>
          <Info className="mt-0.5 size-5 shrink-0 text-text-accent-on-tint" aria-hidden />
          <span>{block.text}</span>
        </p>
      );
  }
}

/**
 * One reusable Resource template (ZW-WEB-04K): breadcrumbs, category, H1,
 * intro, publisher + dates, optional contents, body, one contextual service
 * bridge, related Resources and a final CTA. Server-rendered; only the
 * trip-checklist tool is interactive. Print hides site chrome and CTAs.
 */
export function ResourcePage({ resource }: { resource: ResourceMeta }) {
  const body = RESOURCE_BODIES[resource.slug];
  const cta = requestCtaFor(resource);
  const market = getDefaultMarket();
  const headings = body.blocks.filter((b): b is Extract<ResourceBlock, { type: "h2" }> => b.type === "h2");
  const related = resource.relatedResources.map((slug) => getResource(slug)).filter((r): r is ResourceMeta => Boolean(r));
  const isTool = resource.kind === "tool";
  const crumbs = [
    { name: "Resources", path: "/resources" },
    { name: resource.title, path: resource.path },
  ];
  const jsonLd = resource.kind === "tool" ? [breadcrumbJsonLd(crumbs)] : [resourceArticleJsonLd(resource), breadcrumbJsonLd(crumbs)];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Section tone="mist" narrow className="print:bg-white print:py-0">
        <nav aria-label="Breadcrumb" className="print:hidden">
          <ol className={cn(typography.bodySmall, "flex flex-wrap items-center gap-1 text-text-secondary")}>
            <li>
              <Link href="/resources" className="inline-flex min-h-11 items-center font-medium text-text-accent-on-tint underline-offset-4 hover:underline">
                Resources
              </Link>
            </li>
            <li aria-hidden>
              <CaretRight className="size-3.5" />
            </li>
            <li aria-current="page" className="line-clamp-1 text-text-primary">
              {resource.title}
            </li>
          </ol>
        </nav>
        <p className={cn(typography.eyebrow, "mt-3 text-text-accent-on-tint")}>
          {categoriesOf(resource)
            .map((category) => RESOURCE_CATEGORIES[category].label)
            .join(" · ")}{" "}
          · {KIND_LABEL[resource.kind]}
        </p>
        <h1 className={cn(typography.sectionTitle, "mt-3 text-balance text-text-primary")}>{resource.title}</h1>
        <p className={cn(typography.lede, "mt-4 text-text-secondary")}>{body.intro}</p>
        <p className={cn(typography.metadata, "mt-4 text-text-muted-on-tint")}>
          Published by {siteName} · Published <time dateTime={resource.publishedDate}>{formatDate(resource.publishedDate)}</time> · Updated{" "}
          <time dateTime={resource.updatedDate}>{formatDate(resource.updatedDate)}</time>
        </p>
      </Section>

      <Section tone="white" narrow className="print:py-4">
        {headings.length >= 4 && (
          <nav aria-labelledby="contents-heading" className="mb-xl rounded-lg border border-border-subtle bg-surface-app p-md print:hidden">
            <h2 id="contents-heading" className={cn(typography.label, "text-text-primary")}>
              On this page
            </h2>
            <ul className="mt-1 flex flex-col">
              {headings.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className={cn(typography.bodySmall, "inline-flex min-h-11 items-center text-text-accent-on-tint underline-offset-4 hover:underline")}>
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="flex flex-col gap-md">
          {body.blocks.map((block, index) => (
            <Block key={index} block={block} />
          ))}
          {body.tool && <TripChecklist items={body.tool} />}
        </div>

        <p className={cn(typography.metadata, "mt-xl hidden text-text-secondary print:block")}>
          {siteName} · Non-emergency medical transportation in {market.name}
        </p>

        {/* One contextual bridge to the most relevant service (not for the tool, whose final CTA is the bridge). */}
        {!isTool && (
          <aside aria-labelledby="bridge-heading" className="mt-2xl rounded-lg border-l-4 border-brand-route-teal bg-surface-app p-lg print:hidden">
            <h2 id="bridge-heading" className={cn(typography.subsectionTitle, "text-lg text-text-primary")}>
              {body.bridge.heading}
            </h2>
            <p className={cn(typography.body, "mt-2 text-text-secondary")}>{body.bridge.text}</p>
            <div className="mt-md flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-lg">
              <TrackedLinkButton href={cta.href} size="md" event={{ name: "request_transportation_clicked", source: "resource_page" }}>
                {cta.label}
              </TrackedLinkButton>
              <Link href={cta.about.href} className={cn(typography.bodySmall, "inline-flex min-h-11 items-center gap-1.5 font-semibold text-text-accent-on-tint hover:underline")}>
                {cta.about.label}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </aside>
        )}
      </Section>

      {related.length > 0 && (
        <Section tone="mist" className="print:hidden">
          <h2 className={cn(typography.sectionTitle, "text-text-primary")}>Related resources</h2>
          <ul className="mt-xl grid grid-cols-1 gap-lg md:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <ResourceCard resource={item} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="print:hidden">
        <ClosingCta
          heading={isTool ? body.bridge.heading : "Ready to request transportation?"}
          body={isTool ? body.bridge.text : `Zenward Mobility provides non-emergency medical transportation in ${market.name}. Send the trip details and our team will review them and contact you.`}
          requestHref={cta.href}
          event={{ name: "request_transportation_clicked", source: "resource_page" }}
          surface="resource_page"
        />
      </div>
    </>
  );
}
