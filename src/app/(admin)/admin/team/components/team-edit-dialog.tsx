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
import { TeamFormSchema, teamFormSchema } from "@/schemas/team-form-schema";
import type { TeamMember } from "@/types/team";
import { MinimalTiptapEditor } from "@/components/common/minimal-tiptap";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import { CloudUpload, Paperclip, X } from "lucide-react";

interface EditTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMember;
  onSuccess: () => void;
}

export function EditTeamDialog({
  open,
  onOpenChange,
  member,
  onSuccess,
}: EditTeamDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<TeamFormSchema>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: member?.name || "",
      role: member?.role || "",
      description: member?.description || "",
      email: member?.email || "",
      profile_picture_alt_description:
        member?.profile_picture_alt_description || "",
      facebook_link: member?.facebook_link || "",
      instagram_link: member?.instagram_link || "",
      twitter_link: member?.twitter_link || "",
      linkedin_link: member?.linkedin_link || "",
    },
  });

  const onSubmit = async (values: TeamFormSchema) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      if (file) formData.append("profile_picture", file);

      const url = member
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/team/${member.id}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/team/`;

      const response = await fetch(url, {
        method: member ? "PUT" : "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save team member");
      }

      showSuccess(`Team member ${member ? "updated" : "created"} successfully`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving team member:", error);
      showError("Failed to save team member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageDelete = () => {
    setFile(null);
  };

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 2,
    multiple: false,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {member ? "Edit Team Member" : "Add Team Member"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter role" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MinimalTiptapEditor
                          value={field.value}
                          onChange={field.onChange}
                          className="min-h-[200px] sm:min-h-[250px] bg-white dark:bg-gray-900 overflow-y-auto"
                          editorContentClassName="p-3 sm:p-4"
                          output="html"
                          placeholder="Enter description..."
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="facebook_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Facebook URL"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Instagram URL"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitter_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Twitter URL"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter LinkedIn URL"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Profile Picture */}
            <FormField
              control={form.control}
              name="profile_picture"
              render={() => (
                <FormItem>
                  <FormLabel>Profile Picture</FormLabel>
                  <div className="space-y-4">
                    {member?.profile_picture && !file && (
                      <div className="relative w-32 h-32 group">
                        <img
                          src={member.profile_picture}
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
                {isLoading ? "Saving..." : member ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
