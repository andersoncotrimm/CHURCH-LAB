import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Cta() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl border border-accent-200/30 bg-surface px-8 py-16 text-center shadow-floating sm:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 gradient-accent opacity-20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_theme(colors.accent.500)_0%,_transparent_60%)] opacity-50"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Pronto para organizar a sua igreja?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-balance text-sm text-muted-foreground sm:text-base">
              Leve o CHURCH-LAB para a sua equipe e comece a organizar eventos,
              pessoas e comunicação hoje mesmo.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "accent", size: "lg" }),
                  "group glow-accent-sm"
                )}
              >
                Começar agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a href="#recursos" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                Explorar recursos
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { Cta };
