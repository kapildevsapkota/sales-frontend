"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Comment = {
  id: number;
  invoice: number;
  comment: string;
  created_at?: string;
};

type InvoiceCommentsProps = {
  comments: Comment[];
  isLoading: boolean;
  onAdd: (text: string) => Promise<void> | void;
  formatDateTime: (iso: string | null) => string;
  submitting?: boolean;
};

export function InvoiceComments({
  comments,
  isLoading,
  onAdd,
  formatDateTime,
  submitting,
}: InvoiceCommentsProps) {
  const [value, setValue] = useState("");

  const handleAdd = async () => {
    const text = value.trim();
    if (!text) return;
    await onAdd(text);
    setValue("");
  };

  return (
    <div className="mt-6 border-top pt-4">
      <h3 className="text-base font-semibold">Comments</h3>
      {isLoading ? (
        <div className="py-3 text-sm text-muted-foreground">
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-3 text-sm text-muted-foreground">
          No comments for this invoice.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="p-3 border rounded-md bg-gray-50">
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {c.comment}
              </div>
              {c.created_at ? (
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(c.created_at)}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-2">
        <Textarea
          placeholder="Write a comment..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end">
          <Button
            onClick={handleAdd}
            disabled={!!submitting || value.trim().length === 0}
          >
            {submitting ? "Submitting..." : "Add Comment"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceComments;
