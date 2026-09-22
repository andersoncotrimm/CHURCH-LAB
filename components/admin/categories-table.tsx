"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, AlertCircle, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryFormModal } from "@/components/admin/category-form-modal";
import { deleteCategory } from "@/app/admin/categorias/actions";
import type { Category } from "@/lib/types/psd";

export interface CategoryWithCount extends Category {
  psdCount: number;
}

export function CategoriesTable({ categories }: { categories: CategoryWithCount[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [deleting, setDeleting] = React.useState<CategoryWithCount | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    setBusyId(deleting.id);
    setActionError(null);
    const result = await deleteCategory(deleting.id);
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
          {categories.length} categoria{categories.length === 1 ? "" : "s"} cadastrada
          {categories.length === 1 ? "" : "s"}
        </p>
        <Button variant="accent" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      {actionError && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      {categories.length === 0 ? (
        <EmptyState
          icon={<FolderTree className="h-6 w-6" />}
          title="Nenhuma categoria cadastrada"
          description="Crie a primeira categoria para organizar a biblioteca de PSDs."
          action={
            <Button variant="accent" onClick={openCreate}>
              Criar categoria
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead>PSDs vinculados</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <span className="font-medium">{category.name}</span>
                  <span className="block text-xs text-muted-foreground">/{category.slug}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{category.psdCount}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(category)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={`Editar ${category.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(category)}
                      disabled={busyId === category.id}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                      aria-label={`Excluir ${category.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CategoryFormModal open={formOpen} onClose={closeForm} category={editing} />

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Excluir "${deleting?.name}"?`}
        description={
          deleting && deleting.psdCount > 0
            ? `Essa ação não pode ser desfeita. ${deleting.psdCount} PSD(s) vinculado(s) perderão esta categoria (mas continuam publicados normalmente).`
            : "Essa ação não pode ser desfeita."
        }
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
