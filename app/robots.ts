import type { MetadataRoute } from "next";
import { appOrigin } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/set-locale"],
      },
    ],
    sitemap: `${appOrigin()}/sitemap.xml`,
  };
}