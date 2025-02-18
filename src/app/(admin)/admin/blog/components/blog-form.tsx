"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlogFormSchema, blogFormSchema } from "@/schemas/blog-form-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import {
  Blog,
  BlogAuthor,
  BlogAuthorResponse,
  BlogCategory,
  BlogCategoryResponse,
  BlogTag,
  BlogTagResponse,
} from "@/types/blog";
import { showError, showSuccess } from "@/lib/alerts";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { EditBlogAuthorDialog } from "../authors/components/blog-author-edit-dialog";
import { EditBlogCategoryDialog } from "../categories/components/blog-category-edit-dialog";
import { EditBlogTagDialog } from "../tags/components/blog-tag-edit-dialog";
import { MinimalTiptapEditor } from "@/components/common/minimal-tiptap";
import { TagInput } from "@/components/ui/tag-input";

interface BlogFormProps {
  initialData?: Blog;
}

export function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<BlogTag[]>([]);
  const [authorDialogOpen, setAuthorDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);

  console.log("initialData:", initialData);
  console.log("initialData?.tags:", initialData?.tags);

  const form = useForm<BlogFormSchema>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      blog_content: initialData?.blog_content || "",
      blog_duration_to_read: initialData?.blog_duration_to_read || "",
      thumbnail_image: initialData?.thumbnail_image || undefined,
      thumbnail_image_alt_description:
        initialData?.thumbnail_image_alt_description || "",
      meta_title: initialData?.meta_title || "",
      meta_description: initialData?.meta_description || "",
      meta_keywords: initialData?.meta_keywords || "",
      category: initialData?.category?.category_name || undefined,
      author: initialData?.author?.id || undefined,
      tags: initialData?.tags?.map((tag) => tag.id) || [],
    },
  });

  const fetchData = async () => {
    try {
      setIsDataLoading(true);
      const [authorsRes, categoriesRes, tagsRes] = await Promise.all([
        axios.get<BlogAuthorResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/authors/`
        ),
        axios.get<BlogCategoryResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories/`
        ),
        axios.get<BlogTagResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tags/`
        ),
      ]);

      setAuthors(authorsRes.data.results);
      setCategories(categoriesRes.data.results);
      setTags(tagsRes.data.results);

      if (initialData?.tags) {
        setSelectedTags(initialData.tags);
      }
    } catch {
      showError("Failed to fetch form data");
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [initialData]);

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const onSubmit = async (values: BlogFormSchema) => {
    try {
      setIsLoading(true);
      const formData = new FormData();

      // Append all form fields to formData
      Object.entries(values).forEach(([key, value]) => {
        if (key === "featured_image" && value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v.toString()));
        } else if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      if (initialData) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog/posts/${initialData.slug}/`,
          formData
        );
        showSuccess("Blog updated successfully");
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog/posts/`,
          formData
        );
        showSuccess("Blog created successfully");
      }

      router.push("/admin/blog/posts");
    } catch {
      showError(
        initialData
          ? "Failed to update blog post"
          : "Failed to create blog post"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fix the CategorySelect component
  const CategorySelect = (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <div className="flex gap-2">
            <FormControl>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.category_name}
                      value={category.category_name}
                    >
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setCategoryDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  // Update TagsSelect component
  const TagsSelect = (
    <FormField
      control={form.control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <div className="space-y-2">
            <div className="flex gap-2">
              <FormControl>
                <TagInput
                  placeholder="Search tags..."
                  availableTags={tags}
                  selectedTags={selectedTags}
                  onTagSelect={(tag) => {
                    if (!selectedTags.some((t) => t.id === tag.id)) {
                      const newTags = [...selectedTags, tag];
                      setSelectedTags(newTags);
                      field.onChange(newTags.map((t) => t.id));
                    }
                  }}
                  onTagRemove={(tagToRemove) => {
                    const newTags = selectedTags.filter(
                      (t) => t.id !== tagToRemove.id
                    );
                    setSelectedTags(newTags);
                    field.onChange(newTags.map((t) => t.id));
                  }}
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setTagDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Form fields */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content field */}
        <FormField
          control={form.control}
          name="blog_content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <MinimalTiptapEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Write your blog post content here..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Author selection with create button */}
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select author" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map((author) => (
                        <SelectItem
                          key={author.id}
                          value={author.id.toString()}
                        >
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setAuthorDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category selection */}
        {CategorySelect}

        {/* Meta Title field */}
        <FormField
          control={form.control}
          name="meta_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Meta Description field */}
        <FormField
          control={form.control}
          name="meta_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags selection */}
        {TagsSelect}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/blog/posts")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
          </Button>
        </div>
      </form>

      {/* Dialogs for creating new items */}
      <EditBlogAuthorDialog
        open={authorDialogOpen}
        onOpenChange={setAuthorDialogOpen}
        onSuccess={async () => {
          await fetchData();
          setAuthorDialogOpen(false);
        }}
      />
      <EditBlogCategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSuccess={async () => {
          await fetchData();
          setCategoryDialogOpen(false);
        }}
      />
      <EditBlogTagDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
        onSuccess={async () => {
          await fetchData();
          setTagDialogOpen(false);
        }}
      />
    </Form>
  );
}
