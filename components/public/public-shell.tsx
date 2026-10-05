"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { PublicHeader } from "@/components/public/public-header";
import { PlatformHeader } from "@/components/app/platform-header";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/brand/logo";
import {
  PUBLIC_NAV_ITEMS,
  APP_NAV_ITEMS,
  ADMIN_LINK_ITEM,
  withPsdCategories,
  filterByEnabledContentTypes,
} from "@/lib/nav";
import { createClient } from "@/utils/supabase/client";
import type { Category, ContentType } from "@/lib/types/psd";
import type { ShellContext } from "@/lib/shell-context";

const ALL_CONTENT_TYPES: ContentType[] = ["psd", "elementos", "plugins", "ferramentas", "sistemas"];

const LOGGED_OUT_SHELL: ShellContext = {
  isLoggedIn: false,
  user: null,
  planName: null,
  credits: null,
  isAdmin: false,
};

/**
 * Shell usado nas páginas que existem tanto pra visitante quanto pra membro
 * logado na mesma URL (/psd, /elementos, /categorias, /referencias,
 * /planos, etc.). Troca o menu/cabeçalho/rodapé inteiros pra versão de
 * membro quando `shell.isLoggedIn` — sem isso, alguém logado via essas
 * páginas via sempre o menu de visitante (com "Entrar"/"Criar conta" e
 * "Crie sua conta grátis"), dando a impressão de ter sido desconectado.
 */
export function PublicShell({
  children,
  categories = [],
  enabledContentTypes = ALL_CONTENT_TYPES,
  shell = LOGGED_OUT_SHELL,
}: {
  children: React.ReactNode;
  categories?: Category[];
  enabledContentTypes?: ContentType[];
  shell?: ShellContext;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const items = React.useMemo(() => {
    const base = withPsdCategories(
      filterByEnabledContentTypes(shell.isLoggedIn ? APP_NAV_ITEMS : PUBLIC_NAV_ITEMS, enabledContentTypes),
      categories
    );
    return shell.isAdmin ? [...base, ADMIN_LINK_ITEM] : base;
  }, [categories, enabledContentTypes, shell.isLoggedIn, shell.isAdmin]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const homeHref = shell.isLoggedIn ? "/dashboard" : "/";

  return (
    <div className="glass-root isolate flex min-h-screen">
      <Sidebar
        items={items}
        brand={
          <Link href={homeHref}>
            <Logo />
          </Link>
        }
        brandCompact={
          <Link href={homeHref} aria-label="Início">
            <Logo iconOnly />
          </Link>
        }
        footer={
          shell.isLoggedIn && shell.user ? (
            <Link
              href="/minha-conta"
              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
            >
              <Avatar name={shell.user.name} src={shell.user.avatarUrl} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">{shell.user.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {shell.planName ?? "Sem plano"} · Membro
                </span>
              </span>
            </Link>
          ) : (
            <Link
              href="/cadastro"
              className="flex flex-col gap-1 rounded-xl bg-muted/60 p-3.5 transition-colors hover:bg-muted"
            >
              <span className="text-xs font-semibold text-foreground">Crie sua conta grátis</span>
              <span className="text-xs text-muted-foreground">Acesse a biblioteca completa de PSDs.</span>
            </Link>
          )
        }
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {shell.isLoggedIn && shell.user ? (
          <PlatformHeader
            user={shell.user}
            credits={shell.credits}
            onMenuClick={() => setMobileOpen(true)}
            onSignOut={handleSignOut}
          />
        ) : (
          <PublicHeader onMenuClick={() => setMobileOpen(true)} />
        )}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
