import { requireAdminPage } from "@/lib/guard";
import { AdminPage, ErrorBanner } from "@/components/admin/ui";
import { OcrWorkbench } from "@/components/admin/OcrWorkbench";

export const metadata = { title: "Digitise visitor book" };

export default async function NewVisitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdminPage();
  const { error } = await searchParams;

  return (
    <AdminPage title="Digitise the visitor book">
      {error && (
        <ErrorBanner
          message={
            error === "rows"
              ? "Please check the rows — every record needs a name and a valid date."
              : (() => {
                  try {
                    return decodeURIComponent(error);
                  } catch {
                    return error;
                  }
                })()
          }
        />
      )}
      <OcrWorkbench />
    </AdminPage>
  );
}