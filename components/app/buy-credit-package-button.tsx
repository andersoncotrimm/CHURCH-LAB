"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startCreditCheckout } from "@/app/actions/checkout";

export function BuyCreditPackageButton({ packageId }: { packageId: string }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const result = await startCreditCheckout({ packageId });
    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="mt-1 flex flex-col gap-1.5">
      <Button variant="accent" className="w-full" onClick={handleClick} loading={loading}>
        Comprar
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
