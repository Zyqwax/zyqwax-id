import { SidebarProvider } from './SidebarContext';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';
import { SidebarBackdrop } from './SidebarBackdrop';

// Tüm korumalı sayfaları referans admin shell'i içinde ortaklaştırır.
export function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SidebarProvider><div className="dashboard-shell"><Sidebar /><SidebarBackdrop /><div className="dashboard-shell-main"><DashboardHeader /><main>{children}</main></div></div></SidebarProvider>;
}
