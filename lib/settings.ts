import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentType } from "@/lib/types/psd";

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
  /** 0 (totalmente transparente) a 100 (opaco) — transparência do "vidro" da sidebar/cabeçalho. */
  glassOpacity: number;
  /** Tom do vidro: escuro (padrão) ou claro. */
  glassTint: "dark" | "light";
  notifyNewFiles: boolean;
  notifyPlatformUpdates: boolean;
  /** Link de contato (WhatsApp, etc.) pra finalizar a compra de créditos extras — sem gateway de pagamento ainda, o crédito é adicionado manualmente. */
  contactUrl: string | null;
  /** Preço (R$) por crédito avulso — usado pra calcular o total da opção "quantidade personalizada" em Meus Créditos. */
  creditUnitPrice: number;
  /** Seções (PSD/Elementos/Plugins/Ferramentas/Sistemas) visíveis no menu e com página pública habilitada. */
  enabledContentTypes: ContentType[];
  /** Se definido, a home (/) e o dashboard (/dashboard) levam direto pra essa seção em vez do carrossel+fileiras padrão. */
  homeContentType: ContentType | null;
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
  glassOpacity: 70,
  glassTint: "dark",
  notifyNewFiles: true,
  notifyPlatformUpdates: true,
  contactUrl: null,
  creditUnitPrice: 0.5,
  enabledContentTypes: ["psd", "elementos", "plugins", "ferramentas", "sistemas"],
  homeContentType: null,
};

const ALL_CONTENT_TYPES: ContentType[] = ["psd", "elementos", "plugins", "ferramentas", "sistemas"];

/** Config global do site (nome, cores, carrossel, referências, fundo). Degrada para o padrão em qualquer falha. */
export async function getSiteSettings(supabase: SupabaseClient): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "site_name, background_color, button_color, carousel_interval_seconds, reference_pinterest_url, background_image_mobile_url, background_image_tablet_url, background_image_desktop_url, background_image_same_for_all, glass_opacity, glass_tint, notify_new_files, notify_platform_updates, contact_url, credit_unit_price, enabled_content_types, home_content_type"
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
      glassOpacity: data.glass_opacity ?? DEFAULT_SETTINGS.glassOpacity,
      glassTint: data.glass_tint === "light" ? "light" : "dark",
      notifyNewFiles: data.notify_new_files ?? DEFAULT_SETTINGS.notifyNewFiles,
      notifyPlatformUpdates: data.notify_platform_updates ?? DEFAULT_SETTINGS.notifyPlatformUpdates,
      contactUrl: data.contact_url || null,
      creditUnitPrice: data.credit_unit_price ?? DEFAULT_SETTINGS.creditUnitPrice,
      enabledContentTypes:
        (data.enabled_content_types as ContentType[] | null)?.filter((type) => ALL_CONTENT_TYPES.includes(type)) ??
        DEFAULT_SETTINGS.enabledContentTypes,
      homeContentType: ALL_CONTENT_TYPES.includes(data.home_content_type as ContentType)
        ? (data.home_content_type as ContentType)
        : null,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
