"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, AlertCircle, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FilterTypeFormModal } from "@/components/admin/filter-type-form-modal";
import { FILTER_ICONS } from "@/components/psd/library-controls";
import { deleteFilterType, toggleFilterActive } from "@/app/admin/filtros/actions";
import type { FilterType } from "@/lib/filters";

export function FilterTypesTable({ filters }: { filters: FilterType[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<FilterType | null>(null);
  const [deleting, setDeleting] = React.useState<FilterType | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(filter: FilterType) {
    setEditing(filter);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function handleToggleActive(filter: FilterType) {
    setBusyId(filter.id);
    setActionError(null);
    const result = await toggleFilterActive(filter.id, !filter.is_active);
    setBusyId(null);
    if (result.error) {
      setActionError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    setBusyId(deleting.id);
    setActionError(null);
    const result = await deleteFilterType(deleting.id);
    setBusyId(null);
    if (result.error) {
      setActionError(result.error);
      setDeleting(null);
      return;
    }
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filters.length} filtro{filters.length === 1 ? "" : "s"} cadastrado{filters.length === 1 ? "" : "s"}
        </p>
        <Button variant="accent" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Novo filtro
        </Button>
      </div>

      {actionError && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      {filters.length === 0 ? (
        <EmptyState
          icon={<SlidersHorizontal className="h-6 w-6" />}
          title="Nenhum filtro cadastrado"
          description="Crie o primeiro filtro de tipo de arquivo para a biblioteca."
          action={
            <Button variant="accent" onClick={openCreate}>
              Criar filtro
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filtro</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filters.map((filter) => {
              const Icon = FILTER_ICONS[filter.icon as keyof typeof FILTER_ICONS] ?? FILTER_ICONS.Layers;
              return (
                <TableRow key={filter.id}>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 font-medium">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {filter.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{filter.value}</TableCell>
                  <TableCell className="text-muted-foreground">{filter.sort_order}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleActive(filter)}
                      disabled={busyId === filter.id}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        filter.is_active
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {filter.is_active ? "Ativo" : "Inativo"}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEdit(filter)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`Editar ${filter.label}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(filter)}
                        disabled={busyId === filter.id}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                        aria-label={`Excluir ${filter.label}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <FilterTypeFormModal open={formOpen} onClose={closeForm} filter={editing} />

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Excluir "${deleting?.label}"?`}
        description="Essa ação não pode ser desfeita. O filtro deixa de aparecer na barra de filtros."
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={busyId === deleting?.id}>
              Excluir
            </Button>
          </>
        }
      />
    </div>
  );
}
