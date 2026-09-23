import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import { hexToHslTriple, shiftLightness, contrastingForeground } from "@/lib/color";
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

  const themeOverrides = `:root{--background:${background};--surface:${shiftLightness(background, 5)};--muted:${shiftLightness(background, 11)};--border:${shiftLightness(background, 15)};--input:${shiftLightness(background, 17)};--accent:${accent};--accent-2:${shiftLightness(accent, -9)};--ring:${accent};--accent-foreground:${contrastingForeground(settings.buttonColor)};}`;

  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <style id="site-theme" dangerouslySetInnerHTML={{ __html: themeOverrides }} />
      </head>
      <body className="min-h-screen font-sans">
        <SiteSettingsProvider siteName={settings.siteName}>{children}</SiteSettingsProvider>
      </body>
    </html>
  );
}
