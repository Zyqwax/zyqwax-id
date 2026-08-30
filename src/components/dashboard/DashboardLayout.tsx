import { Sidebar } from './Sidebar';

// Tüm dashboard sayfalarını ortak sidebar ve içerik yüzeyiyle sarar.
export function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="dashboard-shell min-h-screen overflow-x-hidden bg-bg-canvas p-0 md:p-4"><div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1440px] overflow-hidden rounded-[14px] border border-border-default bg-bg-surface"><Sidebar /><main className="min-w-0 flex-1 overflow-x-hidden">{children}</main></div></div>;
}
