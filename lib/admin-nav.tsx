import {
  Tag,
  Image as ImageIcon,
  Users,
  FolderTree,
  Hash,
  Coins,
  CreditCard,
  Settings,
} from "lucide-react";
import type { SidebarItem } from "@/components/ui/sidebar";

export const ADMIN_NAV_ITEMS: SidebarItem[] = [
  { label: "Planos", href: "/admin/planos", icon: <Tag className="h-[18px] w-[18px]" /> },
  { label: "PSDs", href: "/admin/psd", icon: <ImageIcon className="h-[18px] w-[18px]" /> },
  { label: "Categorias", href: "/admin/categorias", icon: <FolderTree className="h-[18px] w-[18px]" /> },
  { label: "Usuários", href: "/admin/usuarios", icon: <Users className="h-[18px] w-[18px]" />, disabled: true },
  { label: "Tags", href: "/admin/tags", icon: <Hash className="h-[18px] w-[18px]" />, disabled: true },
  { label: "Créditos", href: "/admin/creditos", icon: <Coins className="h-[18px] w-[18px]" />, disabled: true },
  { label: "Assinaturas", href: "/admin/assinaturas", icon: <CreditCard className="h-[18px] w-[18px]" />, disabled: true },
  { label: "Configurações", href: "/admin/configuracoes", icon: <Settings className="h-[18px] w-[18px]" />, disabled: true },
];
