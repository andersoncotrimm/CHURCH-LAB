"use client";

import * as React from "react";
import Link from "next/link";
import { Sidebar } from "@/components/ui/sidebar";
import { PublicHeader } from "@/components/public/public-header";
import { Logo } from "@/components/brand/logo";
import { PUBLIC_NAV_ITEMS, withPsdCategories, filterByEnabledContentTypes } from "@/lib/nav";
import type { Category, ContentType } from "@/lib/types/psd";

const ALL_CONTENT_TYPES: ContentType[] = ["psd", "elementos", "plugins", "ferramentas", "sistemas"];

export function PublicShell({
  children,
  categories = [],
  enabledContentTypes = ALL_CONTENT_TYPES,
}: {
  children: React.ReactNode;
  categories?: Category[];
  enabledContentTypes?: ContentType[];
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const items = React.useMemo(
    () => withPsdCategories(filterByEnabledContentTypes(PUBLIC_NAV_ITEMS, enabledContentTypes), categories),
    [categories, enabledContentTypes]
  );

  return (
    <div className="glass-root isolate flex min-h-screen">
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
