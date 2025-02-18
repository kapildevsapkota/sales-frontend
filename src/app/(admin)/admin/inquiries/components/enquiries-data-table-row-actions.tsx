"use client";

import { Row } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Enquiry } from "@/types/enquiries";
import { ViewEnquiryDialog } from "./enquiries-view-dialog";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [showViewDialog, setShowViewDialog] = useState(false);
  const enquiry = row.original as Enquiry;

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
          onClick={() => setShowViewDialog(true)}
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">View</span>
        </Button>
      </div>

      <ViewEnquiryDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        enquiry={enquiry}
      />
    </>
  );
}
