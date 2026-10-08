import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FestSalesTrendChart } from "./fest-sales-trend-chart";
import { GroupRankingsPanel } from "./group-rankings-panel";
import { TopSalespersonsList } from "./top-salespersons-list";
import { RANKINGS_END_DATE, RANKINGS_START_DATE } from "./constants";
import { FranchiseSalesEntry, RankedSalesperson } from "./types";
import { isGroupAFranchise, getGroupForFranchise, isHiddenSalesperson } from "./utils";

interface FestRankingsSectionProps {
  entries: FranchiseSalesEntry[];
  loading: boolean;
}

export function FestRankingsSection({
  entries,
  loading,
}: FestRankingsSectionProps) {
  const groupAEntries = entries.filter(
    (entry) => getGroupForFranchise(entry.franchise) === "A",
  );
  const groupBEntries = entries.filter(
    (entry) => getGroupForFranchise(entry.franchise) === "B",
  );
  const groupCEntries = entries.filter(
    (entry) => getGroupForFranchise(entry.franchise) === "C",
  );

  const toRankedSalespersons = (
    groupEntries: FranchiseSalesEntry[],
    group: "A" | "B" | "C",
  ): RankedSalesperson[] =>
    groupEntries.flatMap((entry) =>
      entry.salespersons
        .filter((sp) => !isHiddenSalesperson(sp))
        .map((sp) => ({
          ...sp,
          franchiseName: entry.franchise.name,
          group,
        })),
    );

  const allRankedSalespersons = [
    ...toRankedSalespersons(groupAEntries, "A"),
    ...toRankedSalespersons(groupBEntries, "B"),
    ...toRankedSalespersons(groupCEntries, "C"),
  ];

  const trackingLabel = `${format(RANKINGS_START_DATE, "MMM d, yyyy")} – ${format(RANKINGS_END_DATE, "MMM d, yyyy")}`;

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

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <GroupRankingsPanel
          title="Team A"
          description="Shankhamul & Main Page"
          group="A"
          franchiseEntries={groupAEntries}
          salespersons={toRankedSalespersons(groupAEntries, "A")}
          loading={loading}
        />
        <GroupRankingsPanel
          title="Team B"
          description="Swoyambhu, Baneshwor & Lagankhel"
          group="B"
          franchiseEntries={groupBEntries}
          salespersons={toRankedSalespersons(groupBEntries, "B")}
          loading={loading}
        />
        <GroupRankingsPanel
          title="Team C"
          description="Jorpati, Bhaktapur, Kirtipur, Gairidhara, Sitapaila, Soalteemode & Jhamsikhel"
          group="C"
          franchiseEntries={groupCEntries}
          salespersons={toRankedSalespersons(groupCEntries, "C")}
          loading={loading}
        />
      </div>

      <div className="pt-2 sm:pt-4">
        <TopSalespersonsList
          salespersons={allRankedSalespersons}
          loading={loading}
          subtitle={`Overall Standings across all groups (Team A, B & C)`}
        />
      </div>
    </div>
  );
}
