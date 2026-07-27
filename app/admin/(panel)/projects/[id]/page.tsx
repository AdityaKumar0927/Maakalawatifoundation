import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/guard";
import { AdminPage, Card, Label, inputCls } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { saveProject } from "@/app/admin/(panel)/projects/actions";

export const metadata = { title: "Edit project" };

export default async function ProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const project = id === "new" ? null : await prisma.project.findUnique({ where: { id } });
  if (id !== "new" && !project) notFound();

  return (
    <AdminPage title={project ? `Edit: ${project.titleEn}` : "New project"}>
      <Card>
        <form action={saveProject} className="space-y-5">
          {project && <input type="hidden" name="id" value={project.id} />}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="category">Area of work</Label>
              <select
                id="category"
                name="category"
                required
                defaultValue={project?.category ?? "HEALTHCARE"}
                className={inputCls}
              >
                <option value="HEALTHCARE">Healthcare</option>
                <option value="EDUCATION">Education</option>
                <option value="WOMEN_EMPOWERMENT">Women empowerment</option>
                <option value="COMMUNITY_WELFARE">Community welfare</option>
              </select>
            </div>
            <div>
              <Label htmlFor="sortOrder" optional>Sort order (lower = first)</Label>
              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                max={9999}
                defaultValue={project?.sortOrder ?? 0}
                className={inputCls}
              />
            </div>
            <div>
              <Label htmlFor="titleEn">Title — English</Label>
              <input id="titleEn" name="titleEn" required maxLength={150} defaultValue={project?.titleEn} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="titleHi">Title — हिन्दी</Label>
              <input id="titleHi" name="titleHi" required lang="hi" maxLength={150} defaultValue={project?.titleHi} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="summaryEn" optional>Short summary — English</Label>
              <textarea id="summaryEn" name="summaryEn" rows={2} maxLength={300} defaultValue={project?.summaryEn} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="summaryHi" optional>Short summary — हिन्दी</Label>
              <textarea id="summaryHi" name="summaryHi" rows={2} lang="hi" maxLength={300} defaultValue={project?.summaryHi} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="bodyEn" optional>Full story — English</Label>
              <textarea id="bodyEn" name="bodyEn" rows={8} maxLength={8000} defaultValue={project?.bodyEn} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="bodyHi" optional>Full story — हिन्दी</Label>
              <textarea id="bodyHi" name="bodyHi" rows={8} lang="hi" maxLength={8000} defaultValue={project?.bodyHi} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="slug" optional>Web address (slug)</Label>
              <input
                id="slug"
                name="slug"
                maxLength={100}
                defaultValue={project?.slug}
                placeholder="left empty = created from the English title"
                className={inputCls}
              />
            </div>
          </div>

          <div className="rounded-xl border border-line bg-cream-50 p-4">
            <Label htmlFor="image" optional>Project photo (JPEG/PNG/WebP, ≤5 MB)</Label>
            {project?.imageUrl && (
              <div className="relative mt-2 aspect-[3/2] max-w-xs overflow-hidden rounded-lg border border-line">
                <Image src={project.imageUrl} alt={project.imageAlt} fill sizes="320px" className="object-cover" />
              </div>
            )}
            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-2 w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-saffron-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-saffron-800"
            />
            <div className="mt-3">
              <Label htmlFor="imageAlt" optional>Photo description (alt text)</Label>
              <input id="imageAlt" name="imageAlt" maxLength={200} defaultValue={project?.imageAlt} className={inputCls} />
            </div>
            {project?.imageUrl && (
              <label className="mt-3 flex items-center gap-2 text-sm font-medium text-ink">
                <input type="checkbox" name="removeImage" className="h-4 w-4 accent-saffron-600" />
                Remove the current photo
              </label>
            )}
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                name="published"
                defaultChecked={project?.published ?? false}
                className="h-4 w-4 accent-saffron-600"
              />
              Published (visible on the site)
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={project?.featured ?? false}
                className="h-4 w-4 accent-saffron-600"
              />
              Featured on the homepage
            </label>
          </div>

          <SubmitButton>{project ? "Save changes" : "Create project"}</SubmitButton>
        </form>
      </Card>
    </AdminPage>
  );
}