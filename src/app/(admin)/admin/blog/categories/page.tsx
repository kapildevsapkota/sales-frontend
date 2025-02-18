"use client";

import { useEffect, useState } from "react";
import { BlogCategory } from "@/types/blog";
import { columns } from "./components/blog-category-columns";
import { DataTable } from "./components/blog-category-data-table";
import axios from "axios";
import { showError } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditBlogCategoryDialog } from "./components/blog-category-edit-dialog";

interface BlogCategoriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BlogCategory[];
}

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategoriesResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchCategories = async (page: number = 1, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const response = await axios.get<BlogCategoriesResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/?page=${page}&page_size=${size}`
      );
      setCategories(response.data);
      setCurrentPage(page);
      setPageSize(size);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showError("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGlobalSearch = async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get<BlogCategoriesResponse>(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/categories/?search=${encodeURIComponent(
          searchTerm
        )}&page_size=${pageSize}`
      );
      setCategories(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching categories:", error);
      showError("Failed to search categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handlePageChange = (page: number) => {
    fetchCategories(page, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchCategories(1, newSize);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Categories</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={categories?.results || []}
        onDataChange={fetchCategories}
        isLoading={isLoading}
        onGlobalSearch={handleGlobalSearch}
        pagination={{
          pageCount: Math.ceil((categories?.count || 0) / pageSize),
          currentPage,
          pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />

      <EditBlogCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
