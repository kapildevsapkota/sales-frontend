"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, LayoutDashboard, Package, Store } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import FranchiseOrdersTable from "@/components/franchiseOrdersTable/franchise-orders-table";
import { api } from "@/lib/api";

interface FranchiseDetailViewProps {
  id: string;
  initialName?: string;
  initialTab?: string;
}

export default function FranchiseDetailView({
  id,
  initialName,
  initialTab = "dashboard",
}: FranchiseDetailViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabFromQuery = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(
    tabFromQuery || initialTab || "dashboard",
  );
  const [franchiseName, setFranchiseName] = useState<string>(
    initialName ? decodeURIComponent(initialName) : "",
  );

  useEffect(() => {
    const currentQueryTab = searchParams.get("tab");
    if (currentQueryTab && currentQueryTab !== activeTab) {
      setActiveTab(currentQueryTab);
    }
  }, [searchParams, activeTab]);

  useEffect(() => {
    const nameFromUrl = searchParams.get("name");
    if (nameFromUrl) {
      setFranchiseName(decodeURIComponent(nameFromUrl));
      return;
    }

    if (!franchiseName) {
      const fetchFranchiseInfo = async () => {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await api.get("/api/account/my-franchises", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = response.data;
          const list: { id: number; name: string }[] = Array.isArray(data)
            ? data
            : data?.results || [];
          const found = list.find((f) => String(f.id) === String(id));
          if (found?.name) {
            setFranchiseName(found.name);
          }
        } catch (e) {
          console.error("Failed to fetch franchise info:", e);
        }
      };

      fetchFranchiseInfo();
    }
  }, [id, franchiseName, searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    if (franchiseName && !params.get("name")) {
      params.set("name", franchiseName);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex min-h-screen flex-col bg-muted/40 pb-12"
    >
      {/* Top Header & Tab Navigation Bar */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 pt-5 pb-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-1.5 h-9 rounded-lg shrink-0 border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800"
            >
              <Link href="/super-admin/organization/franchises">
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Franchises</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-neutral-800 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Store className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                    {franchiseName || "Franchise"}
                  </h1>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  Overview analytics and order management
                </p>
              </div>
            </div>
          </div>

          <TabsList className="grid grid-cols-2 w-full md:w-[260px] h-10 p-1 bg-slate-100 dark:bg-neutral-800 rounded-xl">
            <TabsTrigger
              value="dashboard"
              className="gap-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-xs transition-all"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="gap-2 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-xs transition-all"
            >
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Dashboard View */}
      <TabsContent value="dashboard" className="mt-0 focus-visible:outline-none">
        <DashboardContent id={id} />
      </TabsContent>

      {/* Orders View */}
      <TabsContent value="orders" className="mt-0 focus-visible:outline-none">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-xs p-4 sm:p-6">
            <FranchiseOrdersTable franchiseId={id} />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
