"use client";

import * as React from "react";
import Link from "next/link";
import { Sidebar } from "@/components/ui/sidebar";
import { PublicHeader } from "@/components/public/public-header";
import { Logo } from "@/components/brand/logo";
import { PUBLIC_NAV_ITEMS, withPsdCategories } from "@/lib/nav";
import type { Category } from "@/lib/types/psd";

export function PublicShell({
  children,
  categories = [],
}: {
  children: React.ReactNode;
  categories?: Category[];
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const items = React.useMemo(() => withPsdCategories(PUBLIC_NAV_ITEMS, categories), [categories]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        items={items}
        brand={
          <Link href="/">
            <Logo />
          </Link>
        }
        brandCompact={
          <Link href="/" aria-label="Início">
            <Logo iconOnly />
          </Link>
        }
        footer={
          <Link
            href="/cadastro"
            className="flex flex-col gap-1 rounded-xl bg-muted/60 p-3.5 transition-colors hover:bg-muted"
          >
            <span className="text-xs font-semibold text-foreground">Crie sua conta grátis</span>
            <span className="text-xs text-muted-foreground">Acesse a biblioteca completa de PSDs.</span>
          </Link>
        }
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <PublicHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
