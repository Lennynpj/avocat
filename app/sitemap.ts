import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const pages = ["", "/prendre-rdv", "/blog", "/mentions-legales", "/confidentialite", "/cgv"].map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: r === "" ? 1 : 0.6,
  }));

  const articles = getAllArticles().map((a) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: new Date(a.updated || a.date),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  return [...pages, ...articles];
}
