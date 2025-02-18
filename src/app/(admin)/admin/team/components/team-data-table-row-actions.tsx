"use client";

import { Row } from "@tanstack/react-table";
import { Pen, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DeleteTeamDialog } from "./team-delete-dialog";
import { EditTeamDialog } from "./team-edit-dialog";
import { TeamMember } from "@/types/team";

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
  const member = row.original as TeamMember;

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

      <DeleteTeamDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        memberId={member.id}
        onDelete={onSuccess}
      />

      <EditTeamDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        member={member}
        onSuccess={onSuccess}
      />
    </>
  );
}
