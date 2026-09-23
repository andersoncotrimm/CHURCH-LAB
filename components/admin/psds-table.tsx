"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Power, AlertCircle, Star, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { PsdFormModal } from "@/components/admin/psd-form-modal";
import { togglePsdPublished, deletePsd } from "@/app/admin/psd/actions";
import { CONTENT_TYPES } from "@/lib/types/psd";
import type { Category, PsdFile } from "@/lib/types/psd";

const CONTENT_TYPE_LABELS = Object.fromEntries(CONTENT_TYPES.map((type) => [type.value, type.label]));

export function PsdsTable({ psds, categories }: { psds: PsdFile[]; categories: Category[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PsdFile | null>(null);
  const [deleting, setDeleting] = React.useState<PsdFile | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(psd: PsdFile) {
    setEditing(psd);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function handleToggle(psd: PsdFile) {
    setBusyId(psd.id);
    setActionError(null);
    const result = await togglePsdPublished(psd.id, !psd.is_published);
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
    const result = await deletePsd(deleting.id);
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
          {psds.length} PSD{psds.length === 1 ? "" : "s"} cadastrado{psds.length === 1 ? "" : "s"}
        </p>
        <Button variant="accent" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Novo PSD
        </Button>
      </div>

      {actionError && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      {psds.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-6 w-6" />}
          title="Nenhum PSD cadastrado"
          description="Crie o primeiro material para que ele apareça na biblioteca pública."
          action={
            <Button variant="accent" onClick={openCreate}>
              Criar PSD
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PSD</TableHead>
              <TableHead>Seção</TableHead>
              <TableHead>Categorias</TableHead>
              <TableHead>Créditos</TableHead>
              <TableHead>Downloads</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {psds.map((psd) => (
              <TableRow key={psd.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      {psd.thumbnail_url ? (
                        <Image src={psd.thumbnail_url} alt={psd.title} fill sizes="40px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                          <ImageOff className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="truncate">{psd.title}</span>
                        {psd.is_featured && (
                          <Star className="h-3.5 w-3.5 shrink-0 fill-accent text-accent" aria-label="Destaque" />
                        )}
                      </span>
                      <span className="block text-xs text-muted-foreground">/{psd.slug}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {CONTENT_TYPE_LABELS[psd.content_type] ?? psd.content_type}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {psd.categories.length > 0 ? psd.categories.map((c) => c.name).join(", ") : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">{psd.credit_cost}</TableCell>
                <TableCell className="text-muted-foreground">{psd.downloadsCount}</TableCell>
                <TableCell>
                  <Badge variant={psd.is_published ? "success" : "neutral"}>
                    {psd.is_published ? "Publicado" : "Rascunho"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(psd)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={`Editar ${psd.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(psd)}
                      disabled={busyId === psd.id}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                      aria-label={psd.is_published ? `Despublicar ${psd.title}` : `Publicar ${psd.title}`}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(psd)}
                      disabled={busyId === psd.id}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                      aria-label={`Excluir ${psd.title}`}
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

      <PsdFormModal open={formOpen} onClose={closeForm} psd={editing} categories={categories} />

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Excluir "${deleting?.title}"?`}
        description="Essa ação não pode ser desfeita. Se este PSD já tiver sido baixado por algum usuário, a exclusão será bloqueada — despublique-o nesse caso."
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
