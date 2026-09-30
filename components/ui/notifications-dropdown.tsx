"use client";

import * as React from "react";
import { Bell, FileUp, Megaphone } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/lib/types/notification";

const LAST_SEEN_KEY = "church-lab:notifications:last-seen";

function readLastSeen(): number {
  try {
    return Number(window.localStorage.getItem(LAST_SEEN_KEY) ?? 0);
  } catch {
    return 0;
  }
}

function writeLastSeen(timestamp: number) {
  try {
    window.localStorage.setItem(LAST_SEEN_KEY, String(timestamp));
  } catch {
    // localStorage indisponível (aba privada etc.) — sem problema, só não persiste
  }
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `há ${days}d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

const NOTIFICATION_ICON: Record<AppNotification["type"], React.ReactNode> = {
  new_file: <FileUp className="h-4 w-4 text-accent" />,
  platform_update: <Megaphone className="h-4 w-4 text-accent" />,
};

/**
 * Sino de notificações no cabeçalho — busca as últimas direto do
 * Supabase (leitura pública, RLS cuida disso) e marca como "vistas"
 * salvando o horário no localStorage do navegador ao abrir o painel
 * (não sincroniza entre dispositivos, é só uma conveniência local).
 */
export function NotificationsDropdown() {
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const [open, setOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    supabase
      .from("notifications")
      .select("id, type, message, created_at")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (cancelled || !data) return;
        setNotifications(data as AppNotification[]);
        const lastSeen = readLastSeen();
        setUnreadCount(data.filter((n) => new Date(n.created_at).getTime() > lastSeen).length);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOpen() {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        writeLastSeen(Date.now());
        setUnreadCount(0);
      }
      return next;
    });
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="Notificações"
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
        )}
      </button>

      {open && (
        <div className="glass-panel absolute right-0 top-full z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-xl border border-border shadow-floating">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notificações</p>
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhuma notificação por aqui ainda.</p>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={cn(
                    "flex gap-3 border-b border-border/60 px-4 py-3 text-sm last:border-b-0"
                  )}
                >
                  <span className="mt-0.5 shrink-0">{NOTIFICATION_ICON[notification.type]}</span>
                  <span className="flex-1">
                    <span className="block text-foreground">{notification.message}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {relativeTime(notification.created_at)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
