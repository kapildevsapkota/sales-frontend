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
  TestimonialFormSchema,
  testimonialFormSchema,
} from "@/schemas/testimonial-form-schema";
import type { Testimonial } from "@/types/testimonials";
import { MinimalTiptapEditor } from "@/components/common/minimal-tiptap";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import { CloudUpload, Paperclip, X } from "lucide-react";

interface EditTestimonialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: Testimonial;
  onSuccess: () => void;
}

export function EditTestimonialDialog({
  open,
  onOpenChange,
  testimonial,
  onSuccess,
}: EditTestimonialDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<TestimonialFormSchema>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: {
      name: testimonial?.name || "",
      testimonial: testimonial?.testimonial || "",
      source: testimonial?.source || "",
    },
  });

  const onSubmit = async (values: TestimonialFormSchema) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("testimonial", values.testimonial);
      if (values.source) formData.append("source", values.source);
      if (file) formData.append("image", file);

      const url = testimonial
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials/${testimonial.id}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials/`;

      const response = await fetch(url, {
        method: testimonial ? "PUT" : "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save testimonial");
      }

      showSuccess(
        `Testimonial ${testimonial ? "updated" : "created"} successfully`
      );
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving testimonial:", error);
      showError("Failed to save testimonial");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageDelete = () => {
    setFile(null);
  };

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 2, // 2MB
    multiple: false,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {testimonial ? "Edit Testimonial" : "Add New Testimonial"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="testimonial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Testimonial</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MinimalTiptapEditor
                        value={field.value}
                        onChange={field.onChange}
                        className="min-h-[200px] sm:min-h-[250px] bg-white dark:bg-gray-900 overflow-y-auto"
                        editorContentClassName="p-3 sm:p-4"
                        output="html"
                        placeholder="Enter testimonial content..."
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter source (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <div className="space-y-4">
                    {testimonial?.image && !file && (
                      <div className="relative w-32 h-32 group">
                        <img
                          src={testimonial.image}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleImageDelete}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <FileUploader
                      value={file ? [file] : []}
                      onValueChange={(files) => setFile(files?.[0] || null)}
                      dropzoneOptions={dropZoneConfig}
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
                {isLoading ? "Saving..." : testimonial ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
