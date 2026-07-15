import type { MetadataRoute } from "next";

// Le blog est en noindex → volontairement absent du sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return ["", "/prendre-rdv", "/mentions-legales", "/confidentialite", "/cgv"].map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: r === "" ? 1 : 0.6,
  }));
}
