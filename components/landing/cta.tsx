import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Cta() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-foreground px-8 py-16 text-center sm:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_theme(colors.accent.700)_0%,_transparent_60%)] opacity-40"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-xl text-balance text-3xl font-semibold tracking-tight text-background sm:text-4xl">
              Pronto para organizar a sua igreja?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-balance text-sm text-background/70 sm:text-base">
              Leve o CHURCH-LAB para a sua equipe e comece a organizar eventos,
              pessoas e comunicação hoje mesmo.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "accent", size: "lg" }),
                  "group"
                )}
              >
                Começar agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#recursos"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-background/20 bg-transparent text-background hover:bg-background/10"
                )}
              >
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
