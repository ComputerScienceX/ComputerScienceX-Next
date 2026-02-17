import { getBlogPosts, getCategories } from "@/lib/blog";
import { siteConfig } from "@/lib/config";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteConfig.url}`,
      lastModified: new Date(),
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: new Date(),
    },
    {
      url: `${siteConfig.url}/categories`,
      lastModified: new Date(),
    },
  ];

  if (!process.env.DATABASE_URL) {
    return baseEntries;
  }

  const [allPosts, categories] = await Promise.all([getBlogPosts(), getCategories()]);

  return [
    ...baseEntries,
    ...categories.map((category) => ({
      url: `${siteConfig.url}/categories/${category.slug}`,
      lastModified: new Date(),
    })),
    ...allPosts.map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      lastModified: post.publishedAt,
    })),
  ];
}
