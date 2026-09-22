"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldOff, Gift, AlertCircle, Zap } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { grantSubscription, setUserAdmin } from "@/app/admin/usuarios/actions";
import type { Plan } from "@/lib/types/plan";

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  plan_name: string | null;
  credits_available: number | null;
  subscription_status: string | null;
}

export function UsersTable({ users, plans }: { users: AdminUserRow[]; plans: Plan[] }) {
  const router = useRouter();
  const [grantingUser, setGrantingUser] = React.useState<AdminUserRow | null>(null);
  const [selectedPlanId, setSelectedPlanId] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  function openGrant(user: AdminUserRow) {
    setGrantingUser(user);
    setSelectedPlanId(plans[0]?.id ?? "");
    setActionError(null);
  }

  async function handleGrant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!grantingUser || !selectedPlanId) return;
    setBusyId(grantingUser.id);
    setActionError(null);
    const result = await grantSubscription(grantingUser.id, selectedPlanId);
    setBusyId(null);
    if (result.error) {
      setActionError(result.error);
      return;
    }
    setGrantingUser(null);
    router.refresh();
  }

  async function handleToggleAdmin(user: AdminUserRow) {
    setBusyId(user.id);
    setActionError(null);
    const result = await setUserAdmin(user.id, !user.is_admin);
    setBusyId(null);
    if (result.error) {
      setActionError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        {users.length} usuário{users.length === 1 ? "" : "s"} cadastrado{users.length === 1 ? "" : "s"}
      </p>

      {actionError && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      {users.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center text-sm text-muted-foreground">
          Nenhum usuário cadastrado ainda.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Créditos</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={user.full_name || user.email} size="sm" />
                    <div className="min-w-0">
                      <span className="block truncate font-medium">{user.full_name || "Sem nome"}</span>
                      <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {user.plan_name ? (
                    <Badge variant="accent">{user.plan_name}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sem plano</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.credits_available !== null ? (
                    <span className="inline-flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" />
                      {user.credits_available}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_admin ? "success" : "neutral"}>
                    {user.is_admin ? "Admin" : "Usuário"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openGrant(user)}
                      disabled={busyId === user.id || plans.length === 0}
                    >
                      <Gift className="h-3.5 w-3.5" />
                      Conceder plano
                    </Button>
                    <button
                      onClick={() => handleToggleAdmin(user)}
                      disabled={busyId === user.id}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                      aria-label={user.is_admin ? `Remover admin de ${user.email}` : `Tornar ${user.email} admin`}
                      title={user.is_admin ? "Remover admin" : "Tornar admin"}
                    >
                      {user.is_admin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        open={!!grantingUser}
        onClose={() => setGrantingUser(null)}
        title={`Conceder plano — ${grantingUser?.full_name || grantingUser?.email}`}
        description="Ativa (ou substitui) a assinatura do usuário e credita o saldo cheio do plano escolhido agora."
        className="max-w-md"
      >
        <form onSubmit={handleGrant} className="space-y-4">
          <div>
            <label htmlFor="plan_id" className="mb-1.5 block text-sm font-medium text-foreground">
              Plano
            </label>
            <select
              id="plan_id"
              value={selectedPlanId}
              onChange={(event) => setSelectedPlanId(event.target.value)}
              disabled={busyId === grantingUser?.id}
              className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — {plan.monthly_credits} créditos
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setGrantingUser(null)} disabled={busyId === grantingUser?.id}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent" loading={busyId === grantingUser?.id}>
              Conceder
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
