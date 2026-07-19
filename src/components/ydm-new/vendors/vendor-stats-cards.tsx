import { MainStatsCard } from "./main-stats-card";
import { TodaysStatsCard } from "./todays-stats-card";
import { DeliveryPerformanceCard } from "./delivery-performance-card";
import { VendorCompleteStat } from "./vendors";

export function VendorStatsCards({ data }: { data?: VendorCompleteStat }) {
  return (
    <>
      <MainStatsCard data={data} />
      <TodaysStatsCard data={data} />
      <DeliveryPerformanceCard data={data} />
    </>
  );
}
