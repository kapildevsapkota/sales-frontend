"use client";

import { useEffect, useState } from "react";
import { FaqsResponse } from "@/types/faqs";
import { columns } from "./components/faqs-columns";
import axios from "axios";
import { showError } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditFaqDialog } from "./components/faqs-edit-dialog";
import { DataTable } from "./components/faqs-data-table";

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<FaqsResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchFaqs = async (page: number = 1, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const response = await axios.get<FaqsResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/faqs/?page=${page}&page_size=${size}`
      );
      setFaqs(response.data);
      setCurrentPage(page);
      setPageSize(size);
    } catch {
      showError("Failed to fetch FAQs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGlobalSearch = async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get<FaqsResponse>(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/faqs/?search=${encodeURIComponent(
          searchTerm
        )}&page_size=${pageSize}`
      );
      setFaqs(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching FAQs:", error);
      showError("Failed to search FAQs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handlePageChange = (page: number) => {
    fetchFaqs(page, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchFaqs(1, newSize);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">FAQs</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={faqs?.results || []}
        onDataChange={fetchFaqs}
        isLoading={isLoading}
        onGlobalSearch={handleGlobalSearch}
        pagination={{
          pageCount: Math.ceil((faqs?.count || 0) / pageSize),
          currentPage,
          pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />

      <EditFaqDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchFaqs}
      />
    </div>
  );
}
