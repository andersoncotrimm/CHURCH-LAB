"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Layers, FileImage, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "baixados", label: "Mais baixados" },
  { value: "menor-custo", label: "Menor custo" },
  { value: "maior-custo", label: "Maior custo" },
  { value: "az", label: "A-Z" },
];

const TYPE_FILTERS = [
  { value: "", label: "Todos", icon: Layers },
  { value: "psd", label: "PSD", icon: FileImage },
  { value: "canva", label: "Canva", icon: Palette },
];

export function LibraryControls({ placeholder = "Pesquisar PSDs..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(searchParams.get("busca") ?? "");
  const activeType = searchParams.get("tipo") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

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

      <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface p-1">
        {TYPE_FILTERS.map((filter) => {
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
    </div>
  );
}
