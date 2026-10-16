import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourcePage } from "@/components/public/resources/ResourcePage";
import { pageMetadata } from "@/lib/seo";
import { RESOURCES, getResource } from "@/lib/resources/catalog";

/** The six launch Resources (ZW-WEB-04K). Statically generated; any other slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return RESOURCES.map((resource) => ({ slug: resource.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resource = getResource((await params).slug);
  if (!resource) return {};
  const base = pageMetadata({ title: resource.seoTitle, description: resource.seoDescription, path: resource.path });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: resource.publishedDate,
      modifiedTime: resource.updatedDate,
    },
  };
}

export default async function ResourceRoute({ params }: Params) {
  const resource = getResource((await params).slug);
  if (!resource) notFound();
  return <ResourcePage resource={resource} />;
}
