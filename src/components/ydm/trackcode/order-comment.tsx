"use client";
import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { createOrderComment } from "@/lib/ydm-api";
import type { CreateOrderCommentRequest } from "@/types/ydm-dashboard/comments";

type CreateCommentMutation = {
  mutateAsync: (payload: CreateOrderCommentRequest) => Promise<void>;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
};

function useCreateOrderComment(): CreateCommentMutation {
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutateAsync = useCallback(
    async (payload: CreateOrderCommentRequest) => {
      setIsPending(true);
      setIsError(false);
      setIsSuccess(false);
      try {
        await createOrderComment(payload);
        setIsSuccess(true);
      } catch (e) {
        setIsError(true);
        throw e;
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  return { mutateAsync, isPending, isError, isSuccess };
}

interface OrderCommentsSectionProps {
  orderId: number;
  orderCode: string;
}

export const OrderCommentsSection: React.FC<OrderCommentsSectionProps> = ({
  orderId,
  orderCode,
}) => {
  const [newComment, setNewComment] = useState("");
  const createCommentMutation = useCreateOrderComment();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        order: orderId,
        comment: newComment.trim(),
      });
      setNewComment(""); // Clear the form after successful submission
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  return (
    <div>
      <div className="pt-6">
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <Textarea
            placeholder={`Add a comment for order ${orderCode}...`}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            disabled={createCommentMutation.isPending}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!newComment.trim() || createCommentMutation.isPending}
              size="sm"
            >
              {createCommentMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Add Comment
            </Button>
          </div>
        </form>

        {createCommentMutation.isError && (
          <div className="mt-2 text-sm text-red-600">
            Failed to add comment. Please try again.
          </div>
        )}

        {createCommentMutation.isSuccess && (
          <div className="mt-2 text-sm text-green-600">
            Comment added successfully!
          </div>
        )}
      </div>
    </div>
  );
};
