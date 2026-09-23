import type { SupabaseClient } from "@supabase/supabase-js";

export interface SiteSettings {
  siteName: string;
  backgroundColor: string;
  buttonColor: string;
  carouselIntervalSeconds: number;
  referencePinterestUrl: string | null;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "CHURCH-LAB",
  backgroundColor: "#0a0a0c",
  buttonColor: "#e60a15",
  carouselIntervalSeconds: 7,
  referencePinterestUrl: null,
};

/** Config global do site (nome, cores, carrossel, referências). Degrada para o padrão em qualquer falha. */
export async function getSiteSettings(supabase: SupabaseClient): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("site_name, background_color, button_color, carousel_interval_seconds, reference_pinterest_url")
      .eq("id", true)
      .maybeSingle();

    if (error || !data) return DEFAULT_SETTINGS;

    return {
      siteName: data.site_name || DEFAULT_SETTINGS.siteName,
      backgroundColor: data.background_color || DEFAULT_SETTINGS.backgroundColor,
      buttonColor: data.button_color || DEFAULT_SETTINGS.buttonColor,
      carouselIntervalSeconds: data.carousel_interval_seconds || DEFAULT_SETTINGS.carouselIntervalSeconds,
      referencePinterestUrl: data.reference_pinterest_url || null,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
