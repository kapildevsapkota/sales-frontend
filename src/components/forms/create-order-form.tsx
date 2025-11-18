"use client";

import type React from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { api } from "@/lib/api";
import { PaymentMethod } from "@/types/order";
import type { Product } from "@/types/product";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  UploadIcon,
  TrashIcon,
  TruckIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { AxiosError } from "axios";
import { Role, useAuth } from "@/contexts/AuthContext";

interface CreateOrderFormProps {
  products: Product[];
  oilTypes: string[];
  convincedByOptions: string[];
  orderId?: string;
  isEditMode?: boolean;
  onSuccess?: () => Promise<void> | void;
  disableNavigation?: boolean;
}

interface FileWithPreview extends File {
  preview?: string;
}

interface ProductInfo {
  inventory_id: number;
  product_id: number;
  name: string;
  quantity: number;
}

enum DeliveryType {
  Inside = "Inside valley",
  Outside = "Outside valley",
}

interface DuplicateOrderError {
  error: string;
  status: string | number;
  existing_order: {
    order_id: string;
    created_at: string;
    salesperson: {
      name: string;
      phone: string;
    };
    location: {
      franchise: string;
      distributor: string;
    };
    order_status: string;
  };
}

export default function CreateOrderForm({
  orderId,
  isEditMode = false,
  onSuccess,
  disableNavigation = false,
}: CreateOrderFormProps) {
  const [oilTypes, setOilTypes] = useState<ProductInfo[]>([]);
  const [oilTypesLoading, setOilTypesLoading] = useState(true);
  const [selectedOilTypes, setSelectedOilTypes] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: string }>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<FileWithPreview | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantityDialogOpen, setQuantityDialogOpen] = useState(false);
  const [quantityInputValue, setQuantityInputValue] = useState("");
  const [forceOrderDialogOpen, setForceOrderDialogOpen] = useState(false);
  const [forceOrderErrorMsg, setForceOrderErrorMsg] = useState("");
  const [duplicateOrderError, setDuplicateOrderError] =
    useState<DuplicateOrderError | null>(null);
  const [pendingForceOrderData, setPendingForceOrderData] =
    useState<OrderFormValues | null>(null);
  const { user } = useAuth();

  const router = useRouter();

  const orderSchema = z
    .object({
      full_name: z.string().min(2, "Name is required"),
      delivery_location: z.string().min(2, "Delivery location is required"),
      phone_number: z
        .string()
        .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
        .min(10, "Phone number must be exactly 10 digits"),
      alternate_phone_number: z.string().nullable().optional(),
      city: z.string().optional(),
      landmark: z.string().optional(),
      amount: z.number().min(0, "Amount must be at least 0"),
      delivery_charge: z
        .number({ invalid_type_error: "Delivery charge must be a number" })
        .min(0, "Delivery charge must be at least 0")
        .optional(),
      remarks: z.string().optional(),
      oil_type: z
        .array(z.string())
        .min(1, "Please select at least one oil type"),
      total_amount: z.number().min(0, "Total amount must be at least 0"),
      payment_method: z.nativeEnum(PaymentMethod),
      payment_screenshot: z.instanceof(File).optional(),
      prepaid_amount: z
        .number()
        .min(0, "Prepaid amount must be at least 0")
        .optional(),
      delivery_type: z.nativeEnum(DeliveryType),
      location: z.number().optional(),
    })
    .superRefine((data, ctx) => {
      if (
        data.payment_method !== PaymentMethod.OfficeVisit &&
        (typeof data.delivery_charge !== "number" ||
          Number.isNaN(data.delivery_charge))
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["delivery_charge"],
          message: "Delivery charge is required.",
        });
      }
    });

  type OrderFormValues = z.infer<typeof orderSchema>;

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      full_name: "",
      delivery_location: "",
      phone_number: "",
      delivery_charge: undefined,
      alternate_phone_number: "",
      city: "",
      landmark: "",
      remarks: "",
      oil_type: [],
      total_amount: undefined,
      amount: undefined,
      payment_method: PaymentMethod.CashOnDelivery,
      payment_screenshot: undefined,
      prepaid_amount: undefined,
      delivery_type: DeliveryType.Inside,
      location: undefined,
    },
  });

  const { setValue, watch } = form;
  const paymentMethod = watch("payment_method");
  const amount = watch("amount");
  const deliveryCharge = watch("delivery_charge");
  const prepaidAmount = watch("prepaid_amount");
  const totalAmount = watch("total_amount");

  // Calculate remaining amount
  const remainingAmount =
    typeof totalAmount === "number"
      ? totalAmount - (prepaidAmount || 0)
      : undefined;

  useEffect(() => {
    const fetchOilTypes = async () => {
      setOilTypesLoading(true);
      try {
        const authToken = localStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sales/products/`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const data = await response.json();
        console.log("Fetched Oil Types:", data); // Debug: Log fetched data
        setOilTypes(
          data.map(
            (product: {
              inventory_id: number;
              product_id: number;
              product_name: string;
              quantity: number;
            }) => ({
              inventory_id: product.inventory_id,
              product_id: product.product_id, // Ensure product_id is included
              name: product.product_name,
              quantity: product.quantity,
            })
          )
        );
      } catch (error) {
        console.error("Error fetching oil types:", error);
        setOilTypes([]);
      } finally {
        setOilTypesLoading(false);
      }
    };

    fetchOilTypes();
  }, []);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (isEditMode && orderId) {
        try {
          const authToken = localStorage.getItem("accessToken");
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/sales/orders/${orderId}/update`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          const data = await response.json();

          // Set form values from existing order with proper type conversion
          form.setValue("full_name", data.full_name);
          form.setValue("delivery_location", data.delivery_address);
          form.setValue("phone_number", data.phone_number);
          form.setValue(
            "alternate_phone_number",
            data.alternate_phone_number || ""
          );
          form.setValue("city", data.city || "");
          form.setValue("landmark", data.landmark || "");
          form.setValue(
            "amount",
            parseFloat(data.total_amount) - parseFloat(data.delivery_charge)
          );
          form.setValue("prepaid_amount", parseFloat(data.prepaid_amount));
          form.setValue("delivery_charge", parseFloat(data.delivery_charge));
          form.setValue("remarks", data.remarks || "");
          form.setValue("payment_method", data.payment_method);
          form.setValue("total_amount", parseFloat(data.total_amount));

          // ADD THIS LINE to fix the delivery_type issue:
          form.setValue("delivery_type", data.delivery_type as DeliveryType);

          // Set location if exists
          if (data.location) {
            form.setValue("location", data.location);
            // You might need to fetch and set the selected location details here
            // This depends on how your API returns the location data in the order details
          }

          // Set selected oil types and quantities
          const selectedTypes = data.order_products.map(
            (item: { product: { name: string } }) => item.product.name
          );
          setSelectedOilTypes(selectedTypes);
          form.setValue("oil_type", selectedTypes);

          const quantitiesMap: { [key: string]: string } = {};
          data.order_products.forEach(
            (item: { product: { name: string }; quantity: number }) => {
              quantitiesMap[item.product.name] = item.quantity.toString();
            }
          );
          setQuantities(quantitiesMap);

          // Set payment screenshot if exists
          if (data.payment_screenshot) {
            setPreviewImage(data.payment_screenshot);
          }
        } catch (error) {
          console.error("Error fetching order data:", error);
          toast.error("Failed to load order data");
        }
      }
    };

    fetchOrderData();
  }, [isEditMode, orderId, form]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
      setUploadedFile(fileWithPreview);
      setPreviewImage(fileWithPreview.preview);
      setValue("payment_screenshot", fileWithPreview);
    }
  };

  const removeFile = () => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
    setPreviewImage(null);
    setValue("payment_screenshot", undefined);
  };

  // Update total amount whenever amount, delivery charge, or payment method changes
  useEffect(() => {
    const hasAmount = typeof amount === "number" && !Number.isNaN(amount);
    const computedDeliveryCharge =
      paymentMethod === PaymentMethod.OfficeVisit
        ? 0
        : typeof deliveryCharge === "number" && !Number.isNaN(deliveryCharge)
        ? deliveryCharge
        : undefined;
    const hasDeliveryCharge =
      typeof computedDeliveryCharge === "number" &&
      !Number.isNaN(computedDeliveryCharge);

    if (!hasAmount && !hasDeliveryCharge) {
      setValue("total_amount", undefined as unknown as number);
      return;
    }

    const total = (amount || 0) + (computedDeliveryCharge || 0);
    setValue("total_amount", total);
  }, [amount, deliveryCharge, paymentMethod, setValue]);

  const onSubmit = async (data: OrderFormValues, forceOrder = false) => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("accessToken");

      // Construct the order_products array
      const orderProducts = selectedOilTypes
        .map((type) => {
          const quantity = quantities[type] || "0";
          const product = oilTypes.find((product) => product.name === type);
          if (!product) {
            throw new Error(`Product not found: ${type}`);
          }
          return {
            product_id: product.inventory_id,
            quantity: parseInt(quantity, 10),
          };
        })
        .filter(
          (product) => product.product_id !== null && product.quantity > 0
        );

      if (orderProducts.length === 0) {
        throw new Error(
          "At least one product with a valid quantity is required."
        );
      }

      // Create FormData instance
      const formData = new FormData();

      // Add all the fields to FormData
      formData.append("full_name", data.full_name);
      formData.append("city", data.city || "");
      formData.append("delivery_address", data.delivery_location);
      formData.append("landmark", data.landmark || "");
      formData.append("phone_number", data.phone_number.trim());
      formData.append(
        "alternate_phone_number",
        (data.alternate_phone_number || "").trim()
      );
      formData.append("payment_method", data.payment_method);
      formData.append("total_amount", data.total_amount.toString());
      formData.append("remarks", data.remarks || "");
      formData.append("order_products", JSON.stringify(orderProducts));
      const deliveryChargeToSend =
        data.payment_method === PaymentMethod.OfficeVisit
          ? 0
          : data.delivery_charge ?? 0;
      formData.append("delivery_charge", deliveryChargeToSend.toString());
      formData.append("delivery_type", data.delivery_type);
      formData.append(
        "prepaid_amount",
        data.payment_method === "Office Visit"
          ? data.total_amount.toString()
          : data.prepaid_amount?.toString() || "0"
      );

      // Add location if selected
      if (data.location) {
        formData.append("location", data.location.toString());
      }

      // Append payment screenshot if it exists
      if (uploadedFile) {
        formData.append("payment_screenshot", uploadedFile);
      }

      // Append force_order if needed
      if (forceOrder) {
        formData.append("force_order", "true");
      }

      let response;
      if (isEditMode && orderId) {
        // Send PATCH request for edit mode
        response = await api.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sales/orders/${orderId}/update/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Send POST request for create mode
        response = await api.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sales/orders/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(
          `Order ${isEditMode ? "updated" : "submitted"} successfully!`
        );
        form.reset();
        await onSuccess?.();
        if (!disableNavigation) {
          if (user?.role === Role.SalesPerson) {
            router.push("/sales/orders");
          } else {
            router.push("/admin/salesList");
          }
        }
      } else {
        throw new Error(`Failed to ${isEditMode ? "update" : "submit"} order`);
      }
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 403 || err.response?.status === 400) {
        // let errorMsg = "Order could not be placed.";
        let duplicateError: DuplicateOrderError | null = null;
        if (err.response.data) {
          if (
            typeof err.response.data === "object" &&
            err.response.data !== null &&
            "error" in err.response.data &&
            "existing_order" in err.response.data
          ) {
            duplicateError = err.response.data as DuplicateOrderError;
            // errorMsg = duplicateError.error;
          }
        }
        // setForceOrderErrorMsg(errorMsg);
        setDuplicateOrderError(duplicateError);
        setPendingForceOrderData(data);
        setForceOrderDialogOpen(true);
        return;
      }
      if (err.response?.data) {
        const errorResponse = err.response.data;
        if (Array.isArray(errorResponse) && errorResponse.length > 0) {
          toast.error(errorResponse[0]);
        } else if (
          typeof errorResponse === "object" &&
          errorResponse !== null &&
          "error" in errorResponse
        ) {
          toast.error(errorResponse.error as string);
        } else {
          toast.error(
            `An error occurred while ${
              isEditMode ? "updating" : "submitting"
            } the order.`
          );
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update the preventScroll function with correct type
  const preventScroll = (e: React.WheelEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleQuantityDialogToggle = (open: boolean) => {
    setQuantityDialogOpen(open);
    if (!open) {
      setSelectedProduct(null);
      setQuantityInputValue("");
    }
  };

  const handleOilTypeClick = (productName: string) => {
    setSelectedProduct(productName);
    setQuantityInputValue(quantities[productName] || "");
    handleQuantityDialogToggle(true);
  };

  const handleQuantityConfirm = () => {
    if (selectedProduct) {
      const nextQuantity = quantityInputValue || "0";
      setQuantities({
        ...quantities,
        [selectedProduct]: nextQuantity,
      });

      // Update selectedOilTypes if not already included
      if (!selectedOilTypes.includes(selectedProduct)) {
        const newSelectedTypes = [...selectedOilTypes, selectedProduct];
        setSelectedOilTypes(newSelectedTypes);
        form.setValue("oil_type", newSelectedTypes);
      }
    }
    handleQuantityDialogToggle(false);
  };

  // Add this wrapper for react-hook-form
  const handleFormSubmit = (data: OrderFormValues) => onSubmit(data);

  // Add a function to reset all dialog-related state
  const handleCloseForceOrderDialog = () => {
    setForceOrderDialogOpen(false);
    setForceOrderErrorMsg("");
    setDuplicateOrderError(null);
    setPendingForceOrderData(null);
  };

  return (
    <div className="container mx-auto max-w-4xl pt-4 sm:pt-6">
      {/* Header */}
      <div className="mb-8 text-left">
        <h1 className="text-2xl font-bold text-green-800">
          {isEditMode ? "Edit Order" : "Create Your Order Here"}
        </h1>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-6 pb-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-8 pb-8"
            >
              {/* Customer Information Section */}
              <div className="mb-8">
                <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-green-700">
                  Customer Information
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem className="form-floating">
                        <FormLabel className="text-sm font-medium">
                          Full Name <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter customer's full name"
                            className="h-[60px] px-3 py-6 border-gray-300 focus:border-green-500 focus-visible:ring-green-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem className="form-floating">
                        <FormLabel className="text-sm font-medium">
                          Phone Number{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <PhoneIcon
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                              size={16}
                            />
                            <Input
                              type="tel"
                              placeholder="Enter 10 digit phone number"
                              className="h-[60px] pl-10 border-gray-300 focus:border-green-500 focus-visible:ring-green-500"
                              maxLength={10}
                              {...field}
                              onPaste={(e) => {
                                e.preventDefault();
                                let value = e.clipboardData.getData("text");
                                // First, remove all non-digit characters (spaces, dashes, plus signs, etc.)
                                value = value.replace(/\D/g, "");
                                // Then, remove 977 prefix if present (Nepal country code)
                                if (value.startsWith("977")) {
                                  value = value.slice(3);
                                }
                                // Limit to 10 digits
                                value = value.slice(0, 10);
                                field.onChange(value);
                              }}
                              onChange={(e) => {
                                let value = e.target.value;
                                // First, remove all non-digit characters (spaces, dashes, plus signs, etc.)
                                value = value.replace(/\D/g, "");
                                // Then, remove 977 prefix if present (Nepal country code)
                                if (value.startsWith("977")) {
                                  value = value.slice(3);
                                }
                                // Limit to 10 digits
                                value = value.slice(0, 10);
                                field.onChange(value);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alternate_phone_number"
                    render={({ field }) => (
                      <FormItem className="form-floating">
                        <FormLabel className="text-sm font-medium">
                          Alternate Phone Number{" "}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <PhoneIcon
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                              size={16}
                            />
                            <Input
                              type="tel"
                              placeholder="Enter 10 digit phone number"
                              className="h-[60px] pl-10 border-gray-300 focus:border-green-500 focus-visible:ring-green-500"
                              maxLength={10}
                              {...field}
                              value={field.value || ""}
                              onPaste={(e) => {
                                e.preventDefault();
                                let value = e.clipboardData.getData("text");
                                // First, remove all non-digit characters (spaces, dashes, plus signs, etc.)
                                value = value.replace(/\D/g, "");
                                // Then, remove 977 prefix if present (Nepal country code)
                                if (value.startsWith("977")) {
                                  value = value.slice(3);
                                }
                                // Limit to 10 digits
                                value = value.slice(0, 10);
                                field.onChange(value || null);
                              }}
                              onChange={(e) => {
                                let value = e.target.value;
                                // First, remove all non-digit characters (spaces, dashes, plus signs, etc.)
                                value = value.replace(/\D/g, "");
                                // Then, remove 977 prefix if present (Nepal country code)
                                if (value.startsWith("977")) {
                                  value = value.slice(3);
                                }
                                // Limit to 10 digits
                                value = value.slice(0, 10);
                                field.onChange(value || null);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="delivery_location"
                    render={({ field }) => (
                      <FormItem className="form-floating">
                        <FormLabel className="text-sm font-medium">
                          Delivery Location{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPinIcon
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                              size={16}
                            />
                            <Input
                              placeholder="Enter delivery address"
                              className="h-[60px] pl-10 border-gray-300 focus:border-green-500 focus-visible:ring-green-500"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="form-floating">
                        <FormLabel className="text-sm font-medium">
                          City
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter city"
                            className="h-[60px] px-3 py-6 border-gray-300 focus:border-green-500 focus-visible:ring-green-500"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="landmark"
                    render={({ field }) => (
                      <FormItem className="form-floating">
                        <FormLabel className="text-sm font-medium">
                          Landmark
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter landmark"
                            className="h-[60px] px-3 py-6 border-gray-300 focus:border-green-500 focus-visible:ring-green-500"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Product Selection Section */}
              <div className="mb-8">
                <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-green-700">
                  Product Selection
                </h2>

                <FormField
                  control={form.control}
                  name="oil_type"
                  render={() => (
                    <FormItem className="mb-6">
                      <FormLabel className="text-sm font-medium flex items-center">
                        Oil Type <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        {oilTypesLoading ? (
                          <div className="p-4 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-600 text-center">
                            Loading available products...
                          </div>
                        ) : oilTypes.length === 0 ? (
                          <div className="p-4 rounded-md border border-yellow-200 bg-yellow-50 text-yellow-800 space-y-3">
                            <p className="text-sm font-medium">
                              No inventory items available. Add products to
                              inventory before creating an order.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                            {oilTypes.map((product) => (
                              <div
                                key={product.name}
                                onClick={() => handleOilTypeClick(product.name)}
                                className={`flex items-center p-3 rounded-md cursor-pointer transition-colors
                                ${
                                  selectedOilTypes.includes(product.name)
                                    ? "bg-green-50 border border-green-200"
                                    : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedOilTypes.includes(
                                    product.name
                                  )}
                                  className="mr-3 h-8 w-4 text-green-600 focus:ring-green-500"
                                  onChange={() => {}} // Handled by parent div click
                                />
                                <span className="text-sm">{product.name}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  ({product.quantity} available)
                                </span>
                                {selectedOilTypes.includes(product.name) && (
                                  <span className="ml-auto text-sm font-medium text-green-600">
                                    Qty: {quantities[product.name] || 0}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                {/* Clear Selection Button */}
                <div className="flex justify-end mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-[45px] text-gray-600 border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      setSelectedOilTypes([]); // Clear selected oil types
                      setQuantities({}); // Clear quantities
                      form.setValue("oil_type", []); // Reset form value
                    }}
                  >
                    Clear Selection
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Amount
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="h-[60px] pl-8 border-gray-300 focus:border-green-500 focus-visible:ring-green-500 font-medium text-right"
                            {...field}
                            value={
                              typeof field.value === "number" ? field.value : ""
                            }
                            onWheelCapture={preventScroll}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? undefined : parseFloat(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="delivery_charge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Delivery Charge
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="h-[60px] pl-8 border-gray-300 focus:border-green-500 focus-visible:ring-green-500 font-medium text-right"
                            {...field}
                            value={
                              paymentMethod === PaymentMethod.OfficeVisit
                                ? 0
                                : typeof field.value === "number"
                                ? field.value
                                : ""
                            }
                            disabled={
                              paymentMethod === PaymentMethod.OfficeVisit
                            }
                            onWheelCapture={preventScroll}
                            onChange={(e) => {
                              if (paymentMethod === PaymentMethod.OfficeVisit) {
                                return;
                              }
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? undefined : parseFloat(value)
                              );
                            }}
                          />
                        </FormControl>
                        {paymentMethod === PaymentMethod.OfficeVisit && (
                          <p className="text-xs text-gray-500 mt-1">
                            Delivery charge is automatically set to 0 for Office
                            Visit payments.
                          </p>
                        )}
                        <FormMessage className="text-red-500 text-xs mt-1" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="total_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center mt-3">
                        Total Amount{" "}
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            $
                          </div>
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="h-[60px] pl-8 border-gray-300 focus:border-green-500 focus-visible:ring-green-500 font-medium text-right"
                            {...field}
                            value={
                              typeof field.value === "number" ? field.value : ""
                            }
                            onWheelCapture={preventScroll}
                            disabled
                          />
                        </div>
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">
                        Total = Amount + Delivery Charge
                      </p>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Information Section */}
              <div className="mb-8">
                <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-green-700">
                  Additional Information
                </h2>

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormControl>
                        <Textarea
                          placeholder="Add any special instructions or notes here"
                          className="min-h-[120px] border-gray-300 focus:border-green-500 focus-visible:ring-green-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* inside or outside delivery */}
              <div className="mb-8">
                <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-green-700">
                  Inside or Outside Delivery
                </h2>
                <FormField
                  control={form.control}
                  name="delivery_type"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="text-sm font-medium flex items-center">
                        Delivery Type{" "}
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                          {Object.values(DeliveryType).map((type) => (
                            <label
                              key={type}
                              className={`flex items-center p-4 rounded-md cursor-pointer transition-colors border
                                ${
                                  field.value === type
                                    ? "bg-green-50 border-green-200 ring-2 ring-green-200"
                                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                }`}
                            >
                              <input
                                type="radio"
                                value={type}
                                checked={field.value === type}
                                onChange={() => field.onChange(type)}
                                className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500"
                              />
                              <div className="flex items-center">
                                <TruckIcon
                                  size={18}
                                  className="mr-2 text-gray-600"
                                />
                                <span className="text-sm font-medium">
                                  {type}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Payment Information Section */}
              <div className="mb-8">
                <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-green-700">
                  Payment Information
                </h2>

                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel className="text-sm font-medium flex items-center">
                        Payment Method{" "}
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                          {Object.values(PaymentMethod).map((method) => (
                            <label
                              key={method}
                              className={`flex items-center p-4 rounded-md cursor-pointer transition-colors border
                  ${
                    field.value === method
                      ? "bg-green-50 border-green-200 ring-2 ring-green-200"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                            >
                              <input
                                type="radio"
                                value={method}
                                checked={field.value === method}
                                onChange={() => field.onChange(method)}
                                className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500"
                              />
                              <div className="flex items-center">
                                <CreditCardIcon
                                  size={18}
                                  className="mr-2 text-gray-600"
                                />
                                <span className="text-sm font-medium">
                                  {method}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                {(paymentMethod === PaymentMethod.Prepaid ||
                  paymentMethod === PaymentMethod.Indrive ||
                  paymentMethod === PaymentMethod.OfficeVisit) && (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="prepaid_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            {paymentMethod === PaymentMethod.Prepaid
                              ? "Prepaid Amount"
                              : paymentMethod === PaymentMethod.Indrive
                              ? "Indrive Amount"
                              : "Office Visit Amount"}{" "}
                            <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                $
                              </div>
                              <Input
                                type="number"
                                placeholder="0.00"
                                className="h-[60px] pl-8 border-gray-300 focus:border-green-500 focus-visible:ring-green-500 font-medium text-right"
                                required={true}
                                {...field}
                                value={
                                  typeof field.value === "number"
                                    ? field.value
                                    : ""
                                }
                                onWheelCapture={preventScroll}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(
                                    value === "" ? undefined : parseFloat(value)
                                  );
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs mt-1" />
                        </FormItem>
                      )}
                    />

                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Remaining Amount
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            $
                          </div>
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="h-[60px] pl-8 border-gray-300 focus:border-green-500 focus-visible:ring-green-500 font-medium text-right"
                            disabled
                            value={
                              typeof remainingAmount === "number"
                                ? remainingAmount
                                : ""
                            }
                          />
                        </div>
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">
                        Remaining = Total Amount -{" "}
                        {paymentMethod === PaymentMethod.Prepaid
                          ? "Prepaid"
                          : "Indrive"}{" "}
                        Amount
                      </p>
                    </FormItem>
                  </div>
                )}

                {/* Payment Screenshot Upload */}
                {paymentMethod !== PaymentMethod.CashOnDelivery && (
                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="payment_screenshot"
                      render={({}) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Payment Screenshot
                          </FormLabel>
                          <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 px-6 pt-5 pb-6">
                            {!previewImage ? (
                              <div className="space-y-1 text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                  <label className="relative cursor-pointer rounded-md bg-white font-medium text-green-600 hover:text-green-500">
                                    <span>Upload a file</span>
                                    <input
                                      id="file-upload"
                                      type="file"
                                      className="sr-only"
                                      required={true}
                                      onChange={handleFileUpload}
                                    />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG, GIF up to 10MB
                                </p>
                              </div>
                            ) : (
                              <div className="relative">
                                <Image
                                  src={previewImage}
                                  width={100}
                                  height={100}
                                  alt="Payment Screenshot"
                                  className="h-32 rounded border object-contain"
                                />
                                <Button
                                  type="button"
                                  onClick={removeFile}
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                >
                                  <TrashIcon size={14} />
                                </Button>
                              </div>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Sticky Submit Actions */}
              <div className="sticky bottom-0 left-0 right-0 -mx-6 -mb-6 flex items-center justify-end gap-4 border-t border-gray-200 bg-white px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-[45px] text-gray-600 border-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    form.reset();
                    setSelectedOilTypes([]);
                    setQuantities({});
                  }}
                >
                  Clear Form
                </Button>
                <Button
                  type="submit"
                  className="h-[45px] bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    "Submit Order"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Dialog
        open={quantityDialogOpen}
        onOpenChange={handleQuantityDialogToggle}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Quantity</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="Enter quantity"
                value={quantityInputValue}
                onChange={(e) => setQuantityInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleQuantityConfirm();
                  }
                }}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleQuantityDialogToggle(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleQuantityConfirm}>
              Save Quantity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={forceOrderDialogOpen}
        onOpenChange={setForceOrderDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Order Detected</DialogTitle>
            <DialogDescription>
              {duplicateOrderError
                ? duplicateOrderError.error
                : forceOrderErrorMsg}
            </DialogDescription>
            {duplicateOrderError && (
              <div className="space-y-2 text-left mt-2">
                <div className="border rounded p-3 bg-gray-50">
                  <div>
                    <span className="font-medium">Order ID:</span>{" "}
                    {duplicateOrderError.existing_order.order_id}
                  </div>
                  <div>
                    <span className="font-medium">Created At:</span>{" "}
                    {new Date(
                      duplicateOrderError.existing_order.created_at
                    ).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Salesperson:</span>{" "}
                    {duplicateOrderError.existing_order.salesperson.name} (
                    <a
                      href={`tel:${duplicateOrderError.existing_order.salesperson.phone}`}
                      className="text-blue-600 underline"
                    >
                      {duplicateOrderError.existing_order.salesperson.phone}
                    </a>
                    )
                  </div>
                  <div>
                    <span className="font-medium">Franchise:</span>{" "}
                    {duplicateOrderError.existing_order.location.franchise}
                  </div>
                  <div>
                    <span className="font-medium">Order Status:</span>{" "}
                    {duplicateOrderError.existing_order.order_status}
                  </div>
                </div>
              </div>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseForceOrderDialog}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setForceOrderDialogOpen(false);
                if (pendingForceOrderData) {
                  await onSubmit(pendingForceOrderData, true);
                }
                handleCloseForceOrderDialog();
              }}
              disabled={loading}
              className="h-[45px] bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              Force Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
