"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateSiteSettings } from "@/app/admin/configuracoes/actions";
import type { SiteSettings } from "@/lib/settings";

function ColorField({
  label,
  name,
  value,
  onChange,
  hint,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  hint: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-input bg-surface p-1"
          aria-label={label}
        />
        <input
          type="text"
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 flex-1 rounded-lg border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [siteName, setSiteName] = React.useState(settings.siteName);
  const [backgroundColor, setBackgroundColor] = React.useState(settings.backgroundColor);
  const [buttonColor, setButtonColor] = React.useState(settings.buttonColor);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const result = await updateSiteSettings(new FormData(event.currentTarget));
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          Configurações salvas. A mudança já vale para todo mundo.
        </div>
      )}

      <Input
        label="Nome da plataforma"
        name="site_name"
        value={siteName}
        onChange={(event) => setSiteName(event.target.value)}
        maxLength={40}
        required
        disabled={loading}
        hint="Aparece na logo, no menu e no título das páginas."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <ColorField
          label="Cor de fundo"
          name="background_color"
          value={backgroundColor}
          onChange={setBackgroundColor}
          hint="Fundo geral do site. As superfícies (cards, menus) são derivadas dela."
        />
        <ColorField
          label="Cor dos botões"
          name="button_color"
          value={buttonColor}
          onChange={setButtonColor}
          hint="Cor de destaque: botões, links ativos e realces."
        />
      </div>

      <div>
        <Button type="submit" variant="accent" loading={loading}>
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
