import type { MetadataRoute } from "next";
import { getAllModules } from "@/lib/modules";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://cpssec-ucy.github.io${process.env.NEXT_PUBLIC_BASE_PATH || ""}`;
  const now = new Date("2026-11-24T00:00:00Z");

  const pages = ["", "/curriculum/", "/lab/", "/glossary/", "/citations/", "/about/"].map((route) => ({
    url: route === "" ? `${base}/` : `${base}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : 0.7,
  }));

  const modules = getAllModules().map((learningModule) => ({
    url: `${base}/learn/${learningModule.slug}/`,
    lastModified: new Date(`${learningModule.updated}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...pages, ...modules];
}
