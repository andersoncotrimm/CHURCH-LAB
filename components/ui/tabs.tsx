"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

function Tabs({ items, value, defaultValue, onValueChange, className }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(
    defaultValue ?? items[0]?.value
  );
  const active = value ?? internalValue;

  function handleSelect(next: string) {
    setInternalValue(next);
    onValueChange?.(next);
  }

  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-border bg-muted/60 p-1",
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.value === active;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(item.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all",
              isActive
                ? "bg-surface text-foreground shadow-subtle"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export { Tabs };
