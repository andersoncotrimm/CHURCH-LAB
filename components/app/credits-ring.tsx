export interface CreditsRingProps {
  available: number;
  granted: number;
}

/** Anel de progresso (créditos restantes / concedidos no ciclo), no estilo
 * "Today's progress" dos widgets de referência. */
export function CreditsRing({ available, granted }: CreditsRingProps) {
  const pct = granted > 0 ? Math.max(0, Math.min(100, Math.round((available / granted) * 100))) : 0;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center">
      <svg viewBox="0 0 80 80" className="h-[72px] w-[72px] -rotate-90">
        <circle cx="40" cy="40" r={radius} strokeWidth="8" className="fill-none stroke-black/15" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          strokeWidth="8"
          strokeLinecap="round"
          className="fill-none stroke-current transition-[stroke-dashoffset] duration-500"
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
      </svg>
      <span className="absolute text-base font-bold">{pct}%</span>
    </div>
  );
}
