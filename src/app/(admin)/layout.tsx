import DashboardLayout from "@/components/layout/dashboard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <div className="p-4">{children}</div>
    </DashboardLayout>
  );
}
