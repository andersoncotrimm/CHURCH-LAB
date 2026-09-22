import { createClient } from "@/utils/supabase/server";
import { PsdsTable } from "@/components/admin/psds-table";
import { attachDownloadCounts, mapPsdRow, type PsdFileRow } from "@/lib/psd";

export const dynamic = "force-dynamic";

export default async function AdminPsdPage() {
  const supabase = await createClient();

  const [{ data: psdRows, error }, { data: categories }] = await Promise.all([
    supabase
      .from("psd_files")
      .select("*, psd_categories(categories(*))")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name", { ascending: true }),
  ]);

  const psds = error
    ? []
    : await attachDownloadCounts(supabase, (psdRows as unknown as PsdFileRow[]).map(mapPsdRow));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">PSDs</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie a biblioteca de materiais. Alterações aqui refletem imediatamente em /psd.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          Não foi possível carregar os PSDs: {error.message}
        </div>
      ) : (
        <PsdsTable psds={psds} categories={categories ?? []} />
      )}
    </div>
  );
}
