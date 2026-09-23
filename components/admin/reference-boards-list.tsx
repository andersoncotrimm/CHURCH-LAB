"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, AlertCircle, ExternalLink, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { createReferenceBoard, deleteReferenceBoard } from "@/app/admin/referencias/actions";

export interface ReferenceBoard {
  id: string;
  title: string;
  pinterest_url: string;
  notes: string | null;
  created_at: string;
}

export function ReferenceBoardsList({ boards }: { boards: ReferenceBoard[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<ReferenceBoard | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await createReferenceBoard(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setFormOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    setLoading(true);
    setError(null);
    const result = await deleteReferenceBoard(deleting.id);
    setLoading(false);
    if (result.error) {
      setError(result.error);
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
          {boards.length} referência{boards.length === 1 ? "" : "s"} cadastrada{boards.length === 1 ? "" : "s"}
        </p>
        <Button
          variant="accent"
          onClick={() => {
            setError(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Adicionar referência
        </Button>
      </div>

      {error && !formOpen && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {boards.length === 0 ? (
        <EmptyState
          icon={<Images className="h-6 w-6" />}
          title="Nenhuma referência cadastrada"
          description="Cole o link de uma pasta do Pinterest para guardar como inspiração visual."
          action={
            <Button variant="accent" onClick={() => setFormOpen(true)}>
              Adicionar referência
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <div
              key={board.id}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground">{board.title}</h3>
                <button
                  onClick={() => setDeleting(board)}
                  className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                  aria-label={`Excluir ${board.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <a
                href={board.pinterest_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 truncate text-sm font-medium text-accent hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{board.pinterest_url}</span>
              </a>
              {board.notes && <p className="text-sm text-muted-foreground">{board.notes}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Nova referência"
        description="Cole o link de uma pasta/board do Pinterest. Por enquanto isso só guarda o link para consulta — copiar as imagens automaticamente é uma etapa futura."
        className="max-w-lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Input label="Título" name="title" placeholder="Ex: Stories de Natal 2026" required disabled={loading} />
          <Input
            label="Link do Pinterest"
            name="pinterest_url"
            type="url"
            placeholder="https://www.pinterest.com/usuario/pasta/"
            required
            disabled={loading}
          />
          <Textarea label="Notas (opcional)" name="notes" rows={2} disabled={loading} />

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent" loading={loading}>
              Adicionar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Excluir "${deleting?.title}"?`}
        description="Essa ação não pode ser desfeita."
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={loading}>
              Excluir
            </Button>
          </>
        }
      />
    </div>
  );
}
