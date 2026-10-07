"use client";

import * as React from "react";
import { Minus, Plus, MessageCircle, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startCreditCheckout } from "@/app/actions/checkout";

const STEP = 10;
const MIN = 10;
const MAX = 2000;

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CustomCreditAmount({ unitPrice, contactUrl }: { unitPrice: number; contactUrl: string | null }) {
  const [amount, setAmount] = React.useState(STEP);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function clamp(value: number) {
    return Math.min(MAX, Math.max(MIN, value));
  }

  async function handleBuy() {
    setLoading(true);
    setError(null);
    const result = await startCreditCheckout({ customAmount: amount });
    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="glass-card flex flex-col gap-2 rounded-xl border-dashed p-4">
      <p className="text-sm font-semibold text-foreground">Quantidade personalizada</p>
      <p className="text-xs text-muted-foreground">Escolha quantos créditos quer comprar.</p>

      <div className="mt-1 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setAmount((prev) => clamp(prev - STEP))}
          aria-label="Diminuir"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-input text-foreground hover:bg-muted"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="flex flex-1 items-center justify-center gap-1.5 text-lg font-semibold text-foreground">
          <Zap className="h-4 w-4 text-accent" />
          {amount}
        </span>
        <button
          type="button"
          onClick={() => setAmount((prev) => clamp(prev + STEP))}
          aria-label="Aumentar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-input text-foreground hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Total: <span className="font-semibold text-foreground">{formatPrice(amount * unitPrice)}</span>
      </p>

      {error && (
        <p className="flex items-start gap-1.5 text-xs text-danger">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      <Button variant="accent" className="mt-1 w-full" onClick={handleBuy} loading={loading}>
        Comprar com Mercado Pago
      </Button>

      {contactUrl && (
        <a href={contactUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="w-full">
            <MessageCircle className="h-4 w-4" />
            Prefiro outra forma de pagamento
          </Button>
        </a>
      )}
    </div>
  );
}
