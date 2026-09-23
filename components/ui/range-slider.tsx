"use client";

import { cn } from "@/lib/utils";

export interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
}

/**
 * Slider de faixa dupla (arrasta), montado com dois <input type="range">
 * nativos sobrepostos — mantém teclado/acessibilidade de verdade, sem
 * depender de biblioteca externa. O estilo do "thumb" está em globals.css
 * (.range-slider-thumb), usando o gradiente de marca.
 */
export function RangeSlider({ min, max, step = 1, value, onChange, className }: RangeSliderProps) {
  const [low, high] = value;
  const range = Math.max(max - min, step);
  const lowPct = ((low - min) / range) * 100;
  const highPct = ((high - min) / range) * 100;

  function handleLowChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = Math.min(Number(event.target.value), high - step);
    onChange([next, high]);
  }

  function handleHighChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = Math.max(Number(event.target.value), low + step);
    onChange([low, next]);
  }

  return (
    <div className={cn("relative h-5", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted" />
      <div
        className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent"
        style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={low}
        onChange={handleLowChange}
        aria-label="Créditos mínimo"
        className="range-slider-thumb pointer-events-none absolute inset-x-0 top-1/2 h-1.5 w-full -translate-y-1/2 appearance-none bg-transparent"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={high}
        onChange={handleHighChange}
        aria-label="Créditos máximo"
        className="range-slider-thumb pointer-events-none absolute inset-x-0 top-1/2 h-1.5 w-full -translate-y-1/2 appearance-none bg-transparent"
      />
    </div>
  );
}
