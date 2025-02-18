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

interface DeleteTestimonialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonialId: number | string;
  onDelete: () => void;
}

export function DeleteTestimonialDialog({
  open,
  onOpenChange,
  testimonialId,
  onDelete,
}: DeleteTestimonialDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials/${testimonialId}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete testimonial");

      showSuccess("Testimonial deleted successfully");
      onDelete();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      showError("Failed to delete testimonial");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Testimonial</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this testimonial? This action cannot
            be undone.
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
