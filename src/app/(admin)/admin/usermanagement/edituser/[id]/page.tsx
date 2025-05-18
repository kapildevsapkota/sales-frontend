import EditUserPage from "./EditUserPage";

export default async function Page({
  params,
}: {
  params: { id: string }
}) {
  return <EditUserPage id={params.id} />;
}