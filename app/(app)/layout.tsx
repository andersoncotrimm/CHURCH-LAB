"use client";

import * as React from "react";
import Link from "next/link";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { Logo } from "@/components/brand/logo";
import { APP_NAV_ITEMS } from "@/lib/nav";
import { mockUser } from "@/lib/mock-data";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        items={APP_NAV_ITEMS}
        brand={
          <Link href="/dashboard">
            <Logo />
          </Link>
        }
        footer={
          <div className="rounded-xl bg-muted/60 p-3.5">
            <p className="text-xs font-semibold text-foreground">{mockUser.church}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Plano gratuito · Fundação visual</p>
          </div>
        }
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={{ name: mockUser.name, role: mockUser.role }}
          notificationCount={3}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
