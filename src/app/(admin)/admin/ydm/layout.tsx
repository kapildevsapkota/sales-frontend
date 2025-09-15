import { YDMNavigation } from "@/components/ydm/ydm-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen p-4">
      <YDMNavigation />
      {children}
    </div>
  );
}
