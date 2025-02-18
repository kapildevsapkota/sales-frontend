"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "./components/rentals-data-table";
import { columns } from "./components/rentals-columns";
import { RentalsResponse } from "@/types/rentals";
import { showError } from "@/lib/alerts";
import axios from "axios";

export default function RentalsPage() {
  const router = useRouter();
  const [rentals, setRentals] = useState<RentalsResponse>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchRentals = async (page: number = 1, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const response = await axios.get<RentalsResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/?page=${page}&page_size=${size}`
      );
      console.log("Total count:", response.data.count);
      console.log("Page size:", size);
      console.log(
        "Calculated page count:",
        Math.ceil(response.data.count / size)
      );
      setRentals(response.data);
      setCurrentPage(page);
      setPageSize(size);
    } catch {
      showError("Failed to fetch rentals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGlobalSearch = async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get<RentalsResponse>(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/projects/?search=${encodeURIComponent(
          searchTerm
        )}&page_size=${pageSize}`
      );
      setRentals(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching rentals:", error);
      showError("Failed to search rentals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handlePageChange = (page: number) => {
    fetchRentals(page, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchRentals(1, newSize);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rentals</h1>
        <Button onClick={() => router.push("/admin/rentals/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={rentals.results}
          onDataChange={fetchRentals}
          isLoading={isLoading}
          onGlobalSearch={handleGlobalSearch}
          pagination={{
            pageCount: Math.ceil(rentals.count / pageSize),
            currentPage,
            pageSize,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      </div>
    </div>
  );
}
