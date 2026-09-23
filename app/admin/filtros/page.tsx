import { createClient } from "@/utils/supabase/server";
import { getAllFilterTypes } from "@/lib/filters";
import { FilterTypesTable } from "@/components/admin/filter-types-table";

export const dynamic = "force-dynamic";

export default async function AdminFiltrosPage() {
  const supabase = await createClient();
  const filters = await getAllFilterTypes(supabase);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Filtros</h1>
        <p className="text-sm text-muted-foreground">
          Filtros de tipo de arquivo da biblioteca (PSD, Canva, e outros que você criar). Alterações refletem
          imediatamente na barra de filtros de /psd e das demais seções.
        </p>
      </div>

      <FilterTypesTable filters={filters} />
    </div>
  );
}
