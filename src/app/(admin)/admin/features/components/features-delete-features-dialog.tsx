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

interface DeleteFeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureId: number;
  featureName: string;
  onDelete: () => void;
}

export function DeleteFeaturesDialog({
  open,
  onOpenChange,
  featureId,
  featureName,
  onDelete,
}: DeleteFeaturesDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/features/${featureId}/`
      );

      if (response.status !== 204) throw new Error("Failed to delete feature");

      showSuccess("Feature deleted successfully");
      onDelete();
      onOpenChange(false);
    } catch {
      showError("Failed to delete feature");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Feature</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {featureName}? This action cannot be
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