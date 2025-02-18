"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { showSuccess, showError } from "@/lib/alerts";
import axios from "axios";

interface DeleteBlogPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postTitle: string;
  postSlug: string;
  onDelete: () => void;
}

export function DeleteBlogPostDialog({
  open,
  onOpenChange,
  postTitle,
  postSlug,
  onDelete,
}: DeleteBlogPostDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/posts/${postSlug}/`
      );

      if (response.status !== 204) throw new Error("Failed to delete post");

      showSuccess("Blog post deleted successfully");
      onDelete();
      onOpenChange(false);
    } catch {
      showError("Failed to delete blog post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Blog Post</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{postTitle}&quot;? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
