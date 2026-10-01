"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, AlertCircle, CheckCircle2, AlertTriangle, XCircle, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { createPlatformVersion, deletePlatformVersion } from "@/app/admin/seguranca/actions";
import type { PlatformVersion, PlatformVersionStatus } from "@/lib/types/platform-version";

const STATUS_META: Record<PlatformVersionStatus, { label: string; variant: "success" | "warning" | "danger"; icon: React.ComponentType<{ className?: string }> }> = {
  ok: { label: "Testado e funcionando", variant: "success", icon: CheckCircle2 },
  warning: { label: "Com ressalva", variant: "warning", icon: AlertTriangle },
  error: { label: "Com problema", variant: "danger", icon: XCircle },
};

export function PlatformVersionsPanel({ versions }: { versions: PlatformVersion[] }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createPlatformVersion(new FormData(event.currentTarget));
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    formRef.current?.reset();
    router.refresh();
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    const result = await deletePlatformVersion(id);
    setBusyId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-surface p-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr_160px]">
          <Input label="Versão" name="version" placeholder="1.1" required disabled={loading} />
          <Input label="Título" name="title" placeholder="Ex: Central de notificações" required disabled={loading} />
          <div className="w-full">
            <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-foreground">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue="ok"
              disabled={loading}
              className="h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <option value="ok">Testado e funcionando</option>
              <option value="warning">Com ressalva</option>
              <option value="error">Com problema</option>
            </select>
          </div>
        </div>

        <Textarea
          label="Descrição (opcional)"
          name="description"
          placeholder="O que mudou nessa atualização."
          rows={2}
          disabled={loading}
        />

        <div>
          <Button type="submit" variant="accent" loading={loading}>
            <Plus className="h-4 w-4" />
            Registrar atualização
          </Button>
        </div>
      </form>

      {versions.length === 0 ? (
        <EmptyState
          icon={<History className="h-6 w-6" />}
          title="Nenhuma atualização registrada ainda"
          description="Toda alteração feita na plataforma entra aqui, com a confirmação de que foi testada."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {versions.map((v) => {
            const meta = STATUS_META[v.status];
            const StatusIcon = meta.icon;
            return (
              <li key={v.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      v{v.version}
                    </Badge>
                    <span className="text-sm font-semibold text-foreground">{v.title}</span>
                    <Badge variant={meta.variant}>
                      <StatusIcon className="h-3 w-3" />
                      {meta.label}
                    </Badge>
                  </div>
                  {v.description && <p className="text-sm text-muted-foreground">{v.description}</p>}
                  <p className="text-xs text-muted-foreground">
                    {new Date(v.released_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(v.id)}
                  disabled={busyId === v.id}
                  aria-label={`Excluir versão ${v.version}`}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
