import type { Metadata } from "next";
import { WheelchairServicePage } from "@/components/public/WheelchairServicePage";
import { SERVICES } from "@/lib/services";
import { pageMetadata } from "@/lib/seo";
import { WHEELCHAIR_SEO } from "@/lib/wheelchair-page";

const service = SERVICES["wheelchair-transportation"];

// Owner-approved title and description (ZENWARD-WEB-SERVICE-WHEELCHAIR-01) instead of the generic serviceMetadata().
export const metadata: Metadata = pageMetadata({ title: WHEELCHAIR_SEO.title, description: WHEELCHAIR_SEO.description, path: service.path });

export default function Page() {
  return <WheelchairServicePage service={service} />;
}
