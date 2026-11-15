import type { MetadataRoute } from "next";
import { CATEGORIES, categoryHref } from "@/lib/categories";
import { getAllArticles } from "@/lib/news";
import { SITE_URL } from "@/lib/site";



type SitemapEntry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "hourly",
      priority: 1,
    },
    ...CATEGORIES.filter((category) => category.slug !== "top-stories").map(
      (category): SitemapEntry => ({
        url: `${SITE_URL}${categoryHref(category)}`,
        changeFrequency: "hourly",
        priority: 0.7,
      })
    ),
  ];

  try {
    const articles = await getAllArticles();

    for (const article of articles) {
      entries.push({
        url: `${SITE_URL}/news/${article.slug}`,
        lastModified: article.updatedAt || article.publishedAt || undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // If the API is unreachable the sitemap still lists the static pages.
  }

  return entries;
}