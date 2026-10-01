import { ShieldCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { PlatformVersionsPanel } from "@/components/admin/platform-versions-panel";
import type { PlatformVersion } from "@/lib/types/platform-version";

export const dynamic = "force-dynamic";

export default async function AdminSegurancaPage() {
  const supabase = await createClient();

  const { data: versions, error } = await supabase
    .from("platform_versions")
    .select("*")
    .order("released_at", { ascending: false });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Segurança</h1>
        <p className="text-sm text-muted-foreground">
          Histórico de versões e atualizações da plataforma — cada alteração feita fica registrada aqui, com a
          confirmação de que o sistema foi verificado e está funcionando normalmente.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/5 p-4 text-sm text-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        <p>
          A verificação de cada atualização acontece antes dela ir pro ar (checagem de tipos, lint e build de
          produção) — o status registrado abaixo reflete esse resultado.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          Não foi possível carregar o histórico: {error.message}
        </div>
      ) : (
        <PlatformVersionsPanel versions={(versions ?? []) as PlatformVersion[]} />
      )}
    </div>
  );
}
