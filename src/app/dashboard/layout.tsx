import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

// Dashboard altındaki tüm sayfaları authentication ve ortak panel düzeniyle korur.
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ProtectedRoute><DashboardLayout>{children}</DashboardLayout></ProtectedRoute>;
}
