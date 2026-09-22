import Link from "next/link";
import { FolderTree } from "lucide-react";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/utils/supabase/server";
import type { Category } from "@/lib/types/psd";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  let categories: Category[] = [];
  const countByCategory = new Map<string, number>();

  try {
    const supabase = await createClient();

    const [{ data: categoriesData }, { data: psdCategoryRows }] = await Promise.all([
      supabase.from("categories").select("*").order("name", { ascending: true }),
      supabase
        .from("psd_categories")
        .select("category_id, psd_files!inner(is_published)")
        .eq("psd_files.is_published", true),
    ]);

    categories = categoriesData ?? [];
    for (const row of psdCategoryRows ?? []) {
      countByCategory.set(row.category_id, (countByCategory.get(row.category_id) ?? 0) + 1);
    }
  } catch (error) {
    console.error("Falha ao carregar categorias:", error);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-10 sm:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Categorias
            </span>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Explore a biblioteca por categoria
            </h1>
            <p className="mt-4 text-balance text-muted-foreground">
              Cada material pertence a uma ou mais categorias — encontre exatamente o que precisa.
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="mx-auto mt-14 max-w-md">
              <EmptyState
                icon={<FolderTree className="h-6 w-6" />}
                title="Nenhuma categoria cadastrada"
                description="As categorias aparecem aqui assim que forem criadas no admin."
              />
            </div>
          ) : (
            <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/psd?categoria=${category.slug}`}
                  className="group flex flex-col gap-1 rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent-300/40 hover:shadow-elevated"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <FolderTree className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-foreground">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {countByCategory.get(category.id) ?? 0} materiais
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
