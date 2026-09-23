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
  /** Marca completa (ícone + nome) — usada na gaveta mobile, sempre visível por inteiro. */
  brand: React.ReactNode;
  /** Marca compacta (só o ícone) — fica fixa no topo da trilha retraída no desktop. */
  brandCompact?: React.ReactNode;
  footer?: React.ReactNode;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function isChildActive(child: SidebarChildItem, pathname: string, search: string) {
  const [childPath, childQuery] = child.href.split("?");
  if (childPath !== pathname) return false;
  return (childQuery ?? "") === search;
}

/**
 * Classe aplicada aos rótulos de texto quando `collapsible` é true: ficam
 * invisíveis até o mouse passar sobre a trilha (`.group/rail:hover`), em
 * vez de aparecerem cortados no meio de uma letra na largura retraída.
 */
const HIDDEN_UNTIL_HOVER = "opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100";

function SidebarNav({
  items,
  pathname,
  search,
  expanded,
  toggleExpanded,
  onNavigate,
  collapsible = false,
}: {
  items: SidebarItem[];
  pathname: string;
  search: string;
  expanded: Set<string>;
  toggleExpanded: (href: string) => void;
  onNavigate?: () => void;
  collapsible?: boolean;
}) {
  const labelClass = collapsible ? HIDDEN_UNTIL_HOVER : "";

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-2">
      {items.map((item) => {
        const isActive = pathname === item.href;

        const sectionHeading = item.sectionLabel && (
          <p
            key={`section-${item.sectionLabel}`}
            className={cn(
              "mb-1.5 mt-5 whitespace-nowrap px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 first:mt-1",
              labelClass
            )}
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
                className="flex cursor-not-allowed items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/50"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>
                  <span className={labelClass}>{item.label}</span>
                </span>
                <span className={cn("shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70", labelClass)}>
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
                "group flex items-center gap-1 whitespace-nowrap rounded-lg transition-colors",
                isActive && !hasChildren ? "bg-accent-50 text-accent-700" : "text-muted-foreground"
              )}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
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
                      "flex h-5 w-5 shrink-0 items-center justify-center",
                      isActive ? "text-accent-600" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className={labelClass}>{item.label}</span>
                </span>
                {item.badge && (
                  <span className={cn("shrink-0 rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-700", labelClass)}>
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
                  className={cn(
                    "mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
                    labelClass
                  )}
                >
                  <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isExpanded && "rotate-180")} />
                </button>
              )}
            </div>

            {hasChildren && isExpanded && (
              <div className={cn("ml-4 flex flex-col gap-0.5 whitespace-nowrap border-l border-border pl-3", labelClass)}>
                {item.children!.map((child) => {
                  const childActive = isChildActive(child, pathname, search);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onNavigate}
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
  );
}

function Sidebar({ items, brand, brandCompact, footer, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  // Começa sempre fechado — mesmo estando numa categoria ativa, o
  // submenu só abre quando a pessoa clica na seta (pedido explícito:
  // não abrir sozinho ao entrar na página).
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set());

  function toggleExpanded(href: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  }

  return (
    <>
      {/*
        Desktop: trilha retraída (só ícones) de 76px, sempre reservada no
        layout. A marca fica fixa nessa faixa, alinhada com a altura do
        cabeçalho — só o painel de navegação abaixo dela expande (flutua
        por cima do conteúdo, sem empurrar a página) ao passar o mouse.
      */}
      <div className="group/rail sticky top-0 hidden h-screen w-[76px] shrink-0 lg:block">
        <div className="flex h-16 items-center justify-center border-b border-r border-border bg-surface">
          {brandCompact ?? brand}
        </div>

        <div
          className={cn(
            "absolute left-0 top-16 z-40 flex h-[calc(100%-4rem)] w-[76px] flex-col overflow-hidden border-r border-border bg-surface",
            "transition-[width,box-shadow] duration-200 ease-out",
            "group-hover/rail:w-64 group-hover/rail:shadow-floating"
          )}
        >
          <SidebarNav
            items={items}
            pathname={pathname}
            search={search}
            expanded={expanded}
            toggleExpanded={toggleExpanded}
            collapsible
          />
          {footer && (
            <div className={cn("overflow-hidden whitespace-nowrap border-t border-border p-4", HIDDEN_UNTIL_HOVER)}>
              {footer}
            </div>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <div className="relative z-10 flex h-full w-64 animate-scale-in flex-col border-r border-border bg-surface">
            <div className="flex items-center justify-between px-5 py-5">
              {brand}
              <button
                onClick={onMobileClose}
                aria-label="Fechar menu"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav
              items={items}
              pathname={pathname}
              search={search}
              expanded={expanded}
              toggleExpanded={toggleExpanded}
              onNavigate={onMobileClose}
            />
            {footer && <div className="border-t border-border p-4">{footer}</div>}
          </div>
        </div>
      )}
    </>
  );
}

export { Sidebar };
