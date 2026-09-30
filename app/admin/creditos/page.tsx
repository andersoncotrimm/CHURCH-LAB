import { createClient } from "@/utils/supabase/server";
import { CreditPackagesTable } from "@/components/admin/credit-packages-table";
import type { CreditPackage } from "@/lib/types/credit-package";

export const dynamic = "force-dynamic";

export default async function AdminCreditosPage() {
  const supabase = await createClient();

  const { data: packages, error } = await supabase
    .from("credit_packages")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Créditos extras</h1>
        <p className="text-sm text-muted-foreground">
          Pacotes de créditos extras, exibidos em Meus Créditos como opção de compra. A cobrança ainda é manual —
          confirme o pagamento por fora (Pix, WhatsApp etc.) e adicione os créditos direto pelo Supabase
          (credit_transactions, tipo &quot;bonus&quot;) até essa etapa ser automatizada.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          Não foi possível carregar os pacotes: {error.message}
        </div>
      ) : (
        <CreditPackagesTable packages={(packages ?? []) as CreditPackage[]} />
      )}
    </div>
  );
}
