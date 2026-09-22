import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center"
      >
        <div className="h-[480px] w-[720px] rounded-full bg-accent-100/60 blur-[120px]" />
      </div>

      <div className="container flex flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-subtle">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Feito para igrejas, ministérios e equipes de comunicação
        </div>

        <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
          A operação da sua igreja, organizada em{" "}
          <span className="text-accent">um único lugar</span>.
        </h1>

        <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          CHURCH-LAB reúne eventos, pessoas, comunicação, arquivos e ministérios
          em uma plataforma moderna — para equipes que querem clareza, não caos.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/cadastro"
            className={cn(buttonVariants({ variant: "accent", size: "lg" }), "group")}
          >
            Começar agora
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a href="#como-funciona" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Ver como funciona
          </a>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          Sem cartão de crédito. Configuração em minutos.
        </p>

        <div className="relative mt-16 w-full max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-floating">
            <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
            </div>
            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3 sm:p-8">
              {[
                { label: "Membros ativos", value: "1.284" },
                { label: "Eventos no mês", value: "12" },
                { label: "Ministérios", value: "9" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-background p-5 text-left"
                >
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { Hero };
