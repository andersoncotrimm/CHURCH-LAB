import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MessageSquare,
  FolderOpen,
  Workflow,
  ClipboardList,
  Settings,
} from "lucide-react";
import type { SidebarItem } from "@/components/ui/sidebar";

export const APP_NAV_ITEMS: SidebarItem[] = [
  { label: "Visão geral", href: "/dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { label: "Eventos", href: "/eventos", icon: <CalendarDays className="h-[18px] w-[18px]" /> },
  { label: "Pessoas", href: "/pessoas", icon: <Users className="h-[18px] w-[18px]" />, disabled: true },
  { label: "Comunicação", href: "/comunicacao", icon: <MessageSquare className="h-[18px] w-[18px]" />, disabled: true },
  { label: "Arquivos", href: "/biblioteca", icon: <FolderOpen className="h-[18px] w-[18px]" /> },
  { label: "Ministérios", href: "/ministerios", icon: <Workflow className="h-[18px] w-[18px]" />, disabled: true },
  { label: "Formulários", href: "/formularios", icon: <ClipboardList className="h-[18px] w-[18px]" />, disabled: true },
  { label: "Configurações", href: "/configuracoes", icon: <Settings className="h-[18px] w-[18px]" />, disabled: true },
];
