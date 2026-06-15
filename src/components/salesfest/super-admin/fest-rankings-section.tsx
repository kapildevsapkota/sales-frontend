import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FestSalesTrendChart } from "./fest-sales-trend-chart";
import { GroupRankingsPanel } from "./group-rankings-panel";
import { RANKINGS_START_DATE } from "./constants";
import { FranchiseSalesEntry, RankedSalesperson } from "./types";
import { isGroupAFranchise } from "./utils";

interface FestRankingsSectionProps {
  entries: FranchiseSalesEntry[];
  loading: boolean;
}

export function FestRankingsSection({
  entries,
  loading,
}: FestRankingsSectionProps) {
  const groupAEntries = entries.filter((entry) =>
    isGroupAFranchise(entry.franchise),
  );
  const groupBEntries = entries.filter(
    (entry) => !isGroupAFranchise(entry.franchise),
  );

  const toRankedSalespersons = (
    groupEntries: FranchiseSalesEntry[],
    group: "A" | "B",
  ): RankedSalesperson[] =>
    groupEntries.flatMap((entry) =>
      entry.salespersons.map((sp) => ({
        ...sp,
        franchiseName: entry.franchise.name,
        group,
      })),
    );

  const trackingLabel = `Since ${format(RANKINGS_START_DATE, "MMM d, yyyy")}`;

  return (
    <div className="space-y-4 sm:space-y-6">
      <FestSalesTrendChart />

      <Card className="shadow-sm border-amber-100 bg-amber-50/40">
        <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-amber-900 text-sm sm:text-base">
                Fest Rankings Period
              </p>
              <p className="text-xs sm:text-sm text-amber-800/80 mt-1">
                Sales are counted from June 14, 2026 onward only. Rankings
                refresh automatically every minute.
              </p>
            </div>
            <Badge
              variant="outline"
              className="w-fit border-amber-300 text-amber-900 bg-white shrink-0"
            >
              {trackingLabel}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <GroupRankingsPanel
          title="Group A"
          description="Sankhamul, Swyambhu, and Main Page"
          group="A"
          franchiseEntries={groupAEntries}
          salespersons={toRankedSalespersons(groupAEntries, "A")}
          loading={loading}
        />
        <GroupRankingsPanel
          title="Group B"
          description="All other franchises"
          group="B"
          franchiseEntries={groupBEntries}
          salespersons={toRankedSalespersons(groupBEntries, "B")}
          loading={loading}
        />
      </div>
    </div>
  );
}
