import type { Metadata } from "next";
import { ServicePage } from "@/components/public/ServicePage";
import { SERVICES } from "@/lib/services";
import { serviceMetadata } from "@/lib/service-pages";

const service = SERVICES["senior-medical-transportation"];

export const metadata: Metadata = serviceMetadata(service);

export default function Page() {
  return <ServicePage service={service} />;
}
