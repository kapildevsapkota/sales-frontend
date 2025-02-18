"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { showSuccess, showError } from "@/lib/alerts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Features } from "@/types/features";
import { Loader2, X, CloudUpload, Paperclip } from "lucide-react";
import {
  FileUploader,
  FileInput,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";

const formSchema = z.object({
  name: z.string().min(2, "Feature name must be at least 2 characters"),
  image: z
    .any()
    .refine((file) => file instanceof File || typeof file === "string", {
      message: "Image is required",
    }),
});

interface EditFeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: Features;
  onSuccess: () => void;
}

export function EditFeaturesDialog({
  open,
  onOpenChange,
  feature,
  onSuccess,
}: EditFeaturesDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(feature?.image || null);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: feature?.name || "",
      image: feature?.image || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: feature?.name || "",
        image: feature?.image || "",
      });
      setPreview(feature?.image || null);
      setFile(null);
    }
  }, [open, feature, form]);

  const handleImageDelete = () => {
    form.setValue("image", "");
    setPreview(null);
    setFile(null);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.image instanceof File) {
        formData.append("image", values.image);
      }

      const url = feature
        ? `https://yetipm.baliyoventures.com/api/features/${feature.id}/`
        : `https://yetipm.baliyoventures.com/api/features/`;

      const response = await axios({
        method: feature ? "PUT" : "POST",
        url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Failed to save feature");
      }

      showSuccess(`Feature ${feature ? "updated" : "created"} successfully`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      showError("Failed to save feature");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (files: File[] | null) => {
    if (files === null) {
      setFile(null);
      return;
    }
    if (files.length === 0) {
      setFile(null);
      return;
    }
    setFile(files[0]);
    if (files[0]) {
      form.setValue("image", files[0]);
      setPreview(URL.createObjectURL(files[0]));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {feature ? "Edit Feature" : "Add New Feature"}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Feature Name Input */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feature Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Feature Image Upload */}
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Feature Image</FormLabel>
                    <div className="space-y-4">
                      {/* Image Preview with Delete Button */}
                      {preview && (
                        <div className="relative w-32 h-32 group">
                          <img
                            src={preview}
                            alt="Feature Preview"
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

                      {/* File Upload UI */}
                      <FileUploader
                        value={file ? [file] : []}
                        onValueChange={handleFileChange}
                        dropzoneOptions={{ maxSize: 2 * 1024 * 1024 }} // Max 2MB
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
                              PNG, JPG, or GIF (max 2MB)
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

              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : feature ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
