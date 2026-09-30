"use client";

import * as React from "react";
import Image from "next/image";
import { AlertCircle, Search, ImageOff } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createHomeSection, updateHomeSection } from "@/app/admin/secoes/actions";
import type { HomeSectionWithCount } from "@/lib/home-sections";
import type { PsdFile } from "@/lib/types/psd";

export interface HomeSectionFormModalProps {
  open: boolean;
  onClose: () => void;
  section?: HomeSectionWithCount | null;
  allPsds: PsdFile[];
}

export function HomeSectionFormModal({ open, onClose, section, allPsds }: HomeSectionFormModalProps) {
  const isEditing = !!section;
  const [selectedIds, setSelectedIds] = React.useState<string[]>(section?.itemIds ?? []);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setSelectedIds(section?.itemIds ?? []);
      setSearch("");
      setError(null);
    }
  }, [open, section]);

  function toggleItem(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }

  const filteredPsds = search.trim()
    ? allPsds.filter((psd) => psd.title.toLowerCase().includes(search.trim().toLowerCase()))
    : allPsds;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.delete("psd_ids");
    for (const id of selectedIds) formData.append("psd_ids", id);

    const result = isEditing ? await updateHomeSection(section.id, formData) : await createHomeSection(formData);

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
      title={isEditing ? `Editar seção — ${section.title}` : "Nova seção"}
      description="Aparece como uma fileira na página inicial, com os itens que você escolher."
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex max-h-[75vh] flex-col gap-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input label="Nome da seção" name="title" defaultValue={section?.title} placeholder="Ex: Promoções da semana" required disabled={loading} />
          <Input label="Ordem" name="sort_order" type="number" min={0} defaultValue={section?.sort_order ?? 0} hint="Seções com número menor aparecem primeiro." disabled={loading} />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={section?.is_active ?? true}
            disabled={loading}
            className="h-4 w-4 rounded border-input text-accent focus-visible:ring-2 focus-visible:ring-accent"
          />
          Ativa (visível na home)
        </label>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Itens da seção ({selectedIds.length} selecionado{selectedIds.length === 1 ? "" : "s"})</p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar..."
              className="h-10 w-full rounded-lg border border-input bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <div className="flex-1 overflow-y-auto rounded-lg border border-border">
            {filteredPsds.length === 0 ? (
              <p className="p-4 text-center text-xs text-muted-foreground">Nenhum item encontrado.</p>
            ) : (
              <div className="divide-y divide-border">
                {filteredPsds.map((psd) => {
                  const checked = selectedIds.includes(psd.id);
                  return (
                    <label
                      key={psd.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-muted",
                        checked && "bg-accent-50"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItem(psd.id)}
                        disabled={loading}
                        className="h-4 w-4 shrink-0 rounded border-input text-accent focus-visible:ring-2 focus-visible:ring-accent"
                      />
                      <div className="relative h-9 w-8 shrink-0 overflow-hidden rounded-md bg-muted">
                        {psd.thumbnail_url ? (
                          <Image src={psd.thumbnail_url} alt="" fill sizes="32px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                            <ImageOff className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                      <span className="truncate">{psd.title}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent" loading={loading}>
            {isEditing ? "Salvar alterações" : "Criar seção"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
