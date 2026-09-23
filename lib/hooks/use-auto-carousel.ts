"use client";

import * as React from "react";

/** Índice de carrossel que avança sozinho, com controles manuais que reiniciam o timer. */
export function useAutoCarousel(length: number, intervalMs = 7000) {
  const [index, setIndex] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((current) => (current + 1) % length);
    }, intervalMs);
  }, [length, intervalMs]);

  React.useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  React.useEffect(() => {
    if (index >= length) setIndex(0);
  }, [length, index]);

  function next() {
    setIndex((current) => (current + 1) % length);
    resetTimer();
  }

  function prev() {
    setIndex((current) => (current - 1 + length) % length);
    resetTimer();
  }

  function goTo(target: number) {
    setIndex(target);
    resetTimer();
  }

  return { index, next, prev, goTo };
}
