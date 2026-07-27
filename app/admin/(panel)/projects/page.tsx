import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/guard";
import {
  AdminPage,
  Card,
  EmptyState,
  ErrorBanner,
  PrimaryLink,
  SavedBanner,
} from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/buttons";
import { deleteProject } from "@/app/admin/(panel)/projects/actions";

export const metadata = { title: "Projects" };

const CATEGORY_LABELS: Record<string, string> = {
  HEALTHCARE: "Healthcare",
  EDUCATION: "Education",
  WOMEN_EMPOWERMENT: "Women empowerment",
  COMMUNITY_WELFARE: "Community welfare",
};

const ERRORS: Record<string, string> = {
  fields: "Please check the project fields and try again.",
  slug: "The web address (slug) must be lowercase words separated by dashes.",
  "slug-taken": "Another project already uses that web address — pick a different slug.",
  missing: "That project no longer exists.",
};

function describeError(error: string): string {
  if (ERRORS[error]) return ERRORS[error];
  try {
    return decodeURIComponent(error);
  } catch {
    return error;
  }
}

export default async function ProjectsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdminPage();
  const { saved, error } = await searchParams;
  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <AdminPage
      title="Projects"
      action={<PrimaryLink href="/admin/projects/new">+ New project</PrimaryLink>}
    >
      {saved && <SavedBanner message="Project saved." />}
      {error && <ErrorBanner message={describeError(error)} />}

      {projects.length === 0 ? (
        <EmptyState>
          No projects yet. Projects showcase the foundation&apos;s work on the public site.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-semibold text-ink">
                  {project.titleEn}
                  {project.featured && (
                    <span className="ml-2 rounded-full bg-saffron-100 px-2 py-0.5 text-xs font-medium text-saffron-800">
                      Featured
                    </span>
                  )}
                  {!project.published && (
                    <span className="ml-2 rounded-full bg-cream-200 px-2 py-0.5 text-xs font-medium text-ink-faint">
                      Draft
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-sm text-ink-faint">
                  {CATEGORY_LABELS[project.category]} · /{project.slug}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
                >
                  Edit
                </Link>
                <form action={deleteProject}>
                  <input type="hidden" name="id" value={project.id} />
                  <ConfirmSubmit message={`Delete project "${project.titleEn}"?`}>
                    Delete
                  </ConfirmSubmit>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminPage>
  );
}