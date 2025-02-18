"use client";

import { Row } from "@tanstack/react-table";
import { Pen, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Blog } from "@/types/blog";
import { DeleteBlogPostDialog } from "./blog-posts-delete-dialog";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onSuccess: () => void;
}

export function DataTableRowActions<TData>({
  row,
  onSuccess,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const post = row.original as Blog;

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
          onClick={() => router.push(`/admin/blog/posts/${post.slug}/edit`)}
        >
          <Pen className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>

      <DeleteBlogPostDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        postTitle={post.title}
        postSlug={post.slug}
        onDelete={onSuccess}
      />
    </>
  );
}
