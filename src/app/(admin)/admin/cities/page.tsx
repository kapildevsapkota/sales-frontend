"use client";

import { useEffect, useState } from "react";
import { CityResponse } from "@/types/city";
import { columns } from "./components/cities-columns";
import { DataTable } from "./components/cities-data-table";
import axios from "axios";
import { showError } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditCityDialog } from "./components/cities-edit-city-dialog";

export default function CitiesPage() {
  const [cities, setCities] = useState<CityResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchCities = async (page: number = 1, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const response = await axios.get<CityResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cities/?page=${page}&page_size=${size}`
      );
      setCities(response.data);
      setCurrentPage(page);
      setPageSize(size);
    } catch {
      showError("Failed to fetch cities");
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
        }/api/cities/?search=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();
      setCities(data as CityResponse);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching cities:", error);
      showError("Failed to search cities");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handlePageChange = (page: number) => {
    fetchCities(page, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchCities(1, newSize);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cities</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add City
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={cities?.results || []}
        onDataChange={fetchCities}
        isLoading={isLoading}
        onGlobalSearch={handleGlobalSearch}
        pagination={{
          pageCount: Math.ceil((cities?.count || 0) / pageSize),
          currentPage,
          pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />

      <EditCityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchCities}
      />
    </div>
  );
}
