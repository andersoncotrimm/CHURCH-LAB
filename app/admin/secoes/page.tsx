import { createClient } from "@/utils/supabase/server";
import { getAllHomeSections } from "@/lib/home-sections";
import { getPublishedPsds } from "@/lib/psd";
import { HomeSectionsTable } from "@/components/admin/home-sections-table";

export const dynamic = "force-dynamic";

export default async function AdminSecoesPage() {
  const supabase = await createClient();

  const [sections, allPsds] = await Promise.all([getAllHomeSections(supabase), getPublishedPsds(supabase)]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Seções da página inicial</h1>
        <p className="text-sm text-muted-foreground">
          Crie fileiras personalizadas pra home e o dashboard, escolhendo o nome e quais itens aparecem em cada uma.
        </p>
      </div>

      <HomeSectionsTable sections={sections} allPsds={allPsds} />
    </div>
  );
}
