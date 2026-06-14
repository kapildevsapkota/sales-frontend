"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft } from "lucide-react";
import FranchiseOrdersTable from "@/components/franchiseOrdersTable/franchise-orders-table";
import { Button } from "@/components/ui/button";

export default function FranchiseOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { id } = use(params);
  const { name } = use(searchParams);

  return (
    <div className="container mx-auto max-w-[1800px] space-y-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" className="w-fit gap-2" asChild>
          <Link href="/super-admin/salesfest">
            <ArrowLeft className="h-4 w-4" />
            Back to Sales Fest
          </Link>
        </Button>
        <div className="text-right">
          <h1 className="text-2xl font-bold">
            {name ? decodeURIComponent(name) : "Franchise"} Orders
          </h1>
          <p className="text-sm text-muted-foreground">Franchise ID: {id}</p>
        </div>
      </div>

      <FranchiseOrdersTable franchiseId={id} />
    </div>
  );
}
