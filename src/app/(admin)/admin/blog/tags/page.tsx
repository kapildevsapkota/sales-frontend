"use client";

import { useEffect, useState } from "react";
import { BlogTag } from "@/types/blog";
import { columns } from "./components/blog-tag-columns";
import { DataTable } from "./components/blog-tag-data-table";
import axios from "axios";
import { showError } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditBlogTagDialog } from "./components/blog-tag-edit-dialog";

interface BlogTagsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BlogTag[];
}

export default function BlogTagsPage() {
  const [tags, setTags] = useState<BlogTagsResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchTags = async (page: number = 1, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const response = await axios.get<BlogTagsResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tags/?page=${page}&page_size=${size}`
      );
      setTags(response.data);
      setCurrentPage(page);
      setPageSize(size);
    } catch (error) {
      console.error("Error fetching tags:", error);
      showError("Failed to fetch tags");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGlobalSearch = async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get<BlogTagsResponse>(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/blog/tags/?search=${encodeURIComponent(
          searchTerm
        )}&page_size=${pageSize}`
      );
      setTags(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching tags:", error);
      showError("Failed to search tags");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handlePageChange = (page: number) => {
    fetchTags(page, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchTags(1, newSize);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Tags</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tag
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={tags?.results || []}
        onDataChange={fetchTags}
        isLoading={isLoading}
        onGlobalSearch={handleGlobalSearch}
        pagination={{
          pageCount: Math.ceil((tags?.count || 0) / pageSize),
          currentPage,
          pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />

      <EditBlogTagDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchTags}
      />
    </div>
  );
}
