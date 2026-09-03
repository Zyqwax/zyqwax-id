"use client";

import { createContext, useContext, useState } from "react";

type SidebarContextValue = {
  expanded: boolean;
  mobileOpen: boolean;
  toggleExpanded: () => void;
  setMobileOpen: (open: boolean) => void;
};
const SidebarContext = createContext<SidebarContextValue | null>(null);

// Dashboard sidebarının masaüstü ve mobil görünüm durumunu ortaklaştırır.
export function SidebarProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <SidebarContext.Provider
      value={{ expanded, mobileOpen, toggleExpanded: () => setExpanded((value) => !value), setMobileOpen }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// Dashboard bileşenlerinin ortak sidebar durumuna erişmesini sağlar.
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar SidebarProvider içinde kullanılmalı.");
  return context;
}
