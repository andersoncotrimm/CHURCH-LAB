import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/utils/supabase/server";
import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/types/plan";

export const dynamic = "force-dynamic";

function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
}

export default async function PlanosPage() {
  let typedPlans: Plan[] = [];

  try {
    const supabase = await createClient();

    const { data: plans } = await supabase
      .from("plans")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    typedPlans = (plans ?? []) as Plan[];
  } catch (error) {
    console.error("Falha ao carregar planos:", error);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="py-20 sm:py-28">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                Planos
              </span>
              <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Escolha o plano ideal para a sua equipe
              </h1>
              <p className="mt-4 text-balance text-muted-foreground">
                Cada plano concede uma quantidade de créditos por ciclo mensal, usados para baixar
                materiais da biblioteca CHURCH-LAB ASSETS.
              </p>
            </div>

            {typedPlans.length === 0 ? (
              <div className="mx-auto mt-14 max-w-md">
                <EmptyState
                  icon={<Sparkles className="h-6 w-6" />}
                  title="Nenhum plano disponível no momento"
                  description="Volte em breve — estamos preparando os planos de assinatura."
                />
              </div>
            ) : (
              <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
                {typedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={cn(
                      "flex flex-col rounded-2xl border p-7 shadow-card",
                      plan.is_featured
                        ? "border-accent bg-surface shadow-elevated ring-1 ring-accent"
                        : "border-border bg-surface"
                    )}
                  >
                    {plan.is_featured && (
                      <Badge variant="accent" className="mb-4 w-fit">
                        Mais popular
                      </Badge>
                    )}

                    <h2 className="text-lg font-semibold text-foreground">{plan.name}</h2>
                    {plan.description && (
                      <p className="mt-1.5 text-sm text-muted-foreground">{plan.description}</p>
                    )}

                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-3xl font-semibold tracking-tight text-foreground">
                        {formatPrice(plan.price)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /{plan.billing_interval === "monthly" ? "mês" : "ano"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-medium text-accent">
                      {plan.monthly_credits} créditos por ciclo
                    </p>

                    {plan.benefits.length > 0 && (
                      <ul className="mt-6 flex-1 space-y-3">
                        {plan.benefits.map((benefit) => (
                          <li key={benefit} className="flex items-start gap-2.5 text-sm text-foreground">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    )}

                    <Link
                      href="/login"
                      className={cn(
                        buttonVariants({ variant: plan.is_featured ? "accent" : "outline", size: "lg" }),
                        "mt-8 w-full"
                      )}
                    >
                      Começar agora
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <p className="mx-auto mt-10 max-w-lg text-center text-xs text-muted-foreground">
              Os créditos são renovados a cada ciclo da assinatura e não acumulam para o ciclo
              seguinte. O custo em créditos de cada material é definido individualmente pela
              equipe CHURCH-LAB.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
