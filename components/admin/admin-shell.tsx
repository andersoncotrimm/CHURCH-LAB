"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { Logo } from "@/components/brand/logo";
import { ADMIN_NAV_ITEMS } from "@/lib/admin-nav";
import { createClient } from "@/utils/supabase/client";

export interface AdminShellProps {
  user: { name: string; email: string };
  children: React.ReactNode;
}

export function AdminShell({ user, children }: AdminShellProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        items={ADMIN_NAV_ITEMS}
        brand={
          <Link href="/admin/planos" className="flex items-center gap-2">
            <Logo iconOnly />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Admin
            </span>
          </Link>
        }
        footer={
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-xl border border-border px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Home className="h-4 w-4 text-muted-foreground" />
              Voltar à plataforma
            </Link>
            <div className="rounded-xl bg-muted/60 p-3.5">
              <p className="text-xs font-semibold text-foreground">Painel administrativo</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Centro de controle do CHURCH-LAB</p>
            </div>
          </div>
        }
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={{ name: user.name, role: user.email }}
          onMenuClick={() => setMobileOpen(true)}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
