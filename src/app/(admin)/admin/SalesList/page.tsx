"use client";

import { useEffect, useState } from "react";
import { SalesResponse } from "@/types/sale";
import axios from "axios";
import { showError } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "./components/states-data-table";
import { EditStateDialog } from "./components/states-edit-state-dialog";
import { columns } from "./components/states-columns";

export default function SalesPage() {
  const [sales, setSales] = useState<SalesResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchSales = async (page: number = 1, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access");
      const response = await axios.get<SalesResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}api/sales/orders/?page=${page}&page_size=${size}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSales(response.data);
      setCurrentPage(page);
      setPageSize(size);
    } catch {
      showError("Failed to fetch sales data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGlobalSearch = async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }api/sales/orders/?search=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();
      setSales(data as SalesResponse);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching sales:", error);
      showError("Failed to search sales");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handlePageChange = (page: number) => {
    fetchSales(page, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchSales(1, newSize);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales List</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Order
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={sales?.results || []}
        onDataChange={fetchSales}
        isLoading={isLoading}
        onGlobalSearch={handleGlobalSearch}
        pagination={{
          pageCount: Math.ceil((sales?.count || 0) / pageSize),
          currentPage,
          pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />

      <EditStateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchSales}
      />
    </div>
  );
}
