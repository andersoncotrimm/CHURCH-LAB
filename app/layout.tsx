import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import { hexToHslTriple, layerLightness, contrastingForeground, shiftLightness, isDarkTriple, buildAccentScale } from "@/lib/color";
import { SiteSettingsProvider } from "@/components/brand/site-settings-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const settings = await getSiteSettings(supabase);

  return {
    title: {
      default: `${settings.siteName} — Plataforma digital para igrejas`,
      template: `%s · ${settings.siteName}`,
    },
    description:
      "CHURCH-LAB reúne eventos, pessoas, comunicação, arquivos e ministérios em um único painel para igrejas e equipes de comunicação.",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const settings = await getSiteSettings(supabase);

  const background = hexToHslTriple(settings.backgroundColor);
  const accent = hexToHslTriple(settings.buttonColor);
  const accentScale = buildAccentScale(accent);
  const accentScaleVars = Object.entries(accentScale)
    .map(([stop, value]) => `--accent-${stop}:${value};`)
    .join("");

  // Texto e camadas (superfície/borda) se adaptam ao fundo escolhido —
  // escuro clareia pra cima (tema original), claro escurece pra baixo
  // (ex: fundo branco + texto preto), em vez de ficar sempre fixo no
  // tema escuro original.
  const foreground = contrastingForeground(settings.backgroundColor);
  const mutedForeground = shiftLightness(foreground, isDarkTriple(background) ? -35 : 35);
  const themeOverrides = `:root{--background:${background};--foreground:${foreground};--surface:${layerLightness(background, 5)};--muted:${layerLightness(background, 11)};--muted-foreground:${mutedForeground};--border:${layerLightness(background, 15)};--input:${layerLightness(background, 17)};--accent:${accent};--accent-2:${shiftLightness(accent, -9)};--ring:${accent};--accent-foreground:${contrastingForeground(settings.buttonColor)};${accentScaleVars}}`;

  // Vidro (barra lateral/cabeçalho): tom claro ou escuro + transparência,
  // ambos configuráveis em /admin/configuracoes. `.glass-root` (o painel
  // que ocupa a tela toda) fica mais opaco de propósito — nada de blur
  // nele, que é caro demais numa área do tamanho da viewport inteira e
  // atrasa a primeira pintura da página; só `.glass-panel` (sidebar e
  // cabeçalho, áreas pequenas) usa backdrop-blur de verdade.
  const glassRgb = settings.glassTint === "light" ? "255 255 255" : "0 0 0";
  const glassAlpha = Math.max(0, Math.min(100, settings.glassOpacity)) / 100;
  const glassRootAlpha = Math.min(0.97, glassAlpha + 0.25);
  const glassStyles =
    `:root{--glass-rgb:${glassRgb};--glass-alpha:${glassAlpha};--glass-root-alpha:${glassRootAlpha};}` +
    `.glass-panel{background-color:rgb(var(--glass-rgb) / var(--glass-alpha));backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);}` +
    `.glass-root{background-color:rgb(var(--glass-rgb) / var(--glass-root-alpha));}`;

  // Imagem de fundo fixa (por formato de tela), atrás de tudo — a sidebar
  // e o header ficam com efeito de vidro (blur) por cima dela.
  const cssUrl = (url: string) => `url("${url.replace(/"/g, '\\"')}")`;
  const hasBackgroundImage = !!settings.backgroundImageMobileUrl;
  const backgroundStyles = hasBackgroundImage
    ? `body{background-color:transparent !important;background-image:none !important;}` +
      `.site-bg{background-image:${cssUrl(settings.backgroundImageMobileUrl!)};background-size:cover;background-position:center;}` +
      (settings.backgroundImageTabletUrl
        ? `@media (min-width:768px){.site-bg{background-image:${cssUrl(settings.backgroundImageTabletUrl)};}}`
        : "") +
      (settings.backgroundImageDesktopUrl
        ? `@media (min-width:1280px){.site-bg{background-image:${cssUrl(settings.backgroundImageDesktopUrl)};}}`
        : "")
    : "";

  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <style
          id="site-theme"
          dangerouslySetInnerHTML={{ __html: themeOverrides + glassStyles + backgroundStyles }}
        />
      </head>
      <body className="min-h-screen font-sans">
        {hasBackgroundImage && <div className="site-bg fixed inset-0 -z-10" aria-hidden="true" />}
        <SiteSettingsProvider siteName={settings.siteName}>{children}</SiteSettingsProvider>
      </body>
    </html>
  );
}
