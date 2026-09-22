"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PublicHeaderProps {
  onMenuClick?: () => void;
  className?: string;
}

function PublicHeader({ onMenuClick, className }: PublicHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6",
        className
      )}
    >
      <button
        onClick={onMenuClick}
        aria-label="Abrir menu"
        className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <form action="/psd" className="relative hidden flex-1 max-w-sm sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          name="busca"
          placeholder="Pesquisar PSDs..."
          className="h-10 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      </form>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Entrar
          </Button>
        </Link>
        <Link href="/cadastro">
          <Button variant="accent" size="sm">
            Criar conta
          </Button>
        </Link>
      </div>
    </header>
  );
}

export { PublicHeader };
