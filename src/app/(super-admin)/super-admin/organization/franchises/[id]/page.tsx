import { DashboardPage } from "@/components/dashboard/dashboard-page";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) {
    return <div>No franchise id provided</div>;
  }
  return <DashboardPage id={id} />;
}
