"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Sidebar } from "@/components/ui/sidebar";
import { PlatformHeader } from "@/components/app/platform-header";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/brand/logo";
import { APP_NAV_ITEMS, withPsdCategories } from "@/lib/nav";
import { createClient } from "@/utils/supabase/client";
import type { Category } from "@/lib/types/psd";
import type { SidebarItem } from "@/components/ui/sidebar";

export interface PlatformShellProps {
  user: { name: string; email?: string; avatarUrl?: string };
  planName: string | null;
  credits: number | null;
  categories?: Category[];
  isAdmin?: boolean;
  children: React.ReactNode;
}

const ADMIN_LINK_ITEM: SidebarItem = {
  label: "Painel Admin",
  href: "/admin",
  icon: <ShieldCheck className="h-[18px] w-[18px]" />,
  sectionLabel: "Administração",
};

export function PlatformShell({ user, planName, credits, categories = [], isAdmin = false, children }: PlatformShellProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const items = React.useMemo(() => {
    const base = withPsdCategories(APP_NAV_ITEMS, categories);
    return isAdmin ? [...base, ADMIN_LINK_ITEM] : base;
  }, [categories, isAdmin]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        items={items}
        brand={
          <Link href="/dashboard">
            <Logo />
          </Link>
        }
        brandCompact={
          <Link href="/dashboard" aria-label="Início">
            <Logo iconOnly />
          </Link>
        }
        footer={
          <Link
            href="/minha-conta"
            className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
          >
            <Avatar name={user.name} src={user.avatarUrl} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">{user.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {planName ?? "Sem plano"} · Membro
              </span>
            </span>
          </Link>
        }
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <PlatformHeader
          user={user}
          credits={credits}
          onMenuClick={() => setMobileOpen(true)}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
