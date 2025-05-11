import DashboardLayout from "@/components/layout/dashboard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <div className="">{children}</div>
    </DashboardLayout>
  );
}
