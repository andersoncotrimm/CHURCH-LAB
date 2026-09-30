"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, AlertCircle, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HomeSectionFormModal } from "@/components/admin/home-section-form-modal";
import { deleteHomeSection, toggleHomeSectionActive } from "@/app/admin/secoes/actions";
import type { HomeSectionWithCount } from "@/lib/home-sections";
import type { PsdFile } from "@/lib/types/psd";

export function HomeSectionsTable({ sections, allPsds }: { sections: HomeSectionWithCount[]; allPsds: PsdFile[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<HomeSectionWithCount | null>(null);
  const [deleting, setDeleting] = React.useState<HomeSectionWithCount | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(section: HomeSectionWithCount) {
    setEditing(section);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function handleToggleActive(section: HomeSectionWithCount) {
    setBusyId(section.id);
    setActionError(null);
    const result = await toggleHomeSectionActive(section.id, !section.is_active);
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
    const result = await deleteHomeSection(deleting.id);
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
          {sections.length} seção{sections.length === 1 ? "" : "ões"} cadastrada{sections.length === 1 ? "" : "s"}
        </p>
        <Button variant="accent" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nova seção
        </Button>
      </div>

      {actionError && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      {sections.length === 0 ? (
        <EmptyState
          icon={<LayoutList className="h-6 w-6" />}
          title="Nenhuma seção cadastrada"
          description="Crie uma fileira personalizada pra aparecer na página inicial."
          action={
            <Button variant="accent" onClick={openCreate}>
              Criar seção
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seção</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Ativa</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section) => (
              <TableRow key={section.id}>
                <TableCell>
                  <span className="font-medium">{section.title}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{section.sort_order}</TableCell>
                <TableCell className="text-muted-foreground">{section.itemIds.length}</TableCell>
                <TableCell>
                  <button
                    onClick={() => handleToggleActive(section)}
                    disabled={busyId === section.id}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      section.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {section.is_active ? "Ativa" : "Inativa"}
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(section)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={`Editar ${section.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(section)}
                      disabled={busyId === section.id}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                      aria-label={`Excluir ${section.title}`}
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

      <HomeSectionFormModal open={formOpen} onClose={closeForm} section={editing} allPsds={allPsds} />

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Excluir "${deleting?.title}"?`}
        description="Essa ação não pode ser desfeita. A seção some da página inicial."
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
