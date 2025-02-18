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
import { Textarea } from "@/components/ui/textarea";
import { showSuccess, showError } from "@/lib/alerts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaqFormSchema, faqFormSchema } from "@/schemas/faqs-form-schema";
import type { Faq } from "@/types/faqs";
import axios from "axios";
import { MinimalTiptapEditor } from "@/components/common/minimal-tiptap";

interface EditFaqDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq?: Faq;
  onSuccess: () => void;
}

export function EditFaqDialog({
  open,
  onOpenChange,
  faq,
  onSuccess,
}: EditFaqDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FaqFormSchema>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      question: faq?.question || "",
      answer: faq?.answer || "",
    },
  });

  const onSubmit = async (values: FaqFormSchema) => {
    setIsLoading(true);
    try {
      const url = faq
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/faqs/${faq.id}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/faqs/`;

      const formData = new URLSearchParams();
      formData.append("question", values.question);
      formData.append("answer", values.answer);

      const response = await axios({
        method: faq ? "PUT" : "POST",
        url,
        data: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Failed to save FAQ");
      }

      showSuccess(`FAQ ${faq ? "updated" : "created"} successfully`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving FAQ:", error);
      showError("Failed to save FAQ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{faq ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the question"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MinimalTiptapEditor
                        value={field.value}
                        onChange={field.onChange}
                        className="min-h-[200px] sm:min-h-[250px] bg-white dark:bg-gray-900 overflow-y-auto"
                        editorContentClassName="p-3 sm:p-4"
                        output="html"
                        placeholder="Enter the answer..."
                      />
                    </div>
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
                {isLoading ? "Saving..." : faq ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
