"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import DateRangePicker from "@/components/ui/date-range-picker";
import confetti from "canvas-confetti";

// Define the type for a product sale
interface ProductSale {
  product_name: string;
  quantity_sold: number;
}

// Define the type for a salesperson
interface Salesperson {
  first_name: string;
  last_name: string;
  total_sales: number;
  sales_count: number;
  product_sales: ProductSale[];
}

// Define the type for the API response
interface SalesResponse {
  filter_type: "all" | "daily" | "weekly" | "monthly";
  results: Salesperson[];
}

// Define group structure
interface Group {
  id: number;
  name: string;
  leader: string;
  members: string[];
  salespersons: Salesperson[];
  totalGroupSales: number;
  totalGroupOrders: number;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export function SalesFestView({ id }: { id?: string }) {
  const [filter, setFilter] = useState<"all" | "daily" | "weekly" | "monthly">(
    "daily"
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [previousData, setPreviousData] = useState<Group[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState<{
    groupName: string;
    changes: {
      name: string;
      oldValue: number;
      newValue: number;
      type: "sales" | "orders";
    }[];
  } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Define the groups
  const groups: Group[] = [
    {
      id: 1,
      name: "Group 1",
      leader: "Sanjog",
      members: ["sunita", "samundra", "raja"],
      salespersons: [],
      totalGroupSales: 0,
      totalGroupOrders: 0,
    },
    {
      id: 2,
      name: "Group 2",
      leader: "Sakshi",
      members: ["ritee", "rahul", "neeru"],
      salespersons: [],
      totalGroupSales: 0,
      totalGroupOrders: 0,
    },
    {
      id: 3,
      name: "Group 3",
      leader: "Sapana",
      members: ["rohit", "nirajan", "soniya"],
      salespersons: [],
      totalGroupSales: 0,
      totalGroupOrders: 0,
    },
  ];

  // Build URL with proper parameter handling
  const buildUrl = () => {
    const params = new URLSearchParams();
    params.append("filter", filter);

    if (id) {
      params.append("franchise", id);
    }

    // Add date parameters when dateRange is selected
    if (dateRange?.from) {
      params.append("start_date", format(dateRange.from, "yyyy-MM-dd"));
    }
    if (dateRange?.to && dateRange.to !== dateRange.from) {
      params.append("end_date", format(dateRange.to, "yyyy-MM-dd"));
    }

    return `https://sales.baliyoventures.com/api/sales/top-salespersons/?${params.toString()}`;
  };

  // Use SWR to fetch data with 5-second polling
  const { data, error, isLoading } = useSWR<SalesResponse>(
    buildUrl(),
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Function to organize salespersons into groups
  const organizeIntoGroups = (salespersons: Salesperson[]): Group[] => {
    const organizedGroups = groups.map((group) => ({
      ...group,
      salespersons: [] as Salesperson[],
      totalGroupSales: 0,
      totalGroupOrders: 0,
    }));

    salespersons.forEach((salesperson) => {
      const firstName = salesperson.first_name.toLowerCase();

      // Find which group this salesperson belongs to
      let assignedGroup = null;

      // Check if it's a leader
      const leaderGroup = organizedGroups.find(
        (g) => g.leader.toLowerCase() === firstName
      );
      if (leaderGroup) {
        assignedGroup = leaderGroup;
      } else {
        // Check if it's a member
        assignedGroup = organizedGroups.find((g) =>
          g.members.some((member) => member.toLowerCase() === firstName)
        );
      }

      if (assignedGroup) {
        assignedGroup.salespersons.push(salesperson);
        assignedGroup.totalGroupSales += salesperson.total_sales;
        assignedGroup.totalGroupOrders += salesperson.sales_count;
      }
    });

    return organizedGroups;
  };

  // Function to detect changes and trigger notifications
  const detectChanges = (currentGroups: Group[], previousGroups: Group[]) => {
    if (previousGroups.length === 0) return;

    const changes: {
      groupName: string;
      changes: {
        name: string;
        oldValue: number;
        newValue: number;
        type: "sales" | "orders";
      }[];
    }[] = [];

    currentGroups.forEach((currentGroup, groupIndex) => {
      const previousGroup = previousGroups[groupIndex];
      if (!previousGroup) return;

      const groupChanges: {
        name: string;
        oldValue: number;
        newValue: number;
        type: "sales" | "orders";
      }[] = [];

      // Check group totals
      if (currentGroup.totalGroupSales !== previousGroup.totalGroupSales) {
        groupChanges.push({
          name: "Group Sales",
          oldValue: previousGroup.totalGroupSales,
          newValue: currentGroup.totalGroupSales,
          type: "sales",
        });
      }

      if (currentGroup.totalGroupOrders !== previousGroup.totalGroupOrders) {
        groupChanges.push({
          name: "Group Orders",
          oldValue: previousGroup.totalGroupOrders,
          newValue: currentGroup.totalGroupOrders,
          type: "orders",
        });
      }

      // Check individual salesperson changes
      currentGroup.salespersons.forEach((currentSp) => {
        const previousSp = previousGroup.salespersons.find(
          (ps) =>
            ps.first_name === currentSp.first_name &&
            ps.last_name === currentSp.last_name
        );

        if (previousSp) {
          if (currentSp.total_sales !== previousSp.total_sales) {
            groupChanges.push({
              name: `${currentSp.first_name} ${currentSp.last_name} Sales`,
              oldValue: previousSp.total_sales,
              newValue: currentSp.total_sales,
              type: "sales",
            });
          }

          if (currentSp.sales_count !== previousSp.sales_count) {
            groupChanges.push({
              name: `${currentSp.first_name} ${currentSp.last_name} Orders`,
              oldValue: previousSp.sales_count,
              newValue: currentSp.sales_count,
              type: "orders",
            });
          }
        }
      });

      if (groupChanges.length > 0) {
        changes.push({
          groupName: currentGroup.name,
          changes: groupChanges,
        });
      }
    });

    return changes;
  };

  // Effect to handle data changes and notifications
  useEffect(() => {
    if (data?.results) {
      const currentGroups = organizeIntoGroups(data.results);

      if (previousData.length > 0) {
        const changes = detectChanges(currentGroups, previousData);

        if (changes && changes.length > 0) {
          // Play sound
          if (audioRef.current) {
            audioRef.current.play().catch(console.error);
          }

          // Trigger confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });

          // Show notification
          setNotificationData(changes[0]); // Show first group's changes
          setShowNotification(true);

          // Hide notification after 3 seconds
          setTimeout(() => {
            setShowNotification(false);
            setNotificationData(null);
          }, 5000);
        }
      }

      setPreviousData(currentGroups);
    }
  }, [data]);

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  // Refresh data when filter or dateRange changes
  const handleFilterChange = (
    newFilter: "all" | "daily" | "weekly" | "monthly"
  ) => {
    setFilter(newFilter);
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-48 sm:h-64 text-base sm:text-lg text-red-500">
        Error loading sales data. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48 sm:h-64 text-base sm:text-lg">
        Loading...
      </div>
    );
  }

  const salespersons = data?.results || [];
  const organizedGroups = organizeIntoGroups(salespersons);

  return (
    <div className="space-y-8">
      {/* Audio element for notifications */}
      <audio
        ref={audioRef}
        src="/positive-notification-digital-strum-fast-gamemaster-audio-1-1-00-03.mp3"
        preload="auto"
      />

      {/* Notification Toast */}
      {showNotification && notificationData && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="w-80 bg-green-50 border-2 border-green-200 rounded-lg shadow-lg p-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-800 flex items-center gap-2">
                <span className="text-xl">🎉</span>
                {notificationData.groupName} Update!
              </h4>
              <div className="space-y-2">
                {notificationData.changes.map((change, idx) => (
                  <div
                    key={idx}
                    className="text-sm bg-white rounded p-2 border border-green-100"
                  >
                    <div className="font-medium text-gray-700 mb-1">
                      {change.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 line-through">
                        {change.oldValue}
                      </span>
                      <span className="text-green-600">→</span>
                      <span className="text-green-700 font-semibold">
                        {change.newValue}
                      </span>
                      <span className="text-green-500 font-medium bg-green-100 px-2 py-1 rounded text-xs">
                        +{change.newValue - change.oldValue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mb-4 w-full">
        <div>
          {(["all", "daily", "weekly", "monthly"] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
        </div>
      </div>

      {/* 3-Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizedGroups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-2xl shadow-sm p-4 h-fit"
          >
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {group.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-600">Leader:</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {group.leader}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-green-600">Members:</span>
                  <div className="flex flex-wrap gap-1">
                    {group.members.map((member, idx) => (
                      <span
                        key={idx}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-purple-600">
                    Group Sales:
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-semibold">
                    {group.totalGroupSales}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-orange-600">
                    Group Orders:
                  </span>
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded font-semibold">
                    {group.totalGroupOrders}
                  </span>
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {group.salespersons.length === 0 && (
                <div className="text-center text-gray-500 py-4 text-sm">
                  No sales data found for this group.
                </div>
              )}
              {group.salespersons.map((sp, idx) => (
                <AccordionItem
                  key={idx}
                  value={sp.first_name + sp.last_name + idx}
                >
                  <AccordionTrigger className="text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center w-full justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {sp.first_name} {sp.last_name}
                        </span>
                        {sp.first_name.toLowerCase() ===
                          group.leader.toLowerCase() && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            Leader
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col text-xs">
                        <span className="text-gray-500">
                          Sales:{" "}
                          <span className="font-semibold text-primary">
                            {sp.total_sales}
                          </span>
                        </span>
                        <span className="text-gray-500">
                          Orders:{" "}
                          <span className="font-semibold">
                            {sp.sales_count}
                          </span>
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-1 px-1">Product</th>
                            <th className="text-left py-1 px-1">Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sp.product_sales.length === 0 ? (
                            <tr>
                              <td
                                colSpan={2}
                                className="py-1 px-1 text-gray-400 text-xs"
                              >
                                No product sales
                              </td>
                            </tr>
                          ) : (
                            sp.product_sales.map((ps, i) => (
                              <tr key={i} className="border-b last:border-0">
                                <td className="py-1 px-1 text-xs">
                                  {ps.product_name}
                                </td>
                                <td className="py-1 px-1 text-xs">
                                  {ps.quantity_sold}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
