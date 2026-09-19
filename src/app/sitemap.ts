import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { SERVICE_PATHS } from "@/lib/services";

const ROUTES = [
  "/",
  "/request-transportation",
  "/healthcare-providers",
  "/services",
  ...SERVICE_PATHS,
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
