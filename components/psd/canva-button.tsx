"use client";

import * as React from "react";
import Link from "next/link";
import { Palette, LogIn, Sparkles, AlertTriangle, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openCanvaTemplate } from "@/app/actions/canva";

export type CanvaCtaState = "guest" | "no-subscription" | "insufficient" | "ready";

export interface CanvaButtonProps {
  psdId: string;
  creditCost: number;
  initialState: CanvaCtaState;
  availableCredits: number | null;
}

function CanvaButton({ psdId, creditCost, initialState, availableCredits }: CanvaButtonProps) {
  const [state, setState] = React.useState(initialState);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  if (state === "guest") {
    return (
      <Link
        href="/login"
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-input bg-surface text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        <LogIn className="h-4 w-4" />
        Entrar para editar no Canva
      </Link>
    );
  }

  if (state === "no-subscription") {
    return (
      <Link
        href="/planos"
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-input bg-surface text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        <Sparkles className="h-4 w-4" />
        Assinar para editar no Canva
      </Link>
    );
  }

  if (state === "insufficient") {
    return (
      <div className="flex flex-col gap-2">
        <Button variant="secondary" size="lg" className="w-full" disabled>
          <AlertTriangle className="h-4 w-4" />
          Créditos insuficientes
          {availableCredits !== null && (
            <span className="text-xs font-normal text-muted-foreground">
              ({availableCredits} de {creditCost})
            </span>
          )}
        </Button>
        <Link href="/planos" className="text-center text-sm font-medium text-accent hover:underline">
          Ver planos
        </Link>
      </div>
    );
  }

  async function handleOpen() {
    setLoading(true);
    setErrorMessage(null);
    const result = await openCanvaTemplate(psdId);
    setLoading(false);

    if (result.status === "success") {
      window.open(result.url, "_blank", "noopener,noreferrer");
      return;
    }

    if (result.status === "no_active_subscription") {
      setState("no-subscription");
      return;
    }

    if (result.status === "insufficient_credits") {
      setState("insufficient");
      return;
    }

    if (result.status === "not_authenticated") {
      setState("guest");
      return;
    }

    setErrorMessage(result.message);
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" size="lg" className="w-full" loading={loading} onClick={handleOpen}>
        <Palette className="h-4 w-4" />
        Editar no Canva
        <ExternalLink className="h-3.5 w-3.5 opacity-70" />
        <span className="inline-flex items-center gap-1 text-xs font-normal opacity-90">
          <Zap className="h-3 w-3" />
          {creditCost} créditos
        </span>
      </Button>
      {errorMessage && <p className="text-center text-xs text-danger">{errorMessage}</p>}
    </div>
  );
}

export { CanvaButton };
