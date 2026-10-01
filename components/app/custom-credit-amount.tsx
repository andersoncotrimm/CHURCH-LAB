"use client";

import * as React from "react";
import { Minus, Plus, MessageCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEP = 10;
const MIN = 10;
const MAX = 2000;

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CustomCreditAmount({ unitPrice, contactUrl }: { unitPrice: number; contactUrl: string | null }) {
  const [amount, setAmount] = React.useState(STEP);

  function clamp(value: number) {
    return Math.min(MAX, Math.max(MIN, value));
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border bg-surface p-4">
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

      {contactUrl && (
        <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="mt-1">
          <Button variant="accent" className="w-full">
            <MessageCircle className="h-4 w-4" />
            Falar com o suporte
          </Button>
        </a>
      )}
    </div>
  );
}
