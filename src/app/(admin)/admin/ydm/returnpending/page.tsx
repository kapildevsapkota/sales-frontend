"use client";
import ReturnPendingView from "@/components/ydm/returnpending/return-pending-view";
import { useAuth } from "@/contexts/AuthContext";

export default function ReturnPending() {
  const { user } = useAuth();
  return (
    <>
      <div className="max-w-7xl mx-auto mt-8">
        <ReturnPendingView id={Number(user?.franchise_id)} />
      </div>
    </>
  );
}
