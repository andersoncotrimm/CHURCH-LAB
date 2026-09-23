import { createClient } from "@/utils/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminConfiguracoesPage() {
  const supabase = await createClient();
  const settings = await getSiteSettings(supabase);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Nome e cores da plataforma. Alterações aqui valem para todo mundo, em todo o site.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
