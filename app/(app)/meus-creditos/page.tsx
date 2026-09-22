import Link from "next/link";
import { Zap, Calendar, TrendingDown, TrendingUp, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/utils/supabase/server";
import { getUserCreditsSummary } from "@/lib/credits";

export const dynamic = "force-dynamic";

const TRANSACTION_LABELS: Record<string, { label: string; variant: "success" | "danger" | "warning" | "neutral" }> = {
  grant: { label: "Concessão do ciclo", variant: "success" },
  download: { label: "Download", variant: "neutral" },
  bonus: { label: "Bônus", variant: "success" },
  adjustment: { label: "Ajuste", variant: "warning" },
  expiration: { label: "Expiração", variant: "danger" },
};

export default async function MeusCreditosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const credits = await getUserCreditsSummary(supabase, user.id);

  const { data: history } = await supabase
    .from("credit_transactions")
    .select("id, amount, transaction_type, description, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Meus Créditos</h1>
        <p className="text-sm text-muted-foreground">Saldo, plano atual e histórico de consumo.</p>
      </div>

      {!credits ? (
        <EmptyState
          icon={<Zap className="h-6 w-6" />}
          title="Você ainda não tem uma assinatura ativa"
          description="Assine um plano para receber créditos e baixar materiais da biblioteca."
          action={
            <Link href="/planos">
              <Button variant="accent">Ver planos</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs font-medium text-muted-foreground">Saldo atual</p>
                <p className="mt-2 flex items-center gap-1.5 text-2xl font-semibold text-foreground">
                  <Zap className="h-5 w-5 text-accent" />
                  {credits.available}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs font-medium text-muted-foreground">Plano atual</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{credits.planName ?? "—"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs font-medium text-muted-foreground">Créditos usados</p>
                <p className="mt-2 flex items-center gap-1.5 text-2xl font-semibold text-foreground">
                  <TrendingDown className="h-5 w-5 text-muted-foreground" />
                  {credits.used}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs font-medium text-muted-foreground">Concedidos no ciclo</p>
                <p className="mt-2 flex items-center gap-1.5 text-2xl font-semibold text-foreground">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  {credits.granted}
                </p>
              </CardContent>
            </Card>
          </div>

          {credits.periodEnd && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Renovação em{" "}
              {new Date(credits.periodEnd).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              . Créditos não utilizados não acumulam para o próximo ciclo.
            </div>
          )}
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico de consumo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!history || history.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma movimentação ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {history.map((tx) => {
                const meta = TRANSACTION_LABELS[tx.transaction_type] ?? { label: tx.transaction_type, variant: "neutral" as const };
                return (
                  <li key={tx.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.description ?? meta.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                      <span className={`text-sm font-semibold ${tx.amount > 0 ? "text-success" : "text-danger"}`}>
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
