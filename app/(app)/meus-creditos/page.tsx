import Link from "next/link";
import { Zap, Calendar, TrendingDown, TrendingUp, History, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CustomCreditAmount } from "@/components/app/custom-credit-amount";
import { BuyCreditPackageButton } from "@/components/app/buy-credit-package-button";
import { RenewPlanPixButton } from "@/components/app/renew-plan-pix-button";
import { createClient } from "@/utils/supabase/server";
import { getUserCreditsSummary } from "@/lib/credits";
import { getSiteSettings } from "@/lib/settings";
import type { CreditPackage } from "@/lib/types/credit-package";

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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

  const [credits, settings, { data: packages }] = await Promise.all([
    getUserCreditsSummary(supabase, user.id),
    getSiteSettings(supabase),
    supabase.from("credit_packages").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
  ]);

  const { data: history } = await supabase
    .from("credit_transactions")
    .select("id, amount, transaction_type, description, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const creditPackages = (packages ?? []) as CreditPackage[];

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
                <p
                  className="mt-2 truncate text-2xl font-semibold text-foreground"
                  title={credits.planName ?? undefined}
                >
                  {credits.planName ?? "—"}
                </p>
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

          {credits.periodEnd && credits.autoRenews && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Renovação automática em{" "}
              {new Date(credits.periodEnd).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              . Créditos não utilizados não acumulam para o próximo ciclo.
            </div>
          )}

          {credits.periodEnd && !credits.autoRenews && credits.planId && (() => {
            const daysLeft = Math.ceil((new Date(credits.periodEnd).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
            const expiringSoon = daysLeft <= 5;
            return (
              <div
                className={`flex flex-col gap-3 rounded-lg border p-4 text-sm sm:flex-row sm:items-center sm:justify-between ${
                  expiringSoon ? "border-warning/40 bg-warning/5 text-foreground" : "border-border bg-surface text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>
                    Plano pago via Pix — {expiringSoon ? "vence" : "válido até"}{" "}
                    {new Date(credits.periodEnd).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    . Não renova sozinho: pague de novo pra continuar.
                  </span>
                </div>
                <RenewPlanPixButton planId={credits.planId} />
              </div>
            );
          })()}
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Comprar mais créditos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Precisa de mais créditos antes do fim do ciclo? Escolha um pacote pronto ou monte a sua própria
            quantidade — o pagamento é processado pelo Mercado Pago (Pix, cartão ou boleto, você escolhe na hora de
            pagar) e os créditos entram na sua conta automaticamente assim que for aprovado.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {creditPackages.map((pkg) => (
              <div key={pkg.id} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
                <p className="text-sm font-semibold text-foreground">{pkg.name}</p>
                <p className="flex items-center gap-1.5 text-xl font-semibold text-foreground">
                  <Zap className="h-4 w-4 text-accent" />
                  {pkg.credits_amount} créditos
                </p>
                <p className="text-sm text-muted-foreground">{formatPrice(pkg.price)}</p>
                <BuyCreditPackageButton packageId={pkg.id} />
              </div>
            ))}

            <CustomCreditAmount unitPrice={settings.creditUnitPrice} contactUrl={settings.contactUrl} />
          </div>
        </CardContent>
      </Card>

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
