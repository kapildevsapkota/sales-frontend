"use client";

import { Row } from "@tanstack/react-table";
import { Pen, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DeleteFeaturesDialog } from "./features-delete-features-dialog";
import { EditFeaturesDialog } from "./features-edit-features-dialog";
import { Features } from "@/types/features";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onSuccess: () => void;
}

export function DataTableRowActions<TData>({
  row,
  onSuccess,
}: DataTableRowActionsProps<TData>) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const feature = row.original as Features;

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
          onClick={() => setShowEditDialog(true)}
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

      <DeleteFeaturesDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        featureId={feature.id}
        featureName={feature.name}
        onDelete={onSuccess}
      />

      <EditFeaturesDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        feature={feature}
        onSuccess={onSuccess}
      />
    </>
  );
}
