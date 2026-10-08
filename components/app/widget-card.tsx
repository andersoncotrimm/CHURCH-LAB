import { cn } from "@/lib/utils";

export type WidgetTone = "surface" | "accent" | "purple" | "blue" | "orange" | "pink";

const TONE_CLASSES: Record<WidgetTone, string> = {
  surface: "glass-card text-foreground",
  accent: "bg-accent text-accent-foreground",
  purple: "bg-widget-purple text-white",
  blue: "bg-widget-blue text-white",
  orange: "bg-widget-orange text-white",
  pink: "bg-widget-pink text-white",
};

export interface WidgetCardProps {
  tone?: WidgetTone;
  className?: string;
  children: React.ReactNode;
}

/** Bloco base do dashboard em grade "bento" — cantos bem arredondados,
 * fundo sólido numa cor vívida fixa (ou vidro), sem borda. */
export function WidgetCard({ tone = "surface", className, children }: WidgetCardProps) {
  return (
    <div className={cn("relative flex flex-col overflow-hidden rounded-3xl p-4", TONE_CLASSES[tone], className)}>
      {children}
    </div>
  );
}
