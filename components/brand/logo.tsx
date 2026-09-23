"use client";

import { cn } from "@/lib/utils";
import { useSiteName } from "@/components/brand/site-settings-provider";

function Logo({
  className,
  iconOnly = false,
  inverted = false,
}: {
  className?: string;
  iconOnly?: boolean;
  inverted?: boolean;
}) {
  const siteName = useSiteName();
  // Mantém o destaque de cor no sufixo "LAB" apenas para o nome padrão —
  // um nome customizado pelo admin é exibido em tom único.
  const isDefaultName = siteName === "CHURCH-LAB";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          inverted ? "bg-background text-foreground" : "bg-foreground text-background"
        )}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 1L14.5 4.5V11.5L8 15L1.5 11.5V4.5L8 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M8 5V11M5.2 8H10.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </span>
      {!iconOnly && (
        <span
          className={cn(
            "text-[15px] font-semibold tracking-tight",
            inverted ? "text-background" : "text-foreground"
          )}
        >
          {isDefaultName ? (
            <>
              CHURCH<span className={inverted ? "text-accent-400" : "text-accent"}>LAB</span>
            </>
          ) : (
            siteName
          )}
        </span>
      )}
    </span>
  );
}

export { Logo };
