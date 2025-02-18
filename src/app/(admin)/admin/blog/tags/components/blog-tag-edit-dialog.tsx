"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { showSuccess, showError } from "@/lib/alerts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BlogTagFormSchema,
  blogTagFormSchema,
} from "@/schemas/blog-tag-form-schema";
import type { BlogTag } from "@/types/blog";

interface EditBlogTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: BlogTag;
  onSuccess: () => void;
}

export function EditBlogTagDialog({
  open,
  onOpenChange,
  tag,
  onSuccess,
}: EditBlogTagDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BlogTagFormSchema>({
    resolver: zodResolver(blogTagFormSchema),
    defaultValues: {
      tag_name: tag?.tag_name || "",
    },
  });

  const onSubmit = async (values: BlogTagFormSchema) => {
    setIsLoading(true);
    try {
      const url = tag
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/tags/${tag.id}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/tags/`;

      const response = await fetch(url, {
        method: tag ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save tag");
      }

      showSuccess(`Tag ${tag ? "updated" : "created"} successfully`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving tag:", error);
      showError("Failed to save tag");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tag ? "Edit Tag" : "Add New Tag"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tag_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tag name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : tag ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
