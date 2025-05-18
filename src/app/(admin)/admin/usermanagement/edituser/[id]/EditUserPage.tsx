"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/contexts/AuthContext";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";


interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  role: Role;
}

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  role: z.enum(
    ["SuperAdmin", "Distributor", "Franchise", "SalesPerson", "Others"],
    {
      required_error: "Role is required",
    }
  ),
  distributor: z.number().nullable(),
  franchise: z.number().nullable(),
  isActive: z.boolean(),
  factory: z.number().nullable(),
});

export default function EditUserPage({ params }: { params: { id: string } }) {
  const phoneNumber = decodeURIComponent(params.id);
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isActive: true,
      role: undefined,
      distributor: null,
      franchise: null,
      firstName: "",
      lastName: "",
      email: "",
      phone_number: "",
      address: "",
      factory: null,
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/account/users/${encodeURIComponent(phoneNumber)}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data);

        // Set form values
        form.reset({
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          address: data.address,
          role: data.role,
        });

        // Fetch related data based on user role
        if (data.role === Role.Franchise || data.role === Role.SalesPerson) {
          await (data.distributor);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    
  }, [phoneNumber]);

  

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formData = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone_number: values.phone_number,
        address: values.address,
        role: values.role,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/account/users/${encodeURIComponent(phoneNumber)}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }

      toast({
        title: "Success",
        description: "User updated successfully!",
        variant: "default",
      });

      router.push("/admin/usermanagement");
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      case Role.Franchise:
      case Role.SalesPerson:
        return {
          showFactory: false,
          showDistributor: true,
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

  if (loading && !userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/admin/usermanagement")}>
            Back to User Management
          </Button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>User not found</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/admin/usermanagement")}>
            Back to User Management
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full bg-gray-50 py-8">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg border border-gray-200 bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <CardTitle className="flex items-center gap-3 text-2xl md:text-3xl font-bold text-white">
              <Pencil className="w-7 h-7" />
              Edit User: {userData.first_name} {userData.last_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      name="firstName"
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
                      name="lastName"
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
                              disabled
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
                            defaultValue={field.value}
                            disabled={currentUser?.role !== Role.SuperAdmin}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="shadow-lg border-gray-200">
                              {Object.values(Role).map((role) => (
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
                             
                            </Select>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    )}
                   
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Account Status
                          </FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(value === "true")
                            }
                            value={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                <SelectValue placeholder="Select account status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="shadow-lg border-gray-200">
                              <SelectItem value="true">Active</SelectItem>
                              <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/usermanagement")}
                    className="px-6 py-3 h-12 rounded-lg font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-10 py-3 h-12 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 transition-colors text-white shadow-md hover:shadow-lg text-base focus:ring-4 focus:ring-blue-200"
                    disabled={loading}
                  >
                    {loading ? 
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                      : "Update User"
                    }
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