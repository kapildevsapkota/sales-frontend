"use client";

import { useEffect, useState } from "react";
import { TestimonialsResponse } from "@/types/testimonials";
import { columns } from "./components/testimonials-columns";
import { DataTable } from "./components/testimonials-data-table";
import axios from "axios";
import { showError } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditTestimonialDialog } from "./components/testimonials-edit-dialog";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialsResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchTestimonials = async (
    page: number = 1,
    size: number = pageSize
  ) => {
    try {
      setIsLoading(true);
      const response = await axios.get<TestimonialsResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials/?page=${page}&page_size=${size}`
      );
      setTestimonials(response.data);
      setCurrentPage(page);
      setPageSize(size);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      showError("Failed to fetch testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGlobalSearch = async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get<TestimonialsResponse>(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/testimonials/?search=${encodeURIComponent(
          searchTerm
        )}&page_size=${pageSize}`
      );
      setTestimonials(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching testimonials:", error);
      showError("Failed to search testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handlePageChange = (page: number) => {
    fetchTestimonials(page, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchTestimonials(1, newSize);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={testimonials?.results || []}
        onDataChange={fetchTestimonials}
        isLoading={isLoading}
        onGlobalSearch={handleGlobalSearch}
        pagination={{
          pageCount: Math.ceil((testimonials?.count || 0) / pageSize),
          currentPage,
          pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />

      <EditTestimonialDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchTestimonials}
      />
    </div>
  );
}
