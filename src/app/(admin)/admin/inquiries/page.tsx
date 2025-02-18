"use client";

import { useEffect, useState } from "react";
import { columns } from "./components/enquiries-columns";
import { EnquiriesResponse } from "@/types/enquiries";
import { showError } from "@/lib/alerts";
import axios from "axios";
import { DataTable } from "./components/enquiries-data-table";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiriesResponse>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchEnquiries = async (page: number = 1, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const response = await axios.get<EnquiriesResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inquiries/?page=${page}&page_size=${size}`
      );
      setEnquiries(response.data);
      setCurrentPage(page);
      setPageSize(size);
    } catch {
      showError("Failed to fetch enquiries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGlobalSearch = async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get<EnquiriesResponse>(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/inquiries/?search=${encodeURIComponent(
          searchTerm
        )}&page_size=${pageSize}`
      );
      setEnquiries(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching enquiries:", error);
      showError("Failed to search enquiries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handlePageChange = (page: number) => {
    fetchEnquiries(page, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchEnquiries(1, newSize);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Enquiries</h1>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={enquiries.results}
          onDataChange={fetchEnquiries}
          isLoading={isLoading}
          onGlobalSearch={handleGlobalSearch}
          pagination={{
            pageCount: Math.ceil(enquiries.count / pageSize),
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
