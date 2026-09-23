"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FILTER_ICONS } from "@/components/psd/library-controls";
import { FILTER_ICON_NAMES } from "@/lib/filter-icons";
import { createFilterType, updateFilterType } from "@/app/admin/filtros/actions";
import type { FilterType } from "@/lib/filters";

export interface FilterTypeFormModalProps {
  open: boolean;
  onClose: () => void;
  filter?: FilterType | null;
}

export function FilterTypeFormModal({ open, onClose, filter }: FilterTypeFormModalProps) {
  const isEditing = !!filter;
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) setError(null);
  }, [open, filter]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = isEditing ? await updateFilterType(filter.id, formData) : await createFilterType(formData);

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
      title={isEditing ? `Editar filtro — ${filter.label}` : "Novo filtro"}
      description="Filtros de tipo de arquivo aparecem na barra de filtros da biblioteca (/psd e demais seções)."
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Input label="Rótulo" name="label" defaultValue={filter?.label} placeholder="Ex: Vídeo" required disabled={loading} />

        <Input
          label="Valor"
          name="value"
          defaultValue={filter?.value}
          placeholder="video"
          hint="Usado na URL do filtro (?tipo=...). Letras minúsculas, números e hífens."
          required
          disabled={loading}
        />

        <div className="w-full">
          <label className="mb-1.5 block text-sm font-medium text-foreground">Ícone</label>
          <div className="grid grid-cols-5 gap-2">
            {FILTER_ICON_NAMES.map((name) => {
              const Icon = FILTER_ICONS[name];
              return (
                <label
                  key={name}
                  className="flex cursor-pointer items-center justify-center rounded-lg border border-input bg-surface p-2.5 text-muted-foreground transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent-50 has-[:checked]:text-accent-700"
                >
                  <input
                    type="radio"
                    name="icon"
                    value={name}
                    defaultChecked={(filter?.icon ?? "Layers") === name}
                    className="sr-only"
                    disabled={loading}
                  />
                  <Icon className="h-4 w-4" />
                </label>
              );
            })}
          </div>
        </div>

        <Input
          label="Ordem"
          name="sort_order"
          type="number"
          min={0}
          defaultValue={filter?.sort_order ?? 0}
          hint="Filtros com número menor aparecem primeiro."
          disabled={loading}
        />

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent" loading={loading}>
            {isEditing ? "Salvar alterações" : "Criar filtro"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
