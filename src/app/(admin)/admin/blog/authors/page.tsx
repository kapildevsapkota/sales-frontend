"use client";

import { useEffect, useState } from "react";
import { BlogAuthor } from "@/types/blog";
import { columns } from "./components/blog-author-columns";
import { DataTable } from "./components/blog-author-data-table";
import axios from "axios";
import { showError } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditBlogAuthorDialog } from "./components/blog-author-edit-dialog";

interface BlogAuthorsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BlogAuthor[];
}

export default function BlogAuthorsPage() {
  const [authors, setAuthors] = useState<BlogAuthorsResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchAuthors = async (page: number = 1, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const response = await axios.get<BlogAuthorsResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/authors/?page=${page}&page_size=${size}`
      );
      setAuthors(response.data);
      setCurrentPage(page);
      setPageSize(size);
    } catch (error) {
      console.error("Error fetching authors:", error);
      showError("Failed to fetch authors");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGlobalSearch = async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get<BlogAuthorsResponse>(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/authors/?search=${encodeURIComponent(
          searchTerm
        )}&page_size=${pageSize}`
      );
      setAuthors(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching authors:", error);
      showError("Failed to search authors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handlePageChange = (page: number) => {
    fetchAuthors(page, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchAuthors(1, newSize);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Authors</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Author
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={authors?.results || []}
        onDataChange={fetchAuthors}
        isLoading={isLoading}
        onGlobalSearch={handleGlobalSearch}
        pagination={{
          pageCount: Math.ceil((authors?.count || 0) / pageSize),
          currentPage,
          pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />

      <EditBlogAuthorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchAuthors}
      />
    </div>
  );
}
