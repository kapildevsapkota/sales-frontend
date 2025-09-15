"use client";
import TodayOrderView from "@/components/ydm/todaysorder/today-order-view";
import { useAuth } from "@/contexts/AuthContext";

export default function TodaysOrder() {
  const { user } = useAuth();
  return (
    <>
      <div className="max-w-7xl mx-auto mt-8">
        <TodayOrderView id={Number(user?.franchise_id)} />
      </div>
    </>
  );
}
