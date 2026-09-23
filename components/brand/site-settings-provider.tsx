"use client";

import * as React from "react";

const SiteNameContext = React.createContext<string>("CHURCH-LAB");

export function SiteSettingsProvider({
  siteName,
  children,
}: {
  siteName: string;
  children: React.ReactNode;
}) {
  return <SiteNameContext.Provider value={siteName}>{children}</SiteNameContext.Provider>;
}

export function useSiteName(): string {
  return React.useContext(SiteNameContext);
}
