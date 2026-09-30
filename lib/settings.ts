import type { SupabaseClient } from "@supabase/supabase-js";

export interface SiteSettings {
  siteName: string;
  backgroundColor: string;
  buttonColor: string;
  carouselIntervalSeconds: number;
  referencePinterestUrl: string | null;
  backgroundImageMobileUrl: string | null;
  backgroundImageTabletUrl: string | null;
  backgroundImageDesktopUrl: string | null;
  backgroundImageSameForAll: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "CHURCH-LAB",
  backgroundColor: "#0a0a0c",
  buttonColor: "#e60a15",
  carouselIntervalSeconds: 7,
  referencePinterestUrl: null,
  backgroundImageMobileUrl: null,
  backgroundImageTabletUrl: null,
  backgroundImageDesktopUrl: null,
  backgroundImageSameForAll: true,
};

/** Config global do site (nome, cores, carrossel, referências, fundo). Degrada para o padrão em qualquer falha. */
export async function getSiteSettings(supabase: SupabaseClient): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "site_name, background_color, button_color, carousel_interval_seconds, reference_pinterest_url, background_image_mobile_url, background_image_tablet_url, background_image_desktop_url, background_image_same_for_all"
      )
      .eq("id", true)
      .maybeSingle();

    if (error || !data) return DEFAULT_SETTINGS;

    return {
      siteName: data.site_name || DEFAULT_SETTINGS.siteName,
      backgroundColor: data.background_color || DEFAULT_SETTINGS.backgroundColor,
      buttonColor: data.button_color || DEFAULT_SETTINGS.buttonColor,
      carouselIntervalSeconds: data.carousel_interval_seconds || DEFAULT_SETTINGS.carouselIntervalSeconds,
      referencePinterestUrl: data.reference_pinterest_url || null,
      backgroundImageMobileUrl: data.background_image_mobile_url || null,
      backgroundImageTabletUrl: data.background_image_tablet_url || null,
      backgroundImageDesktopUrl: data.background_image_desktop_url || null,
      backgroundImageSameForAll: data.background_image_same_for_all ?? true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
