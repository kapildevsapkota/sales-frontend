"use client";

import { BlogForm } from "../../components/blog-form";

export default function CreateBlogPostPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Blog Post</h1>
      </div>

      <BlogForm />
    </div>
  );
}
