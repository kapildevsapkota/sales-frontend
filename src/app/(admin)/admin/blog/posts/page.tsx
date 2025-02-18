"use client";

import { useEffect, useState } from "react";
import { BlogsResponse } from "@/types/blog";
import { columns } from "./components/blog-posts-columns";
import { DataTable } from "./components/blog-posts-data-table";
import axios from "axios";
import { showError } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BlogPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogsResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPosts = async (page: number = 1, size: number = pageSize) => {
    try {
      setIsLoading(true);
      const response = await axios.get<BlogsResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blogs/?page=${page}&page_size=${size}`
      );
      setPosts(response.data);
      setCurrentPage(page);
      setPageSize(size);
    } catch (error) {
      console.error("Error fetching posts:", error);
      showError("Failed to fetch posts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGlobalSearch = async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get<BlogsResponse>(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/blog/posts/?search=${encodeURIComponent(
          searchTerm
        )}&page_size=${pageSize}`
      );
      setPosts(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching posts:", error);
      showError("Failed to search posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePageChange = (page: number) => {
    fetchPosts(page, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    fetchPosts(1, newSize);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={() => router.push("/admin/blog/posts/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Post
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={posts?.posts || []}
        onDataChange={fetchPosts}
        isLoading={isLoading}
        onGlobalSearch={handleGlobalSearch}
        pagination={{
          pageCount: Math.ceil((posts?.posts.length || 0) / pageSize),
          currentPage,
          pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />
    </div>
  );
}
