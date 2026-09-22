"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/slugify";
import { createPlan, updatePlan } from "@/app/admin/planos/actions";
import type { Plan } from "@/lib/types/plan";

export interface PlanFormModalProps {
  open: boolean;
  onClose: () => void;
  plan?: Plan | null;
}

export function PlanFormModal({ open, onClose, plan }: PlanFormModalProps) {
  const isEditing = !!plan;
  const [slugTouched, setSlugTouched] = React.useState(isEditing);
  const [slug, setSlug] = React.useState(plan?.slug ?? "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setSlug(plan?.slug ?? "");
      setSlugTouched(!!plan);
      setError(null);
    }
  }, [open, plan]);

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!slugTouched) {
      setSlug(slugify(event.target.value));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = isEditing ? await updatePlan(plan.id, formData) : await createPlan(formData);

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
      title={isEditing ? `Editar plano — ${plan.name}` : "Novo plano"}
      description="Esses dados alimentam diretamente a página pública de planos."
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Input
          label="Nome"
          name="name"
          defaultValue={plan?.name}
          placeholder="Ex: Pro"
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
          placeholder="ex-pro"
          hint="Usado na URL e como identificador único do plano."
          required
          disabled={loading}
        />

        <Textarea
          label="Descrição"
          name="description"
          defaultValue={plan?.description ?? ""}
          placeholder="Uma frase curta sobre para quem é este plano."
          rows={2}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Preço (R$)"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={plan?.price ?? 0}
            required
            disabled={loading}
          />

          <div className="w-full">
            <label htmlFor="billing_interval" className="mb-1.5 block text-sm font-medium text-foreground">
              Período de cobrança
            </label>
            <select
              id="billing_interval"
              name="billing_interval"
              defaultValue={plan?.billing_interval ?? "monthly"}
              disabled={loading}
              className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Créditos por ciclo"
            name="monthly_credits"
            type="number"
            step="1"
            min="0"
            defaultValue={plan?.monthly_credits ?? 0}
            required
            disabled={loading}
          />

          <Input
            label="Ordem de exibição"
            name="display_order"
            type="number"
            step="1"
            min="0"
            defaultValue={plan?.display_order ?? 0}
            hint="Menor número aparece primeiro."
            required
            disabled={loading}
          />
        </div>

        <Textarea
          label="Benefícios"
          name="benefits"
          defaultValue={plan?.benefits?.join("\n") ?? ""}
          placeholder={"Um benefício por linha, ex.:\n100 créditos por mês\nSuporte prioritário"}
          rows={4}
          hint="Um item por linha — aparece como lista na página pública."
          disabled={loading}
        />

        <Textarea
          label="Limites (opcional)"
          name="limits"
          defaultValue={
            plan?.limits && Object.keys(plan.limits).length > 0
              ? JSON.stringify(plan.limits, null, 2)
              : ""
          }
          placeholder='{"maxDownloadsPerDay": 10}'
          rows={3}
          hint="Formato livre em JSON, para limites adicionais no futuro. Deixe em branco se não usar."
          className="font-mono text-xs"
          disabled={loading}
        />

        <div className="flex items-center gap-6 pt-1">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={plan?.is_featured ?? false}
              disabled={loading}
              className="h-4 w-4 rounded border-input text-accent focus-visible:ring-2 focus-visible:ring-accent"
            />
            Destacar na página pública
          </label>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={plan?.is_active ?? true}
              disabled={loading}
              className="h-4 w-4 rounded border-input text-accent focus-visible:ring-2 focus-visible:ring-accent"
            />
            Ativo (visível publicamente)
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent" loading={loading}>
            {isEditing ? "Salvar alterações" : "Criar plano"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
