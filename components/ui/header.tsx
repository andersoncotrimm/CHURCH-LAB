"use client";

import * as React from "react";
import { Bell, Menu, Search, Settings, LogOut, User as UserIcon } from "lucide-react";
import { Avatar } from "./avatar";
import { Dropdown } from "./dropdown";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  user: { name: string; role?: string; avatarUrl?: string };
  notificationCount?: number;
  onMenuClick?: () => void;
  className?: string;
}

function Header({ user, notificationCount = 0, onMenuClick, className }: HeaderProps) {
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
          placeholder="Buscar eventos, pessoas, arquivos..."
          className="h-10 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          aria-label="Buscar"
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
        >
          <Search className="h-5 w-5" />
        </button>

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

        <Dropdown
          align="right"
          trigger={
            <span className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 hover:bg-muted">
              <Avatar name={user.name} src={user.avatarUrl} size="sm" />
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium leading-tight text-foreground">
                  {user.name}
                </span>
                {user.role && (
                  <span className="block text-xs leading-tight text-muted-foreground">
                    {user.role}
                  </span>
                )}
              </span>
            </span>
          }
          items={[
            { label: "Meu perfil", icon: <UserIcon className="h-4 w-4" /> },
            { label: "Configurações", icon: <Settings className="h-4 w-4" /> },
            { label: "Sair", icon: <LogOut className="h-4 w-4" />, destructive: true },
          ]}
        />
      </div>
    </header>
  );
}

export { Header };
