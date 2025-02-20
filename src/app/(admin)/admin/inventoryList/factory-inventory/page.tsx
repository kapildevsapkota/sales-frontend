"use client";

import { useEffect, useState } from "react";
import { FactoryInventoryResponse } from "@/types/factory";
import axios from "axios";
import { showError } from "@/lib/alerts";
import { DataTable } from "./components/factory-data-table";
import { EditStateDialog } from "./components/factory-edit-state-dialog";
import { columns } from "./components/factory-columns";

export default function FactoryInventoryPage() {
  const [factoryInventory, setFactoryInventory] =
    useState<FactoryInventoryResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchFactoryInventory = async (
    page: number = 1,
    size: number = pageSize
  ) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get<FactoryInventoryResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}api/sales/factory-inventory/?page=${page}&page_size=${size}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFactoryInventory(response.data);
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
        }api/sales/factory-inventory/?search=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();
      setFactoryInventory(data as FactoryInventoryResponse);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching sales:", error);
      showError("Failed to search sales");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFactoryInventory();
  }, []);

  const handlePageChange = (page: number) => {
    fetchFactoryInventory(page, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchFactoryInventory(1, newSize);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Factory Inventory</h1>
      </div>

      <DataTable
        columns={columns}
        data={factoryInventory?.data || []}
        onDataChange={fetchFactoryInventory}
        isLoading={isLoading}
        onGlobalSearch={handleGlobalSearch}
        pagination={{
          pageCount: Math.ceil((factoryInventory?.count || 0) / pageSize),
          currentPage,
          pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />

      <EditStateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchFactoryInventory}
      />
    </div>
  );
}
