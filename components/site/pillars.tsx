import type { ProjectCategory } from "@prisma/client";

/** Visual identity of the four pillars: colour pair + icon. */

export const pillarOrder = [
  "HEALTHCARE",
  "EDUCATION",
  "WOMEN_EMPOWERMENT",
  "COMMUNITY_WELFARE",
] as const;

export const pillarStyle: Record<
  ProjectCategory,
  { fg: string; bg: string; contentKey: "healthcare" | "education" | "women" | "community" }
> = {
  HEALTHCARE: {
    fg: "var(--color-cat-health)",
    bg: "var(--color-cat-health-soft)",
    contentKey: "healthcare",
  },
  EDUCATION: {
    fg: "var(--color-cat-edu)",
    bg: "var(--color-cat-edu-soft)",
    contentKey: "education",
  },
  WOMEN_EMPOWERMENT: {
    fg: "var(--color-cat-women)",
    bg: "var(--color-cat-women-soft)",
    contentKey: "women",
  },
  COMMUNITY_WELFARE: {
    fg: "var(--color-cat-comm)",
    bg: "var(--color-cat-comm-soft)",
    contentKey: "community",
  },
};

export function PillarIcon({
  category,
  size = 26,
}: {
  category: ProjectCategory;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (category) {
    case "HEALTHCARE":
      return (
        <svg {...common}>
          <path d="M12 20.5S4 15.5 4 9.8C4 7 6.2 5 8.7 5c1.4 0 2.6.7 3.3 1.8C12.7 5.7 14 5 15.3 5 17.8 5 20 7 20 9.8c0 5.7-8 10.7-8 10.7Z" />
          <path d="M7.5 11.5h2.4l1-1.8 1.8 3.6 1-1.8h2.8" />
        </svg>
      );
    case "EDUCATION":
      return (
        <svg {...common}>
          <path d="M12 6.5C10.6 5.3 8.7 4.8 6.7 4.8c-1 0-2 .1-2.7.4v13c.7-.3 1.7-.4 2.7-.4 2 0 3.9.5 5.3 1.7 1.4-1.2 3.3-1.7 5.3-1.7 1 0 2 .1 2.7.4v-13c-.7-.3-1.7-.4-2.7-.4-2 0-3.9.5-5.3 1.7Z" />
          <path d="M12 6.5v13" />
        </svg>
      );
    case "WOMEN_EMPOWERMENT":
      return (
        <svg {...common}>
          <circle cx="12" cy="7.5" r="3.5" />
          <path d="M12 11v8.5M8.5 16h7" />
        </svg>
      );
    case "COMMUNITY_WELFARE":
      return (
        <svg {...common}>
          <circle cx="8" cy="8.5" r="2.5" />
          <circle cx="16" cy="8.5" r="2.5" />
          <path d="M3.5 19c.6-3 2.3-4.5 4.5-4.5S12 16 12.5 19M11.5 19c.6-3 2.3-4.5 4.5-4.5s3.9 1.5 4.5 4.5" />
        </svg>
      );
  }
}
