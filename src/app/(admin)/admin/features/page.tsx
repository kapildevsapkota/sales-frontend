"use client";

import { useEffect, useState } from "react";
import { FeaturesResponse } from "@/types/features";
import { columns } from "./components/features-columns";
import { DataTable } from "./components/features-data-table";
import axios from "axios";
import { showError } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditFeaturesDialog } from "./components/features-edit-features-dialog";

export default function FeaturesPage() {
  const [features, setFeatures] = useState<FeaturesResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchFeatures = async (page: number = 1, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const response = await axios.get<FeaturesResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/features/?page=${page}&page_size=${size}`
      );
      setFeatures(response.data);
      setCurrentPage(page);
      setPageSize(size);
    } catch {
      showError("Failed to fetch features");
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
        }/api/features/?search=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();
      setFeatures(data as FeaturesResponse);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching features:", error);
      showError("Failed to search features");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handlePageChange = (page: number) => {
    fetchFeatures(page, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchFeatures(1, newSize);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Features</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Feature
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={features?.results || []}
        onDataChange={fetchFeatures}
        isLoading={isLoading}
        onGlobalSearch={handleGlobalSearch}
        pagination={{
          pageCount: Math.ceil((features?.count || 0) / pageSize),
          currentPage,
          pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />

      <EditFeaturesDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => fetchFeatures()}
      />
    </div>
  );
}