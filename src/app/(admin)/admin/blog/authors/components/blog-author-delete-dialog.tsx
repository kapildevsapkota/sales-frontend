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

interface DeleteBlogAuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authorId: number;
  onDelete: () => void;
}

export function DeleteBlogAuthorDialog({
  open,
  onOpenChange,
  authorId,
  onDelete,
}: DeleteBlogAuthorDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/authors/${authorId}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete author");

      showSuccess("Author deleted successfully");
      onDelete();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting author:", error);
      showError("Failed to delete author");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Author</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this author? This action cannot be
            undone.
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
