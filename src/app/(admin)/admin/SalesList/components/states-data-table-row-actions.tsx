"use client";

import { Row } from "@tanstack/react-table";
import { Pen, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DeleteStateDialog } from "./states-delete-state-dialog";
import { EditStateDialog } from "./states-edit-state-dialog";
import { State } from "@/types/states";

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
  const state = row.original as State;

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

      <DeleteStateDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        stateName={state.name}
        stateSlug={state.slug}
        onDelete={onSuccess}
      />

      <EditStateDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        state={state}
        onSuccess={onSuccess}
      />
    </>
  );
}
