"use client";

import * as React from "react";
import { AlertCircle, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startPlanPixCheckout } from "@/app/actions/checkout";

export function RenewPlanPixButton({ planId }: { planId: string }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await startPlanPixCheckout(planId);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button variant="accent" size="sm" onClick={handleClick} loading={loading}>
        <QrCode className="h-4 w-4" />
        Renovar com Pix
      </Button>
      {error && (
        <p className="flex items-start gap-1.5 text-xs text-danger">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
