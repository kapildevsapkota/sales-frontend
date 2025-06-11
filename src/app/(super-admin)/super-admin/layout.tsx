import SuperAdminDashboardLayout from "@/components/layout/super-admin-dashboard";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperAdminDashboardLayout>{children}</SuperAdminDashboardLayout>;
}
