import {
  Home,
  Layers,
  Puzzle,
  Plug,
  Wrench,
  Grid3x3,
  Images,
  Tag,
  Coins,
  UserCircle,
  Download,
  Heart,
} from "lucide-react";
import type { SidebarItem } from "@/components/ui/sidebar";
import type { Category } from "@/lib/types/psd";

export const APP_NAV_ITEMS: SidebarItem[] = [
  { label: "Início", href: "/dashboard", icon: <Home className="h-[18px] w-[18px]" /> },
  { label: "PSD", href: "/psd", icon: <Layers className="h-[18px] w-[18px]" /> },
  { label: "Elementos", href: "/elementos", icon: <Puzzle className="h-[18px] w-[18px]" /> },
  { label: "Plugins", href: "/plugins", icon: <Plug className="h-[18px] w-[18px]" /> },
  { label: "Ferramentas", href: "/ferramentas", icon: <Wrench className="h-[18px] w-[18px]" /> },
  { label: "Sistemas", href: "/sistemas", icon: <Grid3x3 className="h-[18px] w-[18px]" /> },
  { label: "Referências", href: "/referencias", icon: <Images className="h-[18px] w-[18px]" /> },
  { label: "Planos", href: "/planos", icon: <Tag className="h-[18px] w-[18px]" />, sectionLabel: "Conta" },
  { label: "Meus Créditos", href: "/meus-creditos", icon: <Coins className="h-[18px] w-[18px]" /> },
  { label: "Minha Conta", href: "/minha-conta", icon: <UserCircle className="h-[18px] w-[18px]" /> },
  { label: "Meus Downloads", href: "/meus-downloads", icon: <Download className="h-[18px] w-[18px]" /> },
  { label: "Favoritos", href: "/favoritos", icon: <Heart className="h-[18px] w-[18px]" /> },
];

/** Sidebar pública (visitante sem login): sem os itens que dependem de conta. */
export const PUBLIC_NAV_ITEMS: SidebarItem[] = [
  { label: "Início", href: "/", icon: <Home className="h-[18px] w-[18px]" /> },
  { label: "PSD", href: "/psd", icon: <Layers className="h-[18px] w-[18px]" /> },
  { label: "Elementos", href: "/elementos", icon: <Puzzle className="h-[18px] w-[18px]" /> },
  { label: "Plugins", href: "/plugins", icon: <Plug className="h-[18px] w-[18px]" /> },
  { label: "Ferramentas", href: "/ferramentas", icon: <Wrench className="h-[18px] w-[18px]" /> },
  { label: "Sistemas", href: "/sistemas", icon: <Grid3x3 className="h-[18px] w-[18px]" /> },
  { label: "Referências", href: "/referencias", icon: <Images className="h-[18px] w-[18px]" /> },
  { label: "Planos", href: "/planos", icon: <Tag className="h-[18px] w-[18px]" />, sectionLabel: "Conta" },
];

/**
 * Injeta as categorias reais (vindas do banco) como submenu suspenso do
 * item "PSD" — mesma lista que hoje fica numa coluna separada em /psd,
 * agora dentro do menu lateral persistente.
 */
export function withPsdCategories(items: SidebarItem[], categories: Category[]): SidebarItem[] {
  if (categories.length === 0) return items;
  return items.map((item) => {
    if (item.href !== "/psd") return item;
    return {
      ...item,
      children: [
        { label: "Todos", href: "/psd" },
        ...categories.map((category) => ({ label: category.name, href: `/psd?categoria=${category.slug}` })),
      ],
    };
  });
}
