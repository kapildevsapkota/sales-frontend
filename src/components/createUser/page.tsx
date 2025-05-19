"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Role } from "@/contexts/AuthContext";

interface Distributor {
  id: number;
  name: string;
  short_form: string;
}

interface Franchise {
  id: number;
  name: string;
  short_form: string | null;
  distributor: number;
}

interface Factory {
  id: number;
  name: string;
  short_form: string | null;
}

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  role: z.enum(
    [
      "SuperAdmin",
      "Distributor",
      "Franchise",
      "SalesPerson",
      "Others",
      "Logistic",
      "Treatment Staff",
      "Packaging",
    ],
    {
      required_error: "Role is required",
    }
  ),
  distributor: z.number().nullable(),
  franchise: z.number().nullable(),
  password: z.string().optional(),
  factory: z.number().nullable(),
});

export type CreateUserFormData = z.infer<typeof formSchema>;

interface CreateAccountFormProps {
  initialValues?: CreateUserFormData;
  isEditMode?: boolean;
}

// Helper to clean form data based on role
function cleanFormData(values: z.infer<typeof formSchema>) {
  const cleaned = { ...values };
  const role = values.role;

  // Remove fields not relevant for the selected role
  if (role === Role.SuperAdmin) {
    // All fields relevant
  } else if (role === Role.Distributor) {
    cleaned.factory = null;
    cleaned.distributor = null;
  } else if (role === Role.Franchise) {
    cleaned.factory = null;
    cleaned.distributor = null;
    cleaned.franchise = null;
  } else {
    cleaned.factory = null;
    cleaned.distributor = null;
    cleaned.franchise = null;
  }
  return cleaned;
}

export default function CreateAccountForm({
  initialValues,
  isEditMode = false,
}: CreateAccountFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      role: undefined,
      distributor: null,
      franchise: null,
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      address: "",
      password: "",
      factory: null,
    },
  });

  useEffect(() => {
    if (isEditMode && initialValues) {
      form.reset(initialValues);
    }
  }, [isEditMode, initialValues, form]);

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/account/distributors/`
        );
        const data = await response.json();
        setDistributors(data);
      } catch (error) {
        console.error("Error fetching distributors:", error);
      }
    };
    fetchDistributors();
  }, []);

  const fetchFranchises = async (distributorId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/account/distributors/${distributorId}/franchises/`
      );
      const data = await response.json();
      setFranchises(data);
    } catch (error) {
      console.error("Error fetching franchises:", error);
    }
  };

  useEffect(() => {
    const fetchFactories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/account/factories/`
        );
        const data = await response.json();
        setFactories(data);
      } catch (error) {
        console.error("Error fetching factories:", error);
      }
    };
    fetchFactories();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      if (
        !values.phone_number ||
        !values.address ||
        !values.role ||
        (!isEditMode && !values.password)
      ) {
        console.error("Missing required fields:", { values });
        throw new Error("Please fill in all required fields");
      }

      // Clean the form data before sending
      const cleanedValues = cleanFormData(values);

      // Filter out null or undefined fields
      const formData = Object.fromEntries(
        Object.entries({
          first_name: cleanedValues.first_name,
          last_name: cleanedValues.last_name,
          email: cleanedValues.email,
          phone_number: cleanedValues.phone_number,
          address: cleanedValues.address,
          role: cleanedValues.role,
          distributor: cleanedValues.distributor,
          franchise: cleanedValues.franchise,
          password: cleanedValues.password,
          factory: cleanedValues.factory,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }).filter(([_, v]) => v !== null && v !== undefined)
      );

      const token = localStorage.getItem("accessToken"); // Retrieve the token from local storage

      let response;
      if (isEditMode) {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/account/users/${initialValues?.phone_number}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Add the token to the Authorization header
            },
            credentials: "include",
            body: JSON.stringify(formData),
          }
        );
      } else {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/account/users/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Add the token to the Authorization header
            },

            credentials: "include",
            body: JSON.stringify(formData),
          }
        );
      }
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof responseData === "object"
            ? JSON.stringify(responseData)
            : "Failed to create user"
        );
      }

      toast({
        title: "Success",
        description: "User account created successfully!",
        variant: "default",
      });

      router.push("/admin/usermanagement");
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleOptions = () => {
    if (!user) return [];

    switch (user.role) {
      case Role.SuperAdmin:
        return [Role.Distributor, Role.Franchise, Role.Logistic];
      case Role.Franchise:
        return [Role.SalesPerson, Role.TreatmentStaff, Role.Packaging];
      case Role.Distributor:
        return [Role.Franchise];
      default:
        return [];
    }
  };

  const showFieldsByRole = (selectedRole: string | undefined) => {
    if (!selectedRole)
      return {
        showFactory: false,
        showDistributor: false,
        showFranchise: false,
      };

    switch (selectedRole) {
      case Role.SuperAdmin:
        return {
          showFactory: true,
          showDistributor: true,
          showFranchise: true,
        };
      case Role.Distributor:
        return {
          showFactory: false,
          showDistributor: false,
          showFranchise: true,
        };
      default:
        return {
          showFactory: false,
          showDistributor: false,
          showFranchise: false,
        };
    }
  };

  return (
    <div className="flex justify-center w-full bg-gray-50 py-8">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg border border-gray-200 bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <CardTitle className="flex items-center gap-3 text-2xl md:text-3xl font-bold text-white">
              <UserPlus className="w-7 h-7" />
              Create New Account
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                    <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            First Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter first name"
                              {...field}
                              className="h-11 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter last name"
                              {...field}
                              className="h-11 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="email@example.com"
                              {...field}
                              className="h-11 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+977 9812345678"
                              {...field}
                              className="h-11 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Address
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter full address"
                            {...field}
                            className="min-h-24 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm resize-none"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Account Settings Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                    <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Account Settings
                    </h3>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Role
                          </FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue("distributor", null);
                              form.setValue("franchise", null);
                              form.setValue("factory", null);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="shadow-lg border-gray-200">
                              {getRoleOptions().map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    {!isEditMode && (
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter password"
                                {...field}
                                className="h-11 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                              />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    )}
                    {showFieldsByRole(form.watch("role")).showFactory && (
                      <FormField
                        control={form.control}
                        name="factory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Factory
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(Number(value));
                              }}
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                  <SelectValue placeholder="Select a factory" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="shadow-lg border-gray-200">
                                {factories.map((factory) => (
                                  <SelectItem
                                    key={factory.id}
                                    value={factory.id.toString()}
                                  >
                                    {factory.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    )}
                    {showFieldsByRole(form.watch("role")).showDistributor && (
                      <FormField
                        control={form.control}
                        name="distributor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Distributor
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                const numValue = Number(value);
                                field.onChange(numValue);
                                fetchFranchises(numValue);
                                form.setValue("franchise", null);
                                form.setValue("factory", null);
                              }}
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                  <SelectValue placeholder="Select a distributor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="shadow-lg border-gray-200">
                                {distributors.map((distributor) => (
                                  <SelectItem
                                    key={distributor.id}
                                    value={distributor.id.toString()}
                                  >
                                    {distributor.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    )}
                    {showFieldsByRole(form.watch("role")).showFranchise && (
                      <FormField
                        control={form.control}
                        name="franchise"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Franchise
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(Number(value));
                              }}
                              value={field.value?.toString()}
                              disabled={!form.watch("distributor")}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                  <SelectValue placeholder="Select a franchise" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="shadow-lg border-gray-200">
                                {franchises.map((franchise) => (
                                  <SelectItem
                                    key={franchise.id}
                                    value={franchise.id.toString()}
                                  >
                                    {franchise.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <Button
                    type="submit"
                    className="px-10 py-3 h-12 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 transition-colors text-white shadow-md hover:shadow-lg text-base focus:ring-4 focus:ring-blue-200"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
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
                      </span>
                    ) : isEditMode ? (
                      "Update Account"
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
