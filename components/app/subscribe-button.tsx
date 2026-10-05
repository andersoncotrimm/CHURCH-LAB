"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { startPlanCheckout } from "@/app/actions/checkout";

export function SubscribeButton({ planId, isFeatured }: { planId: string; isFeatured: boolean }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await startPlanCheckout(planId);
    // Em caso de sucesso, startPlanCheckout já faz o redirect — só chega
    // aqui de volta se der erro.
    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={cn(buttonVariants({ variant: isFeatured ? "accent" : "outline", size: "lg" }), "w-full")}
      >
        {loading ? "Redirecionando..." : "Assinar agora"}
      </button>
      {error && (
        <p className="flex items-start gap-1.5 text-xs text-danger">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
