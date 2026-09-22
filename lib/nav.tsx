import {
  Home,
  Layers,
  Puzzle,
  Plug,
  Wrench,
  Grid3x3,
  Tag,
  Coins,
  UserCircle,
  Download,
  Heart,
} from "lucide-react";
import type { SidebarItem } from "@/components/ui/sidebar";

export const APP_NAV_ITEMS: SidebarItem[] = [
  { label: "Início", href: "/dashboard", icon: <Home className="h-[18px] w-[18px]" /> },
  { label: "PSD", href: "/psd", icon: <Layers className="h-[18px] w-[18px]" /> },
  { label: "Elementos", href: "/elementos", icon: <Puzzle className="h-[18px] w-[18px]" />, disabled: true },
  { label: "Plugins", href: "/plugins", icon: <Plug className="h-[18px] w-[18px]" />, disabled: true },
  { label: "Ferramentas", href: "/ferramentas", icon: <Wrench className="h-[18px] w-[18px]" />, disabled: true },
  { label: "Sistemas", href: "/sistemas", icon: <Grid3x3 className="h-[18px] w-[18px]" />, disabled: true },
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
  { label: "Elementos", href: "/elementos", icon: <Puzzle className="h-[18px] w-[18px]" />, disabled: true },
  { label: "Plugins", href: "/plugins", icon: <Plug className="h-[18px] w-[18px]" />, disabled: true },
  { label: "Ferramentas", href: "/ferramentas", icon: <Wrench className="h-[18px] w-[18px]" />, disabled: true },
  { label: "Sistemas", href: "/sistemas", icon: <Grid3x3 className="h-[18px] w-[18px]" />, disabled: true },
  { label: "Planos", href: "/planos", icon: <Tag className="h-[18px] w-[18px]" />, sectionLabel: "Conta" },
];
