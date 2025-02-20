/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { PaymentMethod } from "@/types/order";
import { Product } from "@/types/product";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import { Package, MapPin, CreditCard, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Textarea } from "../ui/textarea";

interface CreateOrderFormProps {
  products: Product[];
}

interface FileWithPreview extends File {
  preview?: string;
}

export default function CreateOrderForm({ products }: CreateOrderFormProps) {
  const [step, setStep] = useState(1);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<FileWithPreview | null>(
    null
  );

  const router = useRouter();

  const orderSchema = z.object({
    full_name: z.string().min(2, "Name is required"),
    city: z.string().min(2, "City is required"),
    delivery_address: z.string().min(2, "Delivery address is required"),
    landmark: z.string().optional(),
    phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
    alternate_phone_number: z.string().optional(),
    delivery_charge: z.string().min(0),
    payment_method: z.nativeEnum(PaymentMethod),
    payment_screenshot: z.instanceof(File).optional(),
    remarks: z.string().optional(),
    order_products: z
      .array(
        z.object({
          product: z.number(),
          quantity: z.number().min(0),
          discount: z.number().min(0),
        })
      )
      .refine((data) => data.some((op) => op.quantity > 0), {
        message: "At least one product must be selected",
        path: ["order_products"],
      })
      .refine(
        (data) => {
          return data.every((op) => {
            const product = products.find((p) => p.id === op.product);
            if (!product || op.quantity === 0) return true;
            const subtotal = product.price * op.quantity;
            return op.discount <= subtotal;
          });
        },
        {
          message: "Discount cannot exceed the subtotal amount",
          path: ["order_products"],
        }
      ),
  });

  type OrderFormValues = z.infer<typeof orderSchema>;

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      full_name: "",
      city: "",
      delivery_address: "",
      landmark: "",
      phone_number: "",
      alternate_phone_number: "",
      delivery_charge: "0",
      payment_method: PaymentMethod.CashOnDelivery,
      payment_screenshot: undefined,
      remarks: "",
      order_products: products.map((product) => ({
        product: product.id,
        quantity: 0,
        discount: 0,
      })),
    },
  });

  const { setValue, watch } = form;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
      setUploadedFile(fileWithPreview);
      setPreviewImage(fileWithPreview.preview);
      setValue("payment_screenshot", file);
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

  const onSubmit: SubmitHandler<OrderFormValues> = async (data) => {
    const orderProductsData = data.order_products
      .filter((op) => op.quantity > 0)
      .map((op) => ({
        product_id: op.product,
        quantity: op.quantity,
        discount: op.discount,
      }));

    try {
      const requestData = {
        full_name: data.full_name,
        city: data.city,
        delivery_address: data.delivery_address,
        landmark: data.landmark,
        phone_number: data.phone_number,
        alternate_phone_number: data.alternate_phone_number,
        delivery_charge: data.delivery_charge,
        payment_method: data.payment_method,
        remarks: data.remarks,
        order_products: orderProductsData,
      };

      await api.post(
        `${process.env.NEXT_PUBLIC_API_URL}api/sales/orders/`,
        requestData
      );
      form.reset();
      router.push("/sales/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  const nextStep = async () => {
    let isStepValid = false;

    switch (step) {
      case 1:
        isStepValid = await form.trigger([
          "full_name",
          "delivery_address",
          "phone_number",
          "alternate_phone_number",
          "landmark",
          "city",
        ]);
        break;
      case 2:
        isStepValid = await form.trigger("order_products");
        break;
      case 3:
        isStepValid = await form.trigger([
          "delivery_charge",
          "payment_method",
          "payment_screenshot",
          "remarks",
        ]);
        break;
      default:
        isStepValid = true;
    }

    if (isStepValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const incrementQuantity = (productId: number) => {
    const orderProducts = watch("order_products");
    const productIndex = orderProducts.findIndex(
      (op) => op.product === productId
    );
    if (productIndex !== -1) {
      setValue(
        `order_products.${productIndex}.quantity`,
        orderProducts[productIndex].quantity + 1
      );
    }
  };

  const decrementQuantity = (productId: number) => {
    const orderProducts = watch("order_products");
    const productIndex = orderProducts.findIndex(
      (op) => op.product === productId
    );
    if (productIndex !== -1 && orderProducts[productIndex].quantity > 0) {
      setValue(
        `order_products.${productIndex}.quantity`,
        orderProducts[productIndex].quantity - 1
      );
    }
  };

  const totalPrice = watch("order_products").reduce((acc, curr) => {
    const product = products.find((p) => p.id === curr.product)!;
    return acc + (product.price * curr.quantity - curr.discount);
  }, 0);

  const renderProductCard = (product: Product) => {
    const orderProduct = watch("order_products").find(
      (op) => op.product === product.id
    );
    const quantity = orderProduct?.quantity || 0;
    const discount = orderProduct?.discount || 0;
    const subtotal = product.price * quantity;
    const totalPrice = subtotal - discount;

    return (
      <div
        key={product.id}
        className="bg-white rounded-xl shadow-md transition-all duration-200 hover:shadow-lg border border-gray-100 overflow-hidden"
      >
        {/* Product Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="font-semibold text-lg text-gray-800 mb-1">
            {product.name}
          </h3>
          <p className="text-indigo-600 font-medium">Rs. {product.price}</p>
        </div>

        {/* Product Controls */}
        <div className="p-4 space-y-4">
          {/* Quantity Controls */}
          <div className="flex items-center justify-center gap-3 bg-gray-50 rounded-full px-4 py-2">
            <button
              type="button"
              onClick={() => decrementQuantity(product.id)}
              className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
              disabled={quantity === 0}
            >
              <span className="sr-only">Decrease</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>

            <span className="w-12 text-center font-medium text-gray-700">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => incrementQuantity(product.id)}
              className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
            >
              <span className="sr-only">Increase</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>

          {/* Discount Input */}
          {quantity > 0 && (
            <FormField
              control={form.control}
              name={`order_products.${form
                .getValues("order_products")
                .findIndex((op) => op.product === product.id)}.discount`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-600">
                    Discount Amount (Rs.)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={subtotal}
                      placeholder="Enter discount amount"
                      {...field}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 0 && value <= subtotal) {
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Price Summary */}
          {quantity > 0 && (
            <div className="space-y-1 pt-2 border-t">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal:</span>
                <span>Rs. {subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount:</span>
                  <span>- Rs. {discount}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-indigo-600">
                <span>Total:</span>
                <span>Rs. {totalPrice}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
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
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delivery_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter delivery address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="landmark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Landmark</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter landmark" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alternate_phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternate Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter alternate phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={nextStep}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Next Step
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Select Products
              </h2>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-indigo-600">
                  Rs. {totalPrice}
                </p>
              </div>
            </div>

            {form.formState.errors.order_products && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Required</AlertTitle>
                <AlertDescription>
                  Please select at least one product
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(renderProductCard)}
            </div>

            <div className="flex justify-between pt-6 border-t">
              <Button
                onClick={prevStep}
                variant="outline"
                className="flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </Button>
              <Button
                onClick={nextStep}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Next Step
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <>
            <FormField
              control={form.control}
              name="delivery_charge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Charge</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PaymentMethod).map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_screenshot"
              render={({}) => (
                <FormItem>
                  <FormLabel>Payment Screenshot</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                      {previewImage && (
                        <div className="relative w-full max-w-md">
                          <img
                            src={previewImage}
                            alt="Payment Screenshot"
                            className="rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={removeFile}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="h-24"
                      placeholder="Enter remarks"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between pt-6 border-t">
              <Button
                onClick={prevStep}
                variant="outline"
                className="flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </Button>
              <Button
                onClick={nextStep}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Next Step
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </div>
          </>
        );
      case 4:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-800">
              Order Review
            </h2>
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              {/* Customer Information Section */}
              <div className="border-b border-gray-100">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Customer Information
                    </h3>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">
                      {form.getValues("full_name") || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium text-gray-900">
                      {form.getValues("city") || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="font-medium text-gray-900">
                      {form.getValues("delivery_address") || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Landmark</p>
                    <p className="font-medium text-gray-900">
                      {form.getValues("landmark") || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900">
                      {form.getValues("phone_number") || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Alternate Phone</p>
                    <p className="font-medium text-gray-900">
                      {form.getValues("alternate_phone_number") || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Products Section */}
              <div className="border-b border-gray-100">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Order Products
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {form.getValues("order_products").map((op) => {
                      const product = products.find((p) => p.id === op.product);
                      if (!op.quantity || op.quantity === 0) return null;

                      return (
                        <div
                          key={op.product}
                          className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                        >
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900">
                              {product?.name}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Quantity: {op.quantity}</span>
                              {op.discount > 0 && (
                                <span className="text-red-500">
                                  Discount: Rs. {op.discount}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              Rs. {product!.price * op.quantity - op.discount}
                            </p>
                            {op.discount > 0 && (
                              <p className="text-sm text-gray-500 line-through">
                                Rs. {product!.price * op.quantity}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <p className="font-medium text-gray-700">
                        Delivery Charge
                      </p>
                      <p className="font-medium text-gray-900">
                        Rs. {form.getValues("delivery_charge")}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <p className="text-lg font-semibold text-gray-900">
                        Total Amount
                      </p>
                      <p className="text-lg font-semibold text-indigo-600">
                        Rs.{" "}
                        {totalPrice + Number(form.getValues("delivery_charge"))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details Section */}
              <div className="border-b border-gray-100">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Payment Details
                    </h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium text-gray-900">
                      {form.getValues("payment_method")}
                    </p>
                  </div>
                  {previewImage && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        Payment Screenshot
                      </p>
                      <img
                        src={previewImage}
                        alt="Payment Screenshot"
                        className="w-full max-w-md rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information Section */}
              {form.getValues("remarks") && (
                <div>
                  <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center space-x-3">
                      <svg
                        className="w-5 h-5 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Additional Information
                      </h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Remarks</p>
                      <p className="font-medium text-gray-900">
                        {form.getValues("remarks")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                onClick={prevStep}
                variant="outline"
                className="flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Payment
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center"
              >
                Confirm Order
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Progress Indicator */}
          <div className="bg-white rounded-lg shadow-sm mb-8 overflow-x-auto">
            <div className="min-w-max">
              <div className="flex p-4 space-x-4 sm:space-x-8">
                {[
                  { icon: Package, label: "Customer Info", step: 1 },
                  { icon: MapPin, label: "Products", step: 2 },
                  { icon: CreditCard, label: "Payment", step: 3 },
                ].map(({ icon: Icon, label, step: stepNum }) => (
                  <div
                    key={stepNum}
                    className={`flex items-center ${
                      stepNum < step
                        ? "text-indigo-600"
                        : stepNum === step
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        stepNum <= step
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="ml-3 font-medium hidden sm:block">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            {renderStep()}
          </div>
        </form>
      </Form>
    </>
  );
}
