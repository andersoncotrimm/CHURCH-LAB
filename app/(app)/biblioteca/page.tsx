"use client";

import * as React from "react";
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  SlidersHorizontal,
  Star,
  FileText,
  Image as ImageIcon,
  Music,
  Sheet,
  Presentation,
  File as FileIcon,
  FolderSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dropdown } from "@/components/ui/dropdown";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockLibraryCategories, mockLibraryItems } from "@/lib/mock-data";

const TYPE_ICONS: Record<string, React.ElementType> = {
  Slides: Presentation,
  PDF: FileText,
  Áudio: Music,
  Documento: FileText,
  Imagens: ImageIcon,
  Planilha: Sheet,
};

export default function BibliotecaPage() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("Todos");
  const [type, setType] = React.useState<string | null>(null);
  const [view, setView] = React.useState<"grid" | "list">("grid");

  const types = React.useMemo(
    () => Array.from(new Set(mockLibraryItems.map((item) => item.type))),
    []
  );

  const featured = mockLibraryItems.filter((item) => item.featured);

  const filtered = mockLibraryItems.filter((item) => {
    const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "Todos" || item.category === category;
    const matchesType = !type || item.type === type;
    return matchesQuery && matchesCategory && matchesType;
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Biblioteca</h1>
        <p className="text-sm text-muted-foreground">
          Materiais, mídias e documentos da igreja organizados em um só lugar.
        </p>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-foreground">Em destaque</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {featured.map((item) => {
            const Icon = TYPE_ICONS[item.type] ?? FileIcon;
            return (
              <div
                key={item.id}
                className="w-64 shrink-0 rounded-2xl border border-border bg-gradient-to-br from-accent-50 to-surface p-5 shadow-card"
              >
                <Icon className="h-6 w-6 text-accent-600" />
                <p className="mt-3 line-clamp-2 text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{item.category}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome do material..."
            startIcon={<Search className="h-4 w-4" />}
            className="sm:max-w-xs"
          />

          <div className="flex items-center gap-2">
            <Dropdown
              align="left"
              trigger={
                <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-input bg-surface px-3.5 text-sm font-medium text-foreground hover:bg-muted">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  {type ?? "Todos os tipos"}
                </span>
              }
              items={[
                { label: "Todos os tipos", onSelect: () => setType(null) },
                ...types.map((t) => ({ label: t, onSelect: () => setType(t) })),
              ]}
            />

            <div className="flex items-center rounded-lg border border-input bg-surface p-1">
              <button
                aria-label="Visualização em grade"
                onClick={() => setView("grid")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  view === "grid" ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                aria-label="Visualização em lista"
                onClick={() => setView("list")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  view === "list" ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {mockLibraryCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                category === cat
                  ? "border-accent bg-accent-50 text-accent-700"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderSearch className="h-6 w-6" />}
          title="Nenhum material encontrado"
          description="Ajuste a busca ou os filtros para encontrar o que procura."
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const Icon = TYPE_ICONS[item.type] ?? FileIcon;
            return (
              <div
                key={item.id}
                className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <Badge variant="outline">{item.type}</Badge>
                </div>
                <p className="mt-4 text-sm font-semibold leading-snug text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{item.category}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span>{item.updatedAt}</span>
                  <span>{item.size}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Atualizado</TableHead>
              <TableHead>Tamanho</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => {
              const Icon = TYPE_ICONS[item.type] ?? FileIcon;
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="flex items-center gap-2.5 font-medium">
                      <Icon className="h-4 w-4 text-accent-600" />
                      {item.title}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.updatedAt}</TableCell>
                  <TableCell className="text-muted-foreground">{item.size}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
