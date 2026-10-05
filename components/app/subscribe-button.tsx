"use client";

import * as React from "react";
import { AlertCircle, QrCode } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { startPlanCheckout, startPlanPixCheckout } from "@/app/actions/checkout";

export function SubscribeButton({ planId, isFeatured }: { planId: string; isFeatured: boolean }) {
  const [loading, setLoading] = React.useState<"card" | "pix" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleCardClick() {
    setLoading("card");
    setError(null);
    const result = await startPlanCheckout(planId);
    // Em caso de sucesso, a Server Action já faz o redirect — só chega aqui
    // de volta se der erro.
    if (result.error) {
      setError(result.error);
      setLoading(null);
    }
  }

  async function handlePixClick() {
    setLoading("pix");
    setError(null);
    const result = await startPlanPixCheckout(planId);
    if (result.error) {
      setError(result.error);
      setLoading(null);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-2">
      <button
        type="button"
        onClick={handleCardClick}
        disabled={loading !== null}
        className={cn(buttonVariants({ variant: isFeatured ? "accent" : "outline", size: "lg" }), "w-full")}
      >
        {loading === "card" ? "Redirecionando..." : "Assinar com cartão"}
      </button>
      <button
        type="button"
        onClick={handlePixClick}
        disabled={loading !== null}
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
      >
        <QrCode className="h-4 w-4" />
        {loading === "pix" ? "Redirecionando..." : "Pagar 1 ciclo com Pix"}
      </button>
      <p className="text-center text-[11px] text-muted-foreground">
        No Pix o plano fica ativo até o fim do período pago, sem renovar sozinho — você paga de novo quando quiser
        continuar.
      </p>
      {error && (
        <p className="flex items-start gap-1.5 text-xs text-danger">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
