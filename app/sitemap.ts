import type { MetadataRoute } from "next";

const baseUrl = "https://daangn-auto-post.pages.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/guide", "/contact", "/privacy", "/terms", "/legal"];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
