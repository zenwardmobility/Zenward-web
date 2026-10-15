import type { MetadataRoute } from "next";
import { siteName, siteDescription } from "@/lib/seo";

/**
 * Web app manifest (ZW-WEB-04C). Icons are the locked Zenward app icons in
 * public/brand/, referenced as supplied.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: "Zenward",
    description: siteDescription,
    start_url: "/",
    display: "browser",
    background_color: "#f6f9fa",
    theme_color: "#123447",
    icons: [
      { src: "/brand/zenward-app-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/zenward-app-icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/zenward-app-icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
