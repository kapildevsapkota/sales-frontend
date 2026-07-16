import { VendorCompleteStat } from "@/src/services/vendors";
import { MainStatsCard } from "./main-stats-card";
import { TodaysStatsCard } from "./todays-stats-card";
import { DeliveryPerformanceCard } from "./delivery-performance-card";

export function VendorStatsCards({ data }: { data?: VendorCompleteStat }) {
  return (
    <>
      <MainStatsCard data={data} />
      <TodaysStatsCard data={data} />
      <DeliveryPerformanceCard data={data} />
    </>
  );
}

