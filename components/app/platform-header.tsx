"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Heart, Menu, Search, Zap, Settings, LogOut, User as UserIcon, Download } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";

export interface PlatformHeaderProps {
  user: { name: string; email?: string; avatarUrl?: string };
  credits: number | null;
  notificationCount?: number;
  onMenuClick?: () => void;
  onSignOut?: () => void;
  className?: string;
}

function PlatformHeader({
  user,
  credits,
  notificationCount = 0,
  onMenuClick,
  onSignOut,
  className,
}: PlatformHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6",
        className
      )}
    >
      <button
        onClick={onMenuClick}
        aria-label="Abrir menu"
        className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden flex-1 max-w-sm sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Pesquisar PSDs..."
          className="h-10 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Link
          href="/favoritos"
          aria-label="Favoritos"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Heart className="h-5 w-5" />
        </Link>

        <button
          aria-label="Notificações"
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
          )}
        </button>

        <div className="mx-1 hidden h-8 w-px bg-border sm:block" />

        <span className="gradient-accent glow-accent-sm inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold text-white">
          <Zap className="h-3.5 w-3.5" />
          {credits === null ? "—" : credits.toLocaleString("pt-BR")} créditos
        </span>

        <Dropdown
          align="right"
          trigger={
            <span className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 hover:bg-muted">
              <Avatar name={user.name} src={user.avatarUrl} size="sm" />
            </span>
          }
          items={[
            { label: "Minha conta", icon: <UserIcon className="h-4 w-4" />, href: "/minha-conta" },
            { label: "Meus downloads", icon: <Download className="h-4 w-4" />, href: "/meus-downloads" },
            { label: "Configurações", icon: <Settings className="h-4 w-4" />, href: "/minha-conta" },
            {
              label: "Sair",
              icon: <LogOut className="h-4 w-4" />,
              destructive: true,
              onSelect: onSignOut,
            },
          ]}
        />
      </div>
    </header>
  );
}

export { PlatformHeader };
