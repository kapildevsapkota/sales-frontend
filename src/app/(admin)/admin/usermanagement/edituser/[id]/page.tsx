"use client";

import EditUserPage from "./EditUserPage";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  return <EditUserPage id={params.id as string} />;
}
