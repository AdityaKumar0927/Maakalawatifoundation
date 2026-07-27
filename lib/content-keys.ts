/**
 * Registry of admin-editable bilingual site copy. Each key has its default
 * text in messages/{en,hi}.json under the "content" namespace; rows in the
 * SiteContent table override the defaults. The admin content editor renders
 * from this registry, so adding a key here (plus defaults in both message
 * files) is all it takes to make a new piece of copy editable.
 */

export type ContentGroup =
  | "Hero"
  | "Mission & pillars"
  | "Impact numbers"
  | "Story spotlight"
  | "About page"
  | "Donation page"
  | "Get involved"
  | "Contact";

export interface ContentKeyDef {
  key: string;
  group: ContentGroup;
  label: string;
  multiline?: boolean;
}

export const contentKeys = [
  { key: "hero.badge", group: "Hero", label: "Small badge above the headline" },
  { key: "hero.title", group: "Hero", label: "Headline" },
  { key: "hero.subtitle", group: "Hero", label: "Sub-headline", multiline: true },

  { key: "mission.heading", group: "Mission & pillars", label: "Mission section heading" },
  { key: "mission.intro", group: "Mission & pillars", label: "Mission introduction", multiline: true },
  { key: "pillar.healthcare.title", group: "Mission & pillars", label: "Healthcare — title" },
  { key: "pillar.healthcare.desc", group: "Mission & pillars", label: "Healthcare — description", multiline: true },
  { key: "pillar.education.title", group: "Mission & pillars", label: "Education — title" },
  { key: "pillar.education.desc", group: "Mission & pillars", label: "Education — description", multiline: true },
  { key: "pillar.women.title", group: "Mission & pillars", label: "Women empowerment — title" },
  { key: "pillar.women.desc", group: "Mission & pillars", label: "Women empowerment — description", multiline: true },
  { key: "pillar.community.title", group: "Mission & pillars", label: "Community welfare — title" },
  { key: "pillar.community.desc", group: "Mission & pillars", label: "Community welfare — description", multiline: true },

  { key: "stats.1.value", group: "Impact numbers", label: "Stat 1 — number" },
  { key: "stats.1.label", group: "Impact numbers", label: "Stat 1 — label" },
  { key: "stats.2.value", group: "Impact numbers", label: "Stat 2 — number" },
  { key: "stats.2.label", group: "Impact numbers", label: "Stat 2 — label" },
  { key: "stats.3.value", group: "Impact numbers", label: "Stat 3 — number" },
  { key: "stats.3.label", group: "Impact numbers", label: "Stat 3 — label" },
  { key: "stats.4.value", group: "Impact numbers", label: "Stat 4 — number" },
  { key: "stats.4.label", group: "Impact numbers", label: "Stat 4 — label" },

  { key: "story.heading", group: "Story spotlight", label: "Section heading" },
  { key: "story.name", group: "Story spotlight", label: "Person's name (leave empty to hide the section)" },
  { key: "story.text", group: "Story spotlight", label: "Their story", multiline: true },

  { key: "about.lead", group: "About page", label: "Opening line", multiline: true },
  { key: "about.story1", group: "About page", label: "Our story — paragraph 1", multiline: true },
  { key: "about.story2", group: "About page", label: "Our story — paragraph 2", multiline: true },
  { key: "about.story3", group: "About page", label: "Our story — paragraph 3", multiline: true },
  { key: "about.mission", group: "About page", label: "Mission statement", multiline: true },
  { key: "about.vision", group: "About page", label: "Vision statement", multiline: true },

  { key: "donate.intro", group: "Donation page", label: "Introduction", multiline: true },
  { key: "donate.impact1.amount", group: "Donation page", label: "Impact tier 1 — amount (e.g. ₹500)" },
  { key: "donate.impact1.text", group: "Donation page", label: "Impact tier 1 — what it does" },
  { key: "donate.impact2.amount", group: "Donation page", label: "Impact tier 2 — amount" },
  { key: "donate.impact2.text", group: "Donation page", label: "Impact tier 2 — what it does" },
  { key: "donate.impact3.amount", group: "Donation page", label: "Impact tier 3 — amount" },
  { key: "donate.impact3.text", group: "Donation page", label: "Impact tier 3 — what it does" },

  { key: "getinvolved.heading", group: "Get involved", label: "Heading" },
  { key: "getinvolved.text", group: "Get involved", label: "Text", multiline: true },

  { key: "contact.address", group: "Contact", label: "Postal address", multiline: true },
  { key: "contact.landmark", group: "Contact", label: "Landmark / how to reach" },
] as const satisfies readonly ContentKeyDef[];

export type ContentKey = (typeof contentKeys)[number]["key"];

/** Wide-typed view for consumers that read optional fields (e.g. multiline). */
export const contentKeyDefs: readonly ContentKeyDef[] = contentKeys;

export const contentKeySet: ReadonlySet<string> = new Set(contentKeys.map((k) => k.key));
