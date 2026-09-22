"use client";

import * as React from "react";
import Link from "next/link";
import { Download, LogIn, Sparkles, AlertTriangle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadPsd } from "@/app/actions/download";

export type DownloadCtaState = "guest" | "no-subscription" | "insufficient" | "ready";

export interface DownloadButtonProps {
  psdId: string;
  creditCost: number;
  initialState: DownloadCtaState;
  availableCredits: number | null;
}

function DownloadButton({ psdId, creditCost, initialState, availableCredits }: DownloadButtonProps) {
  const [state, setState] = React.useState(initialState);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  if (state === "guest") {
    return (
      <Link
        href="/login"
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg gradient-accent glow-accent-sm text-sm font-semibold text-white transition-transform hover:scale-[1.01]"
      >
        <LogIn className="h-4 w-4" />
        Entrar para baixar
      </Link>
    );
  }

  if (state === "no-subscription") {
    return (
      <Link
        href="/planos"
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg gradient-accent glow-accent-sm text-sm font-semibold text-white transition-transform hover:scale-[1.01]"
      >
        <Sparkles className="h-4 w-4" />
        Assinar para baixar
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

  async function handleDownload() {
    setLoading(true);
    setErrorMessage(null);
    const result = await downloadPsd(psdId);
    setLoading(false);

    if (result.status === "success") {
      const link = document.createElement("a");
      link.href = result.url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
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
      <Button variant="accent" size="lg" className="w-full glow-accent-sm" loading={loading} onClick={handleDownload}>
        <Download className="h-4 w-4" />
        Baixar PSD
        <span className="inline-flex items-center gap-1 text-xs font-normal opacity-90">
          <Zap className="h-3 w-3" />
          {creditCost} créditos
        </span>
      </Button>
      {errorMessage && <p className="text-center text-xs text-danger">{errorMessage}</p>}
    </div>
  );
}

export { DownloadButton };
