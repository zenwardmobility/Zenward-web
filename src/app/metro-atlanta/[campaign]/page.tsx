import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignPage } from "@/components/public/CampaignPage";
import { CAMPAIGNS } from "@/lib/campaigns";
import { CAMPAIGN_SLUGS, type CampaignSlug } from "@/lib/campaign-routes";
import { campaignMetadata } from "@/lib/service-pages";

/**
 * Paid-search landing pages for the current market (ZW-WEB-04D). Only the
 * four configured campaigns exist; any other slug 404s. The folder name is
 * the market slug (`CAMPAIGN_MARKET_SLUG`, test-checked against the market
 * config).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return CAMPAIGN_SLUGS.map((campaign) => ({ campaign }));
}

type Params = { params: Promise<{ campaign: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { campaign } = await params;
  const content = CAMPAIGNS[campaign as CampaignSlug];
  return content ? campaignMetadata(content) : {};
}

export default async function Page({ params }: Params) {
  const { campaign } = await params;
  const content = CAMPAIGNS[campaign as CampaignSlug];
  if (!content) notFound();
  return <CampaignPage campaign={content} />;
}
