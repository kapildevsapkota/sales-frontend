import DashboardLayout from "@/components/layout/dashboard";
import { AuthProvider } from "@/providers/auth-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardLayout>
        <div className="p-4">{children}</div>
      </DashboardLayout>
    </AuthProvider>
  );
}
