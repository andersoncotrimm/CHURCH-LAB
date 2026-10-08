import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Download, PlayCircle, Sparkles, UserPlus, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PsdFile } from "@/lib/types/psd";

const STEPS = [
  { icon: UserPlus, title: "Crie sua conta", description: "Cadastro rápido, sem cartão" },
  { icon: Download, title: "Baixe materiais", description: "PSDs, elementos e plugins prontos" },
  { icon: Zap, title: "Economize tempo", description: "Foque no que importa: sua igreja" },
];

export interface LandingHeroProps {
  /** Até 9 PSDs com thumbnail, usados no grid de imagens à direita. */
  showcasePsds: PsdFile[];
}

/** Hero de conversão da home pública — chamada + prova social visual
 * (grid de materiais reais), com entrada animada em CSS puro. */
export function LandingHero({ showcasePsds }: LandingHeroProps) {
  const tiles = showcasePsds.slice(0, 9);

  return (
    <section className="grid grid-cols-1 items-center gap-10 overflow-hidden rounded-3xl bg-surface px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col gap-6">
        <h1 className="animate-fade-in text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          Prepare-se para criar artes{" "}
          <span className="relative inline-block text-accent">
            extraordinárias
            <svg
              viewBox="0 0 220 12"
              className="absolute -bottom-1.5 left-0 h-3 w-full text-accent"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M2 9.5C40 2 90 2 110 6C130 10 180 10 218 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="path-draw"
                pathLength={1}
              />
            </svg>
          </span>
        </h1>

        <p
          className="animate-fade-in text-balance text-base text-muted-foreground sm:text-lg"
          style={{ animationDelay: "120ms", animationFillMode: "backwards" }}
        >
          Comece agora com a forma mais fácil e segura de baixar materiais pra sua igreja. Busque
          entre centenas de PSDs, elementos e plugins feitos por designers profissionais.
        </p>

        <div
          className="animate-fade-in flex flex-wrap items-center gap-3"
          style={{ animationDelay: "220ms", animationFillMode: "backwards" }}
        >
          <Link href="/cadastro" className={cn(buttonVariants({ variant: "accent", size: "lg" }), "gap-2")}>
            Criar conta
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/planos" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}>
            Ver planos
            <PlayCircle className="h-4 w-4" />
          </Link>
        </div>

        <div
          className="animate-fade-in mt-4 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-3"
          style={{ animationDelay: "320ms", animationFillMode: "backwards" }}
        >
          {STEPS.map((step) => (
            <div key={step.title} className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-accent">
                <step.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {tiles.length > 0
          ? tiles.map((psd, index) => (
              <div
                key={psd.id}
                className="animate-scale-in relative aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-muted transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.03]"
                style={{ animationDelay: `${index * 70}ms`, animationFillMode: "backwards" }}
              >
                {psd.thumbnail_url && (
                  <Image
                    src={psd.thumbnail_url}
                    alt={psd.title}
                    fill
                    sizes="(max-width: 1024px) 30vw, 180px"
                    className="object-cover"
                  />
                )}
              </div>
            ))
          : Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="animate-scale-in aspect-[3/4] rounded-[1.75rem] bg-gradient-to-br from-accent-900 to-muted"
                style={{ animationDelay: `${index * 70}ms`, animationFillMode: "backwards" }}
              />
            ))}
      </div>
    </section>
  );
}
