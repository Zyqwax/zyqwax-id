import { SidebarProvider } from "./SidebarContext";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";

// Tüm korumalı sayfaları referans admin shell'i içinde ortaklaştırır.
export function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <div className="flex h-screen max-h-screen w-full overflow-hidden bg-zinc-950 text-zinc-100">
        <Sidebar />
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <DashboardHeader />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
