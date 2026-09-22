import { createClient } from "@/utils/supabase/server";
import { CategoriesTable, type CategoryWithCount } from "@/components/admin/categories-table";
import type { Category } from "@/lib/types/psd";

export const dynamic = "force-dynamic";

export default async function AdminCategoriasPage() {
  const supabase = await createClient();

  const [{ data: categories, error }, { data: links }] = await Promise.all([
    supabase.from("categories").select("*").order("name", { ascending: true }),
    supabase.from("psd_categories").select("category_id"),
  ]);

  const counts = new Map<string, number>();
  for (const link of links ?? []) {
    counts.set(link.category_id, (counts.get(link.category_id) ?? 0) + 1);
  }

  const withCounts: CategoryWithCount[] = ((categories ?? []) as Category[]).map((category) => ({
    ...category,
    psdCount: counts.get(category.id) ?? 0,
  }));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Categorias</h1>
        <p className="text-sm text-muted-foreground">
          Organize a biblioteca pública de PSDs. Alterações aqui refletem imediatamente em /psd e /categorias.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          Não foi possível carregar as categorias: {error.message}
        </div>
      ) : (
        <CategoriesTable categories={withCounts} />
      )}
    </div>
  );
}
