"use client";

import YdmView from "@/components/ydm/ydm-view";
import { useAuth } from "@/contexts/AuthContext";

export default function Orders() {
  const { user } = useAuth();
  return <YdmView id={Number(user?.franchise_id)} />;
}
