import { AppHeader } from "./navbar/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="p-2 flex-1 w-full">{children}</main>
    </div>
  );
}
