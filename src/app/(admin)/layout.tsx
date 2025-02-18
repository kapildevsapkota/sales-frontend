import DashboardLayout from "@/components/layout/dashboard";
import { AuthProvider } from "@/providers/auth-provider";
import AdminGuard from "@/components/auth/admin-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminGuard>
        <DashboardLayout>
          <div className="p-4">{children}</div>
        </DashboardLayout>
      </AdminGuard>
    </AuthProvider>
  );
}
