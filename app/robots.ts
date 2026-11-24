import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = `https://cpssec-ucy.github.io${process.env.NEXT_PUBLIC_BASE_PATH || ""}`;
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${base}/sitemap.xml`,
  };
}
