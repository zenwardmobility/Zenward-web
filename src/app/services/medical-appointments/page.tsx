import type { Metadata } from "next";
import { ServicePage } from "@/components/public/ServicePage";
import { SERVICES } from "@/lib/services";
import { pageMetadata } from "@/lib/seo";

const service = SERVICES["medical-appointments"];

export const metadata: Metadata = pageMetadata({
  title: service.metaTitle,
  description: service.metaDescription,
  path: service.path,
});

export default function Page() {
  return <ServicePage service={service} />;
}
