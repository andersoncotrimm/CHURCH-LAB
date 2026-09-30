"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
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

function BackgroundImageField({
  label,
  currentUrl,
  fileName,
  onFileChange,
  disabled,
}: {
  label: string;
  currentUrl: string | null;
  fileName?: string;
  onFileChange: (file: File | null) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-3">
        {currentUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt="" className="h-12 w-20 shrink-0 rounded-md border border-border object-cover" />
        )}
        <input
          type="file"
          accept="image/*"
          disabled={disabled}
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          className="w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground"
        />
      </div>
      {fileName && <p className="text-xs text-success">Selecionada: {fileName}</p>}
    </div>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [siteName, setSiteName] = React.useState(settings.siteName);
  const [backgroundColor, setBackgroundColor] = React.useState(settings.backgroundColor);
  const [buttonColor, setButtonColor] = React.useState(settings.buttonColor);
  const [carouselInterval, setCarouselInterval] = React.useState(settings.carouselIntervalSeconds);
  const [referencePinterestUrl, setReferencePinterestUrl] = React.useState(settings.referencePinterestUrl ?? "");
  const [sameForAll, setSameForAll] = React.useState(settings.backgroundImageSameForAll);
  const [glassOpacity, setGlassOpacity] = React.useState(settings.glassOpacity);
  const [glassTint, setGlassTint] = React.useState<"dark" | "light">(settings.glassTint);
  const [notifyNewFiles, setNotifyNewFiles] = React.useState(settings.notifyNewFiles);
  const [notifyPlatformUpdates, setNotifyPlatformUpdates] = React.useState(settings.notifyPlatformUpdates);
  const [mobileFile, setMobileFile] = React.useState<File | null>(null);
  const [tabletFile, setTabletFile] = React.useState<File | null>(null);
  const [desktopFile, setDesktopFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function uploadBackground(file: File, suffix: string): Promise<string> {
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `fundo-${suffix}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("site-backgrounds")
      .upload(path, file, { upsert: true, contentType: file.type || undefined });
    if (uploadError) throw new Error(`Falha ao enviar a imagem (${suffix}): ${uploadError.message}`);
    return supabase.storage.from("site-backgrounds").getPublicUrl(path).data.publicUrl;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData(event.currentTarget);

      let mobileUrl = settings.backgroundImageMobileUrl ?? "";
      let tabletUrl = settings.backgroundImageTabletUrl ?? "";
      let desktopUrl = settings.backgroundImageDesktopUrl ?? "";

      if (mobileFile) mobileUrl = await uploadBackground(mobileFile, "mobile");
      if (!sameForAll && tabletFile) tabletUrl = await uploadBackground(tabletFile, "tablet");
      if (!sameForAll && desktopFile) desktopUrl = await uploadBackground(desktopFile, "desktop");

      formData.set("background_image_mobile_url", mobileUrl);
      formData.set("background_image_tablet_url", tabletUrl);
      formData.set("background_image_desktop_url", desktopUrl);

      const result = await updateSiteSettings(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setMobileFile(null);
      setTabletFile(null);
      setDesktopFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
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

      <Input
        label="Tempo de cada slide do carrossel de destaques (segundos)"
        name="carousel_interval_seconds"
        type="number"
        min={2}
        max={60}
        value={carouselInterval}
        onChange={(event) => setCarouselInterval(Number(event.target.value))}
        disabled={loading}
        hint="Quanto tempo cada destaque (imagem ou vídeo) fica visível antes de avançar sozinho, na home e no dashboard."
      />

      <Input
        label="Link da pasta de referências no Pinterest (opcional)"
        name="reference_pinterest_url"
        type="url"
        value={referencePinterestUrl}
        onChange={(event) => setReferencePinterestUrl(event.target.value)}
        placeholder="https://www.pinterest.com/usuario/pasta/"
        disabled={loading}
        hint="As imagens dessa pasta aparecem em /referencias, visível pra todo mundo no menu."
      />

      <div className="space-y-4 rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Imagem de fundo</p>
          <p className="text-xs text-muted-foreground">
            Fica atrás de tudo, com um efeito de vidro por cima. Como o site é responsivo, dá pra usar uma imagem
            diferente por formato de tela.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="background_image_same_for_all"
            checked={sameForAll}
            onChange={(event) => setSameForAll(event.target.checked)}
            disabled={loading}
            className="h-4 w-4 rounded border-input text-accent focus-visible:ring-2 focus-visible:ring-accent"
          />
          Usar a mesma imagem para os 3 formatos
        </label>

        <BackgroundImageField
          label={sameForAll ? "Imagem de fundo (todos os formatos)" : "Imagem de fundo — celular"}
          currentUrl={settings.backgroundImageMobileUrl}
          fileName={mobileFile?.name}
          onFileChange={setMobileFile}
          disabled={loading}
        />

        {!sameForAll && (
          <>
            <BackgroundImageField
              label="Imagem de fundo — tablet"
              currentUrl={settings.backgroundImageTabletUrl}
              fileName={tabletFile?.name}
              onFileChange={setTabletFile}
              disabled={loading}
            />
            <BackgroundImageField
              label="Imagem de fundo — computador"
              currentUrl={settings.backgroundImageDesktopUrl}
              fileName={desktopFile?.name}
              onFileChange={setDesktopFile}
              disabled={loading}
            />
          </>
        )}
      </div>

      <div className="space-y-4 rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Vidro (barra lateral e cabeçalho)</p>
          <p className="text-xs text-muted-foreground">
            Controla o quanto a barra lateral e o cabeçalho ficam transparentes sobre a imagem de fundo, e se o
            vidro é escuro ou claro.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="flex items-center justify-between text-sm font-medium text-foreground">
            Transparência
            <span className="text-xs font-normal text-muted-foreground">{glassOpacity}% opaco</span>
          </label>
          <input
            type="range"
            name="glass_opacity"
            min={0}
            max={100}
            value={glassOpacity}
            onChange={(event) => setGlassOpacity(Number(event.target.value))}
            disabled={loading}
            className="range-slider-thumb h-2 w-full cursor-pointer appearance-none rounded-full bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Mais pra esquerda = mais transparente (vidro), mais pra direita = mais sólido.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Tom do vidro</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGlassTint("dark")}
              disabled={loading}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                glassTint === "dark"
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-input text-muted-foreground hover:bg-muted"
              }`}
            >
              Escuro
            </button>
            <button
              type="button"
              onClick={() => setGlassTint("light")}
              disabled={loading}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                glassTint === "light"
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-input text-muted-foreground hover:bg-muted"
              }`}
            >
              Claro
            </button>
          </div>
          <input type="hidden" name="glass_tint" value={glassTint} />
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Notificações</p>
          <p className="text-xs text-muted-foreground">
            Escolha quais tipos de aviso aparecem no sino do cabeçalho pra todo mundo.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="notify_new_files"
            checked={notifyNewFiles}
            onChange={(event) => setNotifyNewFiles(event.target.checked)}
            disabled={loading}
            className="h-4 w-4 rounded border-input text-accent focus-visible:ring-2 focus-visible:ring-accent"
          />
          Novos arquivos adicionados
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="notify_platform_updates"
            checked={notifyPlatformUpdates}
            onChange={(event) => setNotifyPlatformUpdates(event.target.checked)}
            disabled={loading}
            className="h-4 w-4 rounded border-input text-accent focus-visible:ring-2 focus-visible:ring-accent"
          />
          Atualizações e mudanças na plataforma
        </label>
      </div>

      <div>
        <Button type="submit" variant="accent" loading={loading}>
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
