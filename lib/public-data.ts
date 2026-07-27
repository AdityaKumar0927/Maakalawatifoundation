import "server-only";
import { cache } from "react";
import type { Announcement, Event, Project } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Read-side queries for the public site. Every function fails open to an
 * empty result so a database hiccup degrades the page, never downs it.
 */

export const getActiveAnnouncements = cache(async (): Promise<Announcement[]> => {
  try {
    const now = new Date();
    return await prisma.announcement.findMany({
      where: {
        active: true,
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gte: now } }],
      },
      orderBy: { startsAt: "desc" },
      take: 3,
    });
  } catch {
    return [];
  }
});

export const getUpcomingEvents = cache(async (limit = 3): Promise<Event[]> => {
  try {
    return await prisma.event.findMany({
      where: { published: true, startAt: { gte: new Date(Date.now() - 12 * 3600 * 1000) } },
      orderBy: { startAt: "asc" },
      take: limit,
    });
  } catch {
    return [];
  }
});

export const getPastEvents = cache(async (limit = 12): Promise<Event[]> => {
  try {
    return await prisma.event.findMany({
      where: { published: true, startAt: { lt: new Date(Date.now() - 12 * 3600 * 1000) } },
      orderBy: { startAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
});

export const getEventBySlug = cache(async (slug: string): Promise<Event | null> => {
  try {
    return await prisma.event.findFirst({ where: { slug, published: true } });
  } catch {
    return null;
  }
});

export const getFeaturedProjects = cache(async (limit = 3): Promise<Project[]> => {
  try {
    return await prisma.project.findMany({
      where: { published: true, featured: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
    });
  } catch {
    return [];
  }
});

export const getPublishedProjects = cache(async (): Promise<Project[]> => {
  try {
    return await prisma.project.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    return [];
  }
});

export const getProjectBySlug = cache(async (slug: string): Promise<Project | null> => {
  try {
    return await prisma.project.findFirst({ where: { slug, published: true } });
  } catch {
    return null;
  }
});