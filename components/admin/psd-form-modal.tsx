"use client";

import * as React from "react";
import { AlertCircle, FileImage } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/slugify";
import { createPsd, updatePsd } from "@/app/admin/psd/actions";
import { CONTENT_TYPES } from "@/lib/types/psd";
import type { Category, PsdFile } from "@/lib/types/psd";

export interface PsdFormModalProps {
  open: boolean;
  onClose: () => void;
  psd?: PsdFile | null;
  categories: Category[];
}

function formatBytes(bytes: number | null) {
  if (!bytes) return null;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PsdFormModal({ open, onClose, psd, categories }: PsdFormModalProps) {
  const isEditing = !!psd;
  const [slugTouched, setSlugTouched] = React.useState(isEditing);
  const [slug, setSlug] = React.useState(psd?.slug ?? "");
  const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<Set<string>>(
    new Set(psd?.categories.map((c) => c.id) ?? [])
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setSlug(psd?.slug ?? "");
      setSlugTouched(!!psd);
      setSelectedCategoryIds(new Set(psd?.categories.map((c) => c.id) ?? []));
      setError(null);
    }
  }, [open, psd]);

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!slugTouched) setSlug(slugify(event.target.value));
  }

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.delete("category_ids");
    for (const id of selectedCategoryIds) formData.append("category_ids", id);

    const result = isEditing ? await updatePsd(psd.id, formData) : await createPsd(formData);

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
      title={isEditing ? `Editar PSD — ${psd.title}` : "Novo PSD"}
      description="Esses dados alimentam a biblioteca pública em /psd."
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Input
          label="Título"
          name="title"
          defaultValue={psd?.title}
          placeholder="Ex: Kit Stories Culto de Jovens"
          required
          disabled={loading}
          onChange={handleTitleChange}
        />

        <Input
          label="Slug"
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          placeholder="kit-stories-culto-de-jovens"
          hint="Usado na URL pública (/psd/...)."
          required
          disabled={loading}
        />

        <Textarea
          label="Descrição"
          name="description"
          defaultValue={psd?.description ?? ""}
          placeholder="Uma descrição curta do material, visível na página de detalhes."
          rows={3}
          disabled={loading}
        />

        <div className="w-full">
          <label htmlFor="content_type" className="mb-1.5 block text-sm font-medium text-foreground">
            Seção
          </label>
          <select
            id="content_type"
            name="content_type"
            defaultValue={psd?.content_type ?? "psd"}
            disabled={loading}
            className="h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {CONTENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-muted-foreground">Em qual parte do menu esse item aparece.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Custo em créditos"
            name="credit_cost"
            type="number"
            step="1"
            min="0"
            defaultValue={psd?.credit_cost ?? 0}
            required
            disabled={loading}
          />
          <Input
            label="Dimensões (opcional)"
            name="dimensions"
            defaultValue={psd?.dimensions ?? ""}
            placeholder="1080x1920px"
            disabled={loading}
          />
        </div>

        <Input
          label="Quantidade de slides (opcional)"
          name="slides_count"
          type="number"
          step="1"
          min="1"
          defaultValue={psd?.slides_count ?? ""}
          placeholder="Ex: 5 (para carrosséis)"
          hint="Mostrado no card de detalhes quando o material for um carrossel."
          disabled={loading}
        />

        <div>
          <p className="mb-1.5 text-sm font-medium text-foreground">Categorias</p>
          {categories.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma categoria cadastrada ainda.</p>
          ) : (
            <div className="flex flex-wrap gap-2 rounded-lg border border-border p-3">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground has-[:checked]:border-accent has-[:checked]:bg-accent-50 has-[:checked]:text-accent-700"
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedCategoryIds.has(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    disabled={loading}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-lg border border-border p-3">
          <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <FileImage className="h-4 w-4" />
            Arquivos
          </p>

          <div>
            <label htmlFor="thumbnail" className="mb-1 block text-xs font-medium text-muted-foreground">
              Thumbnail (capa do card){isEditing && psd?.thumbnail_url ? " — enviar substitui a atual" : ""}
            </label>
            <input
              id="thumbnail"
              name="thumbnail"
              type="file"
              accept="image/*"
              disabled={loading}
              className="w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground"
            />
          </div>

          <div>
            <label htmlFor="preview" className="mb-1 block text-xs font-medium text-muted-foreground">
              Preview (imagem grande na página de detalhes){isEditing && psd?.preview_url ? " — enviar substitui a atual" : ""}
            </label>
            <input
              id="preview"
              name="preview"
              type="file"
              accept="image/*"
              disabled={loading}
              className="w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground"
            />
          </div>

          <div>
            <label htmlFor="original" className="mb-1 block text-xs font-medium text-muted-foreground">
              Arquivo PSD original {isEditing ? "(opcional — deixe em branco para manter o atual)" : "(opcional se preencher o link do Canva abaixo)"}
            </label>
            <input
              id="original"
              name="original"
              type="file"
              disabled={loading}
              className="w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground"
            />
            {isEditing && psd?.file_format && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Atual: {psd.file_format}
                {psd.file_size ? ` · ${formatBytes(psd.file_size)}` : ""}
              </p>
            )}
          </div>

          <Input
            label="Link do template no Canva (opcional se enviar o PSD acima)"
            name="canva_url"
            type="url"
            defaultValue={psd?.canva_url ?? ""}
            placeholder="https://www.canva.com/design/..."
            hint="Pelo menos um dos dois — arquivo PSD ou link do Canva — precisa existir."
            disabled={loading}
          />
        </div>

        <Input
          label="Link do YouTube (opcional)"
          name="youtube_url"
          type="url"
          defaultValue={psd?.youtube_url ?? ""}
          placeholder="https://www.youtube.com/watch?v=..."
          hint="Se preenchido, este item vira um slide de vídeo no carrossel de destaques da home, em vez de imagem."
          disabled={loading}
        />

        <div className="flex items-center gap-6 pt-1">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={psd?.is_featured ?? false}
              disabled={loading}
              className="h-4 w-4 rounded border-input text-accent focus-visible:ring-2 focus-visible:ring-accent"
            />
            Destaque da semana (carrossel da home)
          </label>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={psd?.is_published ?? false}
              disabled={loading}
              className="h-4 w-4 rounded border-input text-accent focus-visible:ring-2 focus-visible:ring-accent"
            />
            Publicado (visível em /psd)
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent" loading={loading}>
            {isEditing ? "Salvar alterações" : "Criar PSD"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
