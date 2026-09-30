"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCreditPackage, updateCreditPackage } from "@/app/admin/creditos/actions";
import type { CreditPackage } from "@/lib/types/credit-package";

export interface CreditPackageFormModalProps {
  open: boolean;
  onClose: () => void;
  creditPackage?: CreditPackage | null;
}

export function CreditPackageFormModal({ open, onClose, creditPackage }: CreditPackageFormModalProps) {
  const isEditing = !!creditPackage;
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) setError(null);
  }, [open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = isEditing
      ? await updateCreditPackage(creditPackage.id, formData)
      : await createCreditPackage(formData);

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
      title={isEditing ? `Editar pacote — ${creditPackage.name}` : "Novo pacote de créditos"}
      description="Aparece em Meus Créditos como opção de compra extra. A cobrança em si ainda é manual (fora da plataforma)."
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
          defaultValue={creditPackage?.name}
          placeholder="Ex: Pacote 50 créditos"
          required
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Créditos"
            name="credits_amount"
            type="number"
            min={1}
            step="1"
            defaultValue={creditPackage?.credits_amount}
            required
            disabled={loading}
          />
          <Input
            label="Preço (R$)"
            name="price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={creditPackage?.price}
            required
            disabled={loading}
          />
        </div>

        <Input
          label="Ordem"
          name="sort_order"
          type="number"
          min={0}
          defaultValue={creditPackage?.sort_order ?? 0}
          hint="Pacotes com número menor aparecem primeiro."
          disabled={loading}
        />

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={creditPackage?.is_active ?? true}
            disabled={loading}
            className="h-4 w-4 rounded border-input text-accent focus-visible:ring-2 focus-visible:ring-accent"
          />
          Ativo (visível em Meus Créditos)
        </label>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent" loading={loading}>
            {isEditing ? "Salvar alterações" : "Criar pacote"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
