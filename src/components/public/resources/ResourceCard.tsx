import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import { typography } from "@/design/typography";
import { RESOURCE_CATEGORIES, type ResourceCategory, type ResourceMeta } from "@/lib/resources/catalog";

/**
 * A restrained Resource card: category (text), title, summary, action. The whole card is one link.
 * `category` labels the card for the hub section it appears in (a Resource can be listed in more than one).
 */
export function ResourceCard({
  resource,
  headingLevel = "h3",
  category = resource.category,
}: {
  resource: ResourceMeta;
  headingLevel?: "h2" | "h3";
  category?: ResourceCategory;
}) {
  const Heading = headingLevel;
  return (
    <Link
      href={resource.path}
      className="group flex h-full flex-col rounded-lg border border-border-subtle bg-surface-elevated p-lg transition-colors duration-base hover:border-brand-interactive-teal/60 hover:bg-surface-app"
    >
      <span className={cn(typography.eyebrow, "text-text-accent-on-tint")}>{RESOURCE_CATEGORIES[category].label}</span>
      <Heading className={cn(typography.subsectionTitle, "mt-2 text-lg text-text-primary")}>{resource.title}</Heading>
      <span className={cn(typography.bodySmall, "mt-2 flex-1 text-text-secondary")}>{resource.description}</span>
      <span className={cn(typography.bodySmall, "mt-md inline-flex items-center gap-1.5 font-semibold text-text-accent-on-tint")}>
        {resource.cardAction}
        <ArrowRight className="size-4 transition-transform duration-base group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
