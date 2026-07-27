import type { MetadataRoute } from "next";
import { appOrigin } from "@/lib/env";
import { getPublishedProjects, getUpcomingEvents, getPastEvents } from "@/lib/public-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appOrigin();
  const staticPaths = [
    "",
    "/about",
    "/work",
    "/events",
    "/donate",
    "/register-patient",
    "/contact",
    "/privacy",
    "/terms",
  ];

  const entries: MetadataRoute.Sitemap = [];
  for (const path of staticPaths) {
    for (const locale of ["en", "hi"] as const) {
      entries.push({
        url: `${base}/${locale}${path}`,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
        alternates: {
          languages: {
            en: `${base}/en${path}`,
            hi: `${base}/hi${path}`,
          },
        },
      });
    }
  }

  const [projects, upcoming, past] = await Promise.all([
    getPublishedProjects(),
    getUpcomingEvents(50),
    getPastEvents(50),
  ]);
  for (const p of projects) {
    for (const locale of ["en", "hi"] as const) {
      entries.push({ url: `${base}/${locale}/work/${p.slug}`, priority: 0.6 });
    }
  }
  for (const e of [...upcoming, ...past]) {
    for (const locale of ["en", "hi"] as const) {
      entries.push({ url: `${base}/${locale}/events/${e.slug}`, priority: 0.5 });
    }
  }
  return entries;
}