import { createClient } from "@/utils/supabase/server";
import { UsersTable, type AdminUserRow } from "@/components/admin/users-table";
import type { Plan } from "@/lib/types/plan";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  const supabase = await createClient();

  const [{ data: users, error }, { data: plans }] = await Promise.all([
    supabase.rpc("admin_list_users"),
    supabase.from("plans").select("*").eq("is_active", true).order("display_order", { ascending: true }),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Usuários</h1>
        <p className="text-sm text-muted-foreground">
          Conceda plano/créditos manualmente (ainda não há checkout/pagamento) e gerencie acesso de admin.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          Não foi possível carregar os usuários: {error.message}
        </div>
      ) : (
        <UsersTable users={(users ?? []) as AdminUserRow[]} plans={(plans ?? []) as Plan[]} />
      )}
    </div>
  );
}
