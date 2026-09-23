import { createClient } from "@/utils/supabase/server";
import { ReferenceBoardsList, type ReferenceBoard } from "@/components/admin/reference-boards-list";

export const dynamic = "force-dynamic";

export default async function AdminReferenciasPage() {
  const supabase = await createClient();

  const { data: boards, error } = await supabase
    .from("reference_boards")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Referências</h1>
        <p className="text-sm text-muted-foreground">
          Links de pastas do Pinterest guardados como inspiração visual para a equipe.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          Não foi possível carregar as referências: {error.message}
        </div>
      ) : (
        <ReferenceBoardsList boards={(boards ?? []) as ReferenceBoard[]} />
      )}
    </div>
  );
}
