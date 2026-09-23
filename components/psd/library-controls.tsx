"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  Layers,
  FileImage,
  Palette,
  Zap,
  Puzzle,
  Plug,
  Wrench,
  Grid3x3,
  Sparkles,
  Star,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RangeSlider } from "@/components/ui/range-slider";
import type { FilterType } from "@/lib/filters";
import type { FilterIconName } from "@/lib/filter-icons";

const SORT_OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "baixados", label: "Mais baixados" },
  { value: "menor-custo", label: "Menor custo" },
  { value: "maior-custo", label: "Maior custo" },
  { value: "az", label: "A-Z" },
];

/** Ícones disponíveis para os filtros administráveis (lib/filter-icons.ts + /admin/filtros). */
export const FILTER_ICONS: Record<FilterIconName, LucideIcon> = {
  Layers,
  FileImage,
  Palette,
  Puzzle,
  Plug,
  Wrench,
  Grid3x3,
  Sparkles,
  Star,
  Tag,
};

export interface LibraryControlsProps {
  placeholder?: string;
  /** Menor e maior custo em créditos entre os PSDs exibidos — define os limites do slider. */
  creditBounds?: { min: number; max: number };
  /** Filtros de tipo de arquivo, administráveis em /admin/filtros. */
  filters?: FilterType[];
}

export function LibraryControls({ placeholder = "Pesquisar PSDs...", creditBounds, filters = [] }: LibraryControlsProps) {
  const typeFilters = [
    { value: "", label: "Todos", icon: Layers },
    ...filters.map((filter) => ({
      value: filter.value,
      label: filter.label,
      icon: FILTER_ICONS[filter.icon as FilterIconName] ?? Layers,
    })),
  ];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(searchParams.get("busca") ?? "");
  const activeType = searchParams.get("tipo") ?? "";

  const hasCreditFilter = !!creditBounds && creditBounds.max > creditBounds.min;
  const [creditRange, setCreditRange] = React.useState<[number, number]>(() => {
    if (!creditBounds) return [0, 0];
    const min = Number(searchParams.get("credito_min") ?? creditBounds.min);
    const max = Number(searchParams.get("credito_max") ?? creditBounds.max);
    return [
      Number.isFinite(min) ? min : creditBounds.min,
      Number.isFinite(max) ? max : creditBounds.max,
    ];
  });

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function updateParams(entries: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(entries)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  // Debounce: só empurra a URL 350ms depois do usuário soltar o arrasto,
  // pra não disparar uma navegação a cada pixel do slider.
  React.useEffect(() => {
    if (!hasCreditFilter) return;
    const [low, high] = creditRange;
    const isDefault = low === creditBounds!.min && high === creditBounds!.max;
    const timeout = setTimeout(() => {
      updateParams({
        credito_min: isDefault ? "" : String(low),
        credito_max: isDefault ? "" : String(high),
      });
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditRange]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            updateParam("busca", search);
          }}
          className="relative flex-1"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={placeholder}
            className="h-11 w-full rounded-lg border border-input bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </form>

        <select
          defaultValue={searchParams.get("ordenar") ?? "recentes"}
          onChange={(event) => updateParam("ordenar", event.target.value)}
          className="h-11 shrink-0 rounded-lg border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface p-1">
          {typeFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeType === filter.value;
            return (
              <button
                key={filter.value || "todos"}
                type="button"
                onClick={() => updateParam("tipo", filter.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-accent-50 text-accent-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {hasCreditFilter && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3.5 py-2 sm:w-72">
            <Zap className="h-3.5 w-3.5 shrink-0 text-accent" />
            <RangeSlider
              min={creditBounds!.min}
              max={creditBounds!.max}
              value={creditRange}
              onChange={setCreditRange}
              className="flex-1"
            />
            <span className="shrink-0 whitespace-nowrap text-xs font-medium text-muted-foreground">
              {creditRange[0]}–{creditRange[1]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
