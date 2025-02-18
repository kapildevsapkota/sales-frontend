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
  BlogCategoryFormSchema,
  blogCategoryFormSchema,
} from "@/schemas/blog-category-form-schema";
import type { BlogCategory } from "@/types/blog";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import { CloudUpload, Paperclip, X } from "lucide-react";

interface EditBlogCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: BlogCategory;
  onSuccess: () => void;
}

export function EditBlogCategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: EditBlogCategoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<BlogCategoryFormSchema>({
    resolver: zodResolver(blogCategoryFormSchema),
    defaultValues: {
      category_name: category?.category_name || "",
    },
  });

  const onSubmit = async (values: BlogCategoryFormSchema) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("category_name", values.category_name);
      if (file) {
        formData.append("category_image", file);
      }

      const url = category
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${category.category_name}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/categories/`;

      const response = await fetch(url, {
        method: category ? "PUT" : "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save category");
      }

      showSuccess(`Category ${category ? "updated" : "created"} successfully`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving category:", error);
      showError("Failed to save category");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Image</FormLabel>
                  <div className="space-y-4">
                    {category?.category_image && !file && (
                      <div className="relative w-32 h-32 group">
                        <img
                          src={category.category_image}
                          alt="Category"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <FileUploader
                      value={file ? [file] : []}
                      onValueChange={(files) => {
                        const newFile = files?.[0] || null;
                        setFile(newFile);
                        field.onChange(newFile);
                      }}
                      dropzoneOptions={{
                        maxFiles: 1,
                        maxSize: 1024 * 1024 * 2, // 2MB
                        multiple: false,
                      }}
                      className="relative bg-background rounded-lg p-2"
                    >
                      <FileInput className="outline-dashed outline-1 outline-slate-500">
                        <div className="flex items-center justify-center flex-col p-4 sm:p-8 w-full">
                          <CloudUpload className="text-gray-500 w-8 h-8 sm:w-10 sm:h-10" />
                          <p className="mb-1 text-xs sm:text-sm text-gray-500 text-center">
                            <span className="font-semibold">
                              Click to upload
                            </span>
                            &nbsp; or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG or GIF (max 2MB)
                          </p>
                        </div>
                      </FileInput>
                      <FileUploaderContent>
                        {file && (
                          <FileUploaderItem index={0}>
                            <Paperclip className="h-4 w-4 stroke-current" />
                            <span>{file.name}</span>
                          </FileUploaderItem>
                        )}
                      </FileUploaderContent>
                    </FileUploader>
                  </div>
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
                {isLoading ? "Saving..." : category ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
