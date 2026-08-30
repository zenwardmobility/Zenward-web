/**
 * Central SEO configuration. The production domain is not yet confirmed
 * (Zenward Platform decision register ZD-027) — do not hardcode a guessed
 * domain anywhere else in this codebase. Everything that needs the site's
 * absolute URL should import `siteUrl`/`absoluteUrl` from here, which reads
 * `NEXT_PUBLIC_SITE_URL` and falls back to a local dev URL.
 */
const DEFAULT_DEV_URL = "http://localhost:3000";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || DEFAULT_DEV_URL;

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export const siteName = "Zenward Mobility";
export const siteTagline = "Care that gets you there.";
export const siteDescription =
  "Non-emergency medical transportation for appointments, treatments, discharge journeys, and scheduled care across Georgia.";

/** Builds a consistent Metadata object for a page. Pass a page-specific title/description; everything else is derived. */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  const url = absoluteUrl(path);
  return {
    title: `${title} | ${siteName}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url,
      siteName,
      locale: "en_US",
      type: "website" as const,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${title} | ${siteName}`,
      description,
    },
  };
}
