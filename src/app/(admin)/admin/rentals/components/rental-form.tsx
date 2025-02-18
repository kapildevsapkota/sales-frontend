"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { showSuccess, showError } from "@/lib/alerts";
import { MinimalTiptapEditor } from "@/components/common/minimal-tiptap/minimal-tiptap";
import { CloudUpload, Paperclip, X } from "lucide-react";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import { Rental, Feature } from "@/types/rentals";
import { City } from "@/types/city";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { propertyTypes } from "./data/properyTypes";
import {
  RentalFormSchema,
  rentalFormSchema,
} from "@/schemas/rental-form-schema";

interface RentalFormProps {
  initialData?: Rental;
}

export function RentalForm({ initialData }: RentalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const router = useRouter();
  const [existingImages, setExistingImages] = useState<Rental["images"]>(
    initialData?.images || []
  );

  const dropZoneConfig = {
    maxFiles: 5,
    maxSize: 1024 * 1024 * 4,
    multiple: true,
  };

  const form = useForm<RentalFormSchema>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      is_featured: initialData?.is_featured || false,
      project_type: initialData?.project_type || "",
      project_address: initialData?.project_address || "",
      zip_code: initialData?.zip_code || "",
      price: initialData?.price || 0,
      price_breakdown: initialData?.price_breakdown || "",
      project_description: initialData?.project_description || "",
      area_square_footage: initialData?.area_square_footage || 0,
      garage_spaces: initialData?.garage_spaces || 0,
      bedrooms: initialData?.bedrooms || 0,
      bathrooms: initialData?.bathrooms || 0,
      city: initialData?.city?.id?.toString() || "",
      availability: initialData?.availability || false,
      available_date: initialData?.available_date || "",
      uploaded_images: initialData?.images?.map((image) => image.image) || [],
      feature_ids: initialData?.features?.map((feature) => feature.id) || [],
    },
  });

  useEffect(() => {
    if (initialData?.city?.id) {
      form.setValue("city", initialData.city.id.toString());
    }
  }, [initialData, form]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citiesResponse, featuresResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cities/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/features/`),
        ]);

        const citiesData = await citiesResponse.json();
        const featuresData = await featuresResponse.json();

        setCities(citiesData.results);
        setFeatures(featuresData.results);
      } catch {
        showError("Failed to fetch form data");
      }
    };

    fetchData();
  }, []);

  const handleImageDelete = async (imageId: number) => {
    try {
      if (initialData) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/images/${imageId}/`,
          {
            method: "DELETE",
          }
        ).then((res) => {
          if (res.ok) {
            showSuccess("Image deleted successfully");
            setExistingImages((prev) =>
              prev.filter((img) => img.id !== imageId)
            );
          } else {
            showError("Failed to delete image");
          }
        });
      }
    } catch {
      showError("Failed to delete image");
    }
  };

  const onSubmit = async (values: RentalFormSchema) => {
    try {
      setIsLoading(true);
      console.log("Form values:", values);

      const formData = new FormData();

      // Append form fields
      Object.keys(values).forEach((key) => {
        const value = values[key as keyof typeof values];
        if (value !== undefined && value !== null && value !== "") {
          // Skip uploaded_images as we'll handle them separately
          if (key === "uploaded_images") return;

          // Handle feature_ids specially
          if (key === "feature_ids") {
            // Append each feature ID separately
            (value as number[]).forEach((featureId) => {
              formData.append("feature_ids", featureId.toString());
            });
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Handle file uploads
      if (files.length > 0) {
        files.forEach((file) => {
          formData.append("uploaded_images", file);
        });
      }

      // If there are existing images, append their IDs
      if (existingImages.length > 0) {
        formData.append(
          "existing_image_ids",
          JSON.stringify(existingImages.map((img) => img.id))
        );
      }

      // Log FormData contents for debugging
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const url = initialData
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${initialData.slug}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/projects/`;

      const response = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.message || "Failed to save rental");
      }

      showSuccess(`Rental ${initialData ? "updated" : "created"} successfully`);
      router.push("/admin/rentals");
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to save rental"
      );
      console.error("Error saving rental:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 sm:space-y-6 w-full px-3 sm:px-4 pb-6 sm:max-w-5xl sm:mx-auto"
      >
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-6">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter property name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_address"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Address*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter property address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zip_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter zip code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-6">
            Property Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price*</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bedrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bedrooms*</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Number of bedrooms"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bathrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bathrooms*</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Number of bathrooms"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="area_square_footage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area (sq ft)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter area" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="garage_spaces"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Garage Spaces</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Number of garage spaces"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-6">
            Availability
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Available Now</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="available_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-6">
            Description & Details
          </h2>
          <div className="space-y-3 sm:space-y-6">
            <FormField
              control={form.control}
              name="project_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">
                    Description
                  </FormLabel>
                  <FormControl>
                    <MinimalTiptapEditor
                      value={field.value}
                      onChange={field.onChange}
                      className="min-h-[150px] sm:min-h-[200px] bg-white dark:bg-gray-900"
                      editorContentClassName="p-3 sm:p-4"
                      output="html"
                      placeholder="Enter property description..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price_breakdown"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Breakdown</FormLabel>
                  <FormControl>
                    <MinimalTiptapEditor
                      value={field.value}
                      onChange={field.onChange}
                      className="min-h-[200px] bg-white dark:bg-gray-900"
                      editorContentClassName="p-4"
                      output="html"
                      placeholder="Enter price breakdown details..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-6">
            Property Images
          </h2>
          <FormField
            control={form.control}
            name="uploaded_images"
            render={() => (
              <FormItem>
                <div className="space-y-3 sm:space-y-4">
                  {existingImages.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {existingImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.image}
                            alt="Property"
                            className="w-full h-32 sm:h-36 lg:h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleImageDelete(image.id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <FileUploader
                    value={files}
                    onValueChange={(value) => setFiles(value || [])}
                    dropzoneOptions={dropZoneConfig}
                    className="relative bg-background rounded-lg p-2"
                  >
                    <FileInput
                      id="fileInput"
                      className="outline-dashed outline-1 outline-slate-500"
                    >
                      <div className="flex items-center justify-center flex-col p-4 sm:p-8 w-full">
                        <CloudUpload className="text-gray-500 w-8 h-8 sm:w-10 sm:h-10" />
                        <p className="mb-1 text-xs sm:text-sm text-gray-500 text-center">
                          <span className="font-semibold">Click to upload</span>
                          &nbsp; or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          SVG, PNG, JPG or GIF (max 4MB)
                        </p>
                      </div>
                    </FileInput>
                    <FileUploaderContent>
                      {files &&
                        files.length > 0 &&
                        files.map((file, i) => (
                          <FileUploaderItem key={i} index={i}>
                            <Paperclip className="h-4 w-4 stroke-current" />
                            <span>{file.name}</span>
                          </FileUploaderItem>
                        ))}
                    </FileUploaderContent>
                  </FileUploader>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-6">
            Features
          </h2>
          <FormField
            control={form.control}
            name="feature_ids"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                    >
                      <Checkbox
                        checked={field.value?.includes(feature.id)}
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          const newValue = checked
                            ? [...currentValue, feature.id]
                            : currentValue.filter((id) => id !== feature.id);
                          field.onChange(newValue);
                        }}
                      />
                      <label className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {feature.name}
                      </label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/rentals")}
            className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base"
          >
            {isLoading
              ? "Saving..."
              : initialData
              ? "Update Rental"
              : "Create Rental"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
