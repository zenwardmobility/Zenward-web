import { SERVICES, SERVICE_ORDER } from "@/lib/services";
import { getDefaultMarket } from "@/lib/service-area";
import type { AssistantContext, ServiceSlug } from "@/lib/assistant/types";

/**
 * Canonical facts for the Transportation Assistant, built on the SERVER
 * (PublicLayout) from src/lib/services.ts (service summaries) and
 * src/lib/service-area.ts (market name), and passed to the client as a small
 * prop. The lazy-loaded panel never imports the full service-page content.
 */
export function buildAssistantContext(): AssistantContext {
  const summaries = Object.fromEntries(SERVICE_ORDER.map((slug) => [slug, SERVICES[slug].summary])) as Record<ServiceSlug, string>;
  return { marketName: getDefaultMarket().name, summaries };
}
