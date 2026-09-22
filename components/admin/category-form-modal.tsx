"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/slugify";
import { createCategory, updateCategory } from "@/app/admin/categorias/actions";
import type { Category } from "@/lib/types/psd";

export interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
}

export function CategoryFormModal({ open, onClose, category }: CategoryFormModalProps) {
  const isEditing = !!category;
  const [slugTouched, setSlugTouched] = React.useState(isEditing);
  const [slug, setSlug] = React.useState(category?.slug ?? "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setSlug(category?.slug ?? "");
      setSlugTouched(!!category);
      setError(null);
    }
  }, [open, category]);

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!slugTouched) setSlug(slugify(event.target.value));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = isEditing ? await updateCategory(category.id, formData) : await createCategory(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? `Editar categoria — ${category.name}` : "Nova categoria"}
      description="Categorias organizam a biblioteca pública de PSDs e o filtro em /psd."
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Input
          label="Nome"
          name="name"
          defaultValue={category?.name}
          placeholder="Ex: Stories"
          required
          disabled={loading}
          onChange={handleNameChange}
        />

        <Input
          label="Slug"
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          placeholder="stories"
          hint="Usado na URL do filtro (/psd?categoria=...)."
          required
          disabled={loading}
        />

        <Textarea
          label="Descrição (opcional)"
          name="description"
          defaultValue={category?.description ?? ""}
          placeholder="Uma frase curta sobre o que entra nessa categoria."
          rows={2}
          disabled={loading}
        />

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent" loading={loading}>
            {isEditing ? "Salvar alterações" : "Criar categoria"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
