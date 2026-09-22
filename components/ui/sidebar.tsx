"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  /** Renderiza um rótulo de seção (ex.: "CONTA") logo antes deste item. */
  sectionLabel?: string;
}

export interface SidebarProps {
  items: SidebarItem[];
  brand: React.ReactNode;
  footer?: React.ReactNode;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function Sidebar({ items, brand, footer, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <div className="flex h-full w-64 flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between px-5 py-5">
        {brand}
        <button
          onClick={onMobileClose}
          aria-label="Fechar menu"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const isActive = pathname === item.href;

          const sectionHeading = item.sectionLabel && (
            <p
              key={`section-${item.sectionLabel}`}
              className="mb-1.5 mt-5 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 first:mt-1"
            >
              {item.sectionLabel}
            </p>
          );

          if (item.disabled) {
            return (
              <React.Fragment key={item.label}>
                {sectionHeading}
                <span
                  aria-disabled="true"
                  title="Em breve"
                  className="flex cursor-not-allowed items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/50"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
                    {item.label}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                    Em breve
                  </span>
                </span>
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={item.href}>
              {sectionHeading}
              <Link
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent-50 text-accent-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center",
                      isActive ? "text-accent-600" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </span>
                {item.badge && (
                  <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-700">
                    {item.badge}
                  </span>
                )}
              </Link>
            </React.Fragment>
          );
        })}
      </nav>

      {footer && <div className="border-t border-border p-4">{footer}</div>}
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen shrink-0 lg:block">{content}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <div className="relative z-10 h-full animate-scale-in">{content}</div>
        </div>
      )}
    </>
  );
}

export { Sidebar };
