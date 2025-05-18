import DashboardLayout from "@/components/layout/dashboard";
import { Role } from "@/contexts/AuthContext";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout roles={[Role.SuperAdmin]}>
      <div className="">{children}</div>
    </DashboardLayout>
  );
}
