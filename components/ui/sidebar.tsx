"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarChildItem {
  label: string;
  href: string;
}

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  /** Renderiza um rótulo de seção (ex.: "CONTA") logo antes deste item. */
  sectionLabel?: string;
  /** Submenu suspenso (ex.: categorias dentro do item "PSD"). */
  children?: SidebarChildItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  brand: React.ReactNode;
  footer?: React.ReactNode;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function isChildActive(child: SidebarChildItem, pathname: string, search: string) {
  const [childPath, childQuery] = child.href.split("?");
  if (childPath !== pathname) return false;
  return (childQuery ?? "") === search;
}

function Sidebar({ items, brand, footer, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const item of items) {
      if (item.children?.some((child) => isChildActive(child, pathname, search))) {
        initial.add(item.href);
      }
    }
    return initial;
  });

  function toggleExpanded(href: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  }

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

          const hasChildren = !!item.children?.length;
          const isExpanded = expanded.has(item.href);

          return (
            <React.Fragment key={item.href}>
              {sectionHeading}
              <div
                className={cn(
                  "group flex items-center gap-1 rounded-lg transition-colors",
                  isActive && !hasChildren ? "bg-accent-50 text-accent-700" : "text-muted-foreground"
                )}
              >
                <Link
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex flex-1 items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "text-accent-700"
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
                {hasChildren && (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(item.href)}
                    aria-label={isExpanded ? `Recolher ${item.label}` : `Expandir ${item.label}`}
                    aria-expanded={isExpanded}
                    className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                  </button>
                )}
              </div>

              {hasChildren && isExpanded && (
                <div className="ml-4 flex flex-col gap-0.5 border-l border-border pl-3">
                  {item.children!.map((child) => {
                    const childActive = isChildActive(child, pathname, search);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onMobileClose}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                          childActive
                            ? "bg-accent-50 text-accent-700"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
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
