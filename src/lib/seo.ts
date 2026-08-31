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

/**
 * The canonical social-share image. Generated at build time from
 * `src/app/opengraph-image.jpg` (Next serves it at `/opengraph-image.jpg`).
 * Referenced explicitly here because a page-level `openGraph` object replaces
 * — rather than merges with — the file-convention image, so nested routes
 * would otherwise lose it.
 */
export const ogImage = {
  url: absoluteUrl("/opengraph-image.jpg"),
  width: 1200,
  height: 630,
  alt: 'Zenward Mobility — "Care that gets you there." A navy Zenward Mobility van with its side ramp deployed while a staff member assists an older passenger using a walker.',
} as const;

/**
 * Builds a consistent Metadata object for a page. Pass a page-specific
 * title/description; everything else is derived. `title` is returned bare so
 * the root layout's `%s | Zenward Mobility` template adds the suffix exactly
 * once.
 */
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
  const fullTitle = `${title} | ${siteName}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName,
      locale: "en_US",
      type: "website" as const,
      images: [{ url: ogImage.url, width: ogImage.width, height: ogImage.height, alt: ogImage.alt }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: fullTitle,
      description,
      images: [ogImage.url],
    },
  };
}
