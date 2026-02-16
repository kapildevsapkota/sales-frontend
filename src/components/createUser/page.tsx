"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, Eye, EyeOff } from "lucide-react";
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

// Removed Distributor interface

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
interface SuperAdmin {
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
      "Franchise",
      "SalesPerson",
      "Packaging",
    ],
    {
      required_error: "Role is required",
    }
  ),
  distributor: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return null;
      const parsed = Number(val);
      return isNaN(parsed) ? null : parsed;
    },
    z.number().nullable()
  ),
  franchise: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return null;
      const parsed = Number(val);
      return isNaN(parsed) ? null : parsed;
    },
    z.number().nullable()
  ),
  password: z.string().optional(),
  factory: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return null;
      const parsed = Number(val);
      return isNaN(parsed) ? null : parsed;
    },
    z.number().nullable()
  ),
});

export type CreateUserFormData = z.infer<typeof formSchema>;


interface CreateAccountFormProps {
  initialValues?: CreateUserFormData;
  isEditMode?: boolean;
  userId?: string;
}

// Helper to clean form data based on role
function cleanFormData(values: z.infer<typeof formSchema>) {
  const cleaned = { ...values };
  const role = values.role;

  // Remove fields not relevant for the selected role
  if (role === Role.SuperAdmin) {
    cleaned.distributor = null;
    cleaned.franchise = null;
    cleaned.factory = null;
  } else {
    cleaned.distributor = null;
    // Keep franchise for SalesPerson, Franchise, Packaging
    // factory is not used anymore based on latest reqs
    cleaned.factory = null;
  }
  return cleaned;
}

export default function CreateAccountForm({
  initialValues,
  isEditMode = false,
  userId,
}: CreateAccountFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [showPassword, setShowPassword] = useState(false);

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
  // Token retrieval will be moved to where it's used to be SSR-safe

  useEffect(() => {
    if (isEditMode && initialValues) {
      form.reset(initialValues);
    }
  }, [isEditMode, initialValues, form]);

  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        const currentToken = localStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/account/my-franchises/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken}`,
            },
          }
        );
        const data = await response.json();
        // Ensure franchises is always an array to prevent .map() from failing
        const franchisesList = Array.isArray(data) ? data : (data.results && Array.isArray(data.results) ? data.results : []);
        setFranchises(franchisesList);
      } catch (error) {
        console.error("Error fetching franchises:", error);
      }
    };
    fetchFranchises();
  }, []);

  // Map franchise name to ID in edit mode when franchises list is loaded
  useEffect(() => {
    if (isEditMode && franchises.length > 0) {
      const currentFranchise = form.getValues("franchise");
      // Use type assertion to handle the runtime case where the field might hold a string from the API
      if (typeof (currentFranchise as unknown) === "string") {
        const franchiseName = (currentFranchise as unknown) as string;
        const foundFranchise = franchises.find(
          (f) => f.name.toLowerCase() === franchiseName.toLowerCase()
        );
        if (foundFranchise) {
          form.setValue("franchise", foundFranchise.id);
        }
      }
    }
  }, [isEditMode, franchises, form]);

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
          franchise: user?.role === Role.Franchise ? user.franchise_id : cleanedValues.franchise,
          password: isEditMode ? undefined : cleanedValues.password,
          factory: cleanedValues.factory,
        }).filter(([_, v]) => v !== null && v !== undefined && v !== "")
      );


      const currentToken = localStorage.getItem("accessToken");

      let response;
      if (isEditMode) {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/account/users/${userId}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken}`, // Add the token to the Authorization header
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
              Authorization: `Bearer ${currentToken}`, // Add the token to the Authorization header
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

      if (user?.role === Role.SuperAdmin) {
        router.push("/super-admin/usermanagement");
      } else {
        router.push("/admin/usermanagement");
      }
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

    let options: string[] = [];
    switch (user.role) {
      case Role.SuperAdmin:
        options = [
          Role.SuperAdmin,
          Role.Franchise,
          Role.SalesPerson,
          Role.Packaging,
        ];
        break;
      case Role.Franchise:
        options = [Role.SalesPerson, Role.Packaging];
        break;
      default:
        options = [];
    }

    // In edit mode, ensure the current role is included in options
    if (
      isEditMode &&
      initialValues?.role &&
      !options.includes(initialValues.role)
    ) {
      options.push(initialValues.role);
    }

    return options;
  };

  const showFieldsByRole = (selectedRole: string | undefined) => {
    if (!selectedRole || !user)
      return {
        showFactory: false,
        showFranchise: false,
      };

    switch (selectedRole) {
      case Role.SuperAdmin:
        return {
          showFactory: false,
          showFranchise: false,
        };
      case Role.Franchise:
      case Role.SalesPerson:
      case Role.Packaging:
        // Only show franchise selection if the creator is NOT a Franchise user
        return {
          showFactory: false,
          showFranchise: user.role !== Role.Franchise,
        };
      default:
        return {
          showFactory: false,
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
              {isEditMode ? "Edit Account" : "Create New Account"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  console.error("Form validation errors:", errors);

                  toast({
                    title: "Validation Error",
                    description: "Please check all required fields",
                    variant: "destructive",
                  });
                })}
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
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter password"
                                  {...field}
                                  className="h-11 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-3 text-gray-400 hover:text-blue-500 transition-colors"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                  ) : (
                                    <Eye className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
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
                    {/* Distributor selection removed */}
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
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                  <SelectValue placeholder="Select a franchise" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="shadow-lg border-gray-200">
                                {Array.isArray(franchises) && franchises.map((franchise) => (
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
