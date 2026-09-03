import { requireAdminPage } from "@/lib/server/admin";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAdminPage();
  return <AdminShell>{children}</AdminShell>;
}
