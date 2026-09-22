"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Power, AlertCircle, Star } from "lucide-react";
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
import { PlanFormModal } from "@/components/admin/plan-form-modal";
import { togglePlanActive, deletePlan } from "@/app/admin/planos/actions";
import type { Plan } from "@/lib/types/plan";

function formatPrice(price: number, interval: "monthly" | "yearly") {
  const value = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
  return `${value} / ${interval === "monthly" ? "mês" : "ano"}`;
}

export function PlansTable({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = React.useState<Plan | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  function openCreate() {
    setEditingPlan(null);
    setFormOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditingPlan(plan);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingPlan(null);
    router.refresh();
  }

  async function handleToggle(plan: Plan) {
    setBusyId(plan.id);
    setActionError(null);
    const result = await togglePlanActive(plan.id, !plan.is_active);
    setBusyId(null);
    if (result.error) {
      setActionError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!deletingPlan) return;
    setBusyId(deletingPlan.id);
    setActionError(null);
    const result = await deletePlan(deletingPlan.id);
    setBusyId(null);
    if (result.error) {
      setActionError(result.error);
      setDeletingPlan(null);
      return;
    }
    setDeletingPlan(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {plans.length} plano{plans.length === 1 ? "" : "s"} cadastrado{plans.length === 1 ? "" : "s"}
        </p>
        <Button variant="accent" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Novo plano
        </Button>
      </div>

      {actionError && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      {plans.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-6 w-6" />}
          title="Nenhum plano cadastrado"
          description="Crie o primeiro plano para que ele apareça na página pública de planos."
          action={
            <Button variant="accent" onClick={openCreate}>
              Criar plano
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plano</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Créditos/ciclo</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>
                  <span className="flex items-center gap-2 font-medium">
                    {plan.name}
                    {plan.is_featured && (
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-label="Destaque" />
                    )}
                  </span>
                  <span className="block text-xs text-muted-foreground">/{plan.slug}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatPrice(plan.price, plan.billing_interval)}
                </TableCell>
                <TableCell className="text-muted-foreground">{plan.monthly_credits}</TableCell>
                <TableCell className="text-muted-foreground">{plan.display_order}</TableCell>
                <TableCell>
                  <Badge variant={plan.is_active ? "success" : "neutral"}>
                    {plan.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(plan)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={`Editar ${plan.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(plan)}
                      disabled={busyId === plan.id}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                      aria-label={plan.is_active ? `Desativar ${plan.name}` : `Ativar ${plan.name}`}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingPlan(plan)}
                      disabled={busyId === plan.id}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                      aria-label={`Excluir ${plan.name}`}
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

      <PlanFormModal open={formOpen} onClose={closeForm} plan={editingPlan} />

      <Modal
        open={!!deletingPlan}
        onClose={() => setDeletingPlan(null)}
        title={`Excluir "${deletingPlan?.name}"?`}
        description="Essa ação não pode ser desfeita. Se houver assinaturas vinculadas a este plano, a exclusão será bloqueada — desative o plano nesse caso."
        footer={
          <>
            <Button variant="outline" onClick={() => setDeletingPlan(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={busyId === deletingPlan?.id}>
              Excluir
            </Button>
          </>
        }
      />
    </div>
  );
}
