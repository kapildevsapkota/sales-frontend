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
import { State, StatesResponse } from "@/types/states";
import { City } from "@/types/city";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "City name must be at least 2 characters"),
  state: z.string().min(1, "Please select a state"),
});

interface EditCityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  city?: City;
  onSuccess: () => void;
}

export function EditCityDialog({
  open,
  onOpenChange,
  city,
  onSuccess,
}: EditCityDialogProps) {
  const [states, setStates] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: city?.name || "",
      state: city?.state.toString() || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: city?.name || "",
        state: city?.state.toString() || "",
      });
      fetchStates();
    }
  }, [open, city, form]);

  const fetchStates = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<StatesResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/states/`
      );
      if (response.data?.results) {
        setStates(response.data.results);
      }
    } catch (error) {
      console.error("Failed to fetch states:", error);
      showError("Failed to fetch states");
      setStates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const url = city
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/cities/${city.slug}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/cities/`;

      const response = await axios({
        method: city ? "PUT" : "POST",
        url,
        data: values,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Failed to save city");
      }

      showSuccess(`City ${city ? "updated" : "created"} successfully`);
      onSuccess();
      onOpenChange(false);
    } catch {
      showError("Failed to save city");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{city ? "Edit City" : "Add New City"}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {states?.map((state) => (
                          <SelectItem
                            key={state.id}
                            value={state.id.toString()}
                          >
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  {isLoading ? "Saving..." : city ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
