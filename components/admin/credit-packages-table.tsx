"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, AlertCircle, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditPackageFormModal } from "@/components/admin/credit-package-form-modal";
import { deleteCreditPackage, toggleCreditPackageActive } from "@/app/admin/creditos/actions";
import type { CreditPackage } from "@/lib/types/credit-package";

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CreditPackagesTable({ packages }: { packages: CreditPackage[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CreditPackage | null>(null);
  const [deleting, setDeleting] = React.useState<CreditPackage | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(pkg: CreditPackage) {
    setEditing(pkg);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function handleToggleActive(pkg: CreditPackage) {
    setBusyId(pkg.id);
    setActionError(null);
    const result = await toggleCreditPackageActive(pkg.id, !pkg.is_active);
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
    const result = await deleteCreditPackage(deleting.id);
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
          {packages.length} pacote{packages.length === 1 ? "" : "s"} cadastrado{packages.length === 1 ? "" : "s"}
        </p>
        <Button variant="accent" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Novo pacote
        </Button>
      </div>

      {actionError && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      {packages.length === 0 ? (
        <EmptyState
          icon={<Coins className="h-6 w-6" />}
          title="Nenhum pacote cadastrado"
          description="Crie opções de créditos extras pra aparecer em Meus Créditos."
          action={
            <Button variant="accent" onClick={openCreate}>
              Criar pacote
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pacote</TableHead>
              <TableHead>Créditos</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell>
                  <span className="font-medium">{pkg.name}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{pkg.credits_amount}</TableCell>
                <TableCell className="text-muted-foreground">{formatPrice(pkg.price)}</TableCell>
                <TableCell className="text-muted-foreground">{pkg.sort_order}</TableCell>
                <TableCell>
                  <button
                    onClick={() => handleToggleActive(pkg)}
                    disabled={busyId === pkg.id}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      pkg.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {pkg.is_active ? "Ativo" : "Inativo"}
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(pkg)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={`Editar ${pkg.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(pkg)}
                      disabled={busyId === pkg.id}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                      aria-label={`Excluir ${pkg.name}`}
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

      <CreditPackageFormModal open={formOpen} onClose={closeForm} creditPackage={editing} />

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Excluir "${deleting?.name}"?`}
        description="Essa ação não pode ser desfeita. O pacote some de Meus Créditos."
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
