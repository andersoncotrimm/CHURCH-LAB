import { createClient } from "@/utils/supabase/server";
import { PlansTable } from "@/components/admin/plans-table";
import type { Plan } from "@/lib/types/plan";

export const dynamic = "force-dynamic";

export default async function AdminPlanosPage() {
  const supabase = await createClient();

  const { data: plans, error } = await supabase
    .from("plans")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Planos</h1>
        <p className="text-sm text-muted-foreground">
          Controle os planos de assinatura do CHURCH-LAB ASSETS. Qualquer alteração aqui reflete
          imediatamente na página pública de planos.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          Não foi possível carregar os planos: {error.message}
        </div>
      ) : (
        <PlansTable plans={(plans ?? []) as Plan[]} />
      )}
    </div>
  );
}
